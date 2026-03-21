import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildEncryptedAnalysisLogFields, toDateOnlyTimestamp } from '@/lib/data-security';

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
            originalText,
            aiClassification,
            aiRiskLevel,
            severityScore,
            userCorrection,
            userReasoning,
            additionalContext,
            timestamp,
        } = body || {};

        if (!originalText || !aiClassification || !userCorrection || !userReasoning) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const riskLevel = mapRiskLevel(aiRiskLevel);

        const createdAt = toDateOnlyTimestamp(timestamp ? new Date(timestamp) : new Date());

        const analysis = await prisma.analysisLog.create({
            data: {
                ...buildEncryptedAnalysisLogFields(originalText, []),
                classification: aiClassification,
                riskLevel,
                confidenceScore: typeof severityScore === 'number' ? severityScore : 0,
                aiScores: {
                    aiRiskLevel,
                    severityScore: severityScore ?? null,
                    userCorrection,
                    additionalContext: additionalContext || '',
                    received_date: createdAt.toISOString().slice(0, 10),
                },
                createdAt,
            },
        });

        const feedback = await prisma.feedbackSubmission.create({
            data: {
                analysisLogId: analysis.id,
                message: userReasoning,
                contactEmail: null,
                createdAt,
            },
        });

        return NextResponse.json({ success: true, feedback, analysis });
    } catch (error) {
        console.error('Error saving user feedback', error);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
}
