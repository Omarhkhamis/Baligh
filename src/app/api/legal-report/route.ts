import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RiskLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const mapRiskLevel = (value: string | null | undefined): RiskLevelType => {
    const normalized = (value || '').toLowerCase();
    if (normalized.includes('critical')) return 'CRITICAL';
    if (normalized.includes('high') || normalized.includes('عال')) return 'HIGH';
    if (normalized.includes('medium') || normalized.includes('متوسط')) return 'MEDIUM';
    return 'LOW';
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            text,
            classification,
            severity_score,
            risk_level,
            reasoning_ar,
            image_description,
            post_link,
            reporter_country,
            target_group,
            timestamp,
        } = body || {};

        // Allow submissions even if text/classification missing; use safe fallbacks
        if (!post_link && !text) {
            return NextResponse.json({ error: 'Missing post link or text' }, { status: 400 });
        }

        const safeText = text || `Report link: ${post_link}`;
        const safeClassification = classification || 'Report';
        const safeRisk = risk_level || 'Low';

        const riskLevel = mapRiskLevel(safeRisk);
        const analysis = await prisma.analysisLog.create({
            data: {
                inputText: safeText,
                classification: safeClassification,
                riskLevel,
                confidenceScore: typeof severity_score === 'number' ? severity_score : 0,
                detectedKeywords: target_group ? [target_group] : [],
                aiScores: {
                    reasoning: reasoning_ar || '',
                    imageDescription: image_description || '',
                    postLink: post_link || '',
                    reporterCountry: reporter_country || '',
                    targetGroup: target_group || '',
                },
                createdAt: timestamp ? new Date(timestamp) : undefined,
            },
        });

        const details = [
            post_link ? `Post link: ${post_link}` : null,
            reporter_country ? `Reporter country: ${reporter_country}` : null,
            target_group ? `Target group: ${target_group}` : null,
            reasoning_ar ? `Reasoning: ${reasoning_ar}` : null,
            image_description ? `Image description: ${image_description}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        const legalReport = await prisma.legalReport.create({
            data: {
                analysisLogId: analysis.id,
                title: `User report - ${classification}`,
                details: details || 'User legal report submission',
            },
        });

        return NextResponse.json({ success: true, analysis, legalReport });
    } catch (error) {
        console.error('Error saving legal report', error);
        return NextResponse.json({ error: 'Failed to save legal report' }, { status: 500 });
    }
}
