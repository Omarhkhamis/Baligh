import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSeverityScoreOutOfFive, mapRiskLevel } from '@/lib/analysis-utils';
import { generateReportNumber, isUniqueConstraintError } from '@/lib/report-number';
import { buildEncryptedAnalysisLogFields, toDateOnlyTimestamp } from '@/lib/data-security';
import { buildStructuredAiFields } from '@/lib/structured-report-fields';
import { canonicalizeKnownTargetGroupValues } from '@/lib/target-groups';

const REPORT_PLATFORM_VALUES = ['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other'] as const;
const DIRECT_RISK_VALUES = ['yes', 'no', 'unknown'] as const;

function normalizePlatformValue(value: unknown) {
    return REPORT_PLATFORM_VALUES.includes(String(value || '').trim() as (typeof REPORT_PLATFORM_VALUES)[number])
        ? (String(value).trim() as (typeof REPORT_PLATFORM_VALUES)[number])
        : 'other';
}

function normalizeDirectRiskValue(value: unknown) {
    return DIRECT_RISK_VALUES.includes(String(value || '').trim() as (typeof DIRECT_RISK_VALUES)[number])
        ? (String(value).trim() as (typeof DIRECT_RISK_VALUES)[number])
        : 'unknown';
}

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
            platform,
            platform_label,
            immediate_danger,
            immediate_danger_label,
            timestamp,
        } = body || {};

        // Allow submissions even if text/classification missing; use safe fallbacks
        if (!post_link && !text) {
            return NextResponse.json({ error: 'Missing post link or text' }, { status: 400 });
        }

        const safeText = text || `Report link: ${post_link}`;
        const safeClassification = classification || 'Report';
        const safeRisk = risk_level || 'Low';
        const submittedAt = toDateOnlyTimestamp(timestamp ? new Date(timestamp) : new Date());
        const numericSeverity = typeof severity_score === 'number' ? severity_score : 0;
        const escalationFlag = getSeverityScoreOutOfFive(numericSeverity) === 5;
        const humanReviewStatus = escalationFlag ? 'escalated' : 'pending';
        const selectedTargetGroupLabels = canonicalizeKnownTargetGroupValues(target_group ? [target_group] : []);
        const structuredAi = buildStructuredAiFields({
            analysis: {
                classification: safeClassification,
                violation_type: risk_level || '',
                severity_score: numericSeverity,
                target_group_arabic: target_group || '',
                target_group: target_group || '',
                rationale_arabic: reasoning_ar || '',
                image_description: image_description || '',
            },
            selectedTargetGroupLabels,
            analysisText: safeText,
            hasImage: Boolean(image_description),
            escalationFlag,
        });

        const details = [
            platform ? `Platform: ${platform}` : null,
            post_link ? `Post link: ${post_link}` : null,
            reporter_country ? `Reporter country: ${reporter_country}` : null,
            target_group ? `Target group: ${target_group}` : null,
            immediate_danger ? `Immediate danger: ${immediate_danger}` : null,
            reasoning_ar ? `Reasoning: ${reasoning_ar}` : null,
            image_description ? `Image description: ${image_description}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const { analysis, legalReport } = await prisma.$transaction(async (tx) => {
                    const riskLevel = mapRiskLevel(safeRisk);
                    const analysis = await tx.analysisLog.create({
                        data: {
                            ...buildEncryptedAnalysisLogFields(
                                safeText,
                                structuredAi.aiHateKeywords.length > 0 ? structuredAi.aiHateKeywords : selectedTargetGroupLabels
                            ),
                            classification: safeClassification,
                            riskLevel,
                            confidenceScore: numericSeverity,
                            aiClassification: structuredAi.aiClassification,
                            aiSeverity: structuredAi.aiSeverity,
                            aiSeverityExplanation: structuredAi.aiSeverityExplanation,
                            aiSpeechType: structuredAi.aiSpeechType,
                            aiConfidence: structuredAi.aiConfidence,
                            aiContextSensitivity: structuredAi.aiContextSensitivity,
                            aiTargetGroups: structuredAi.aiTargetGroups,
                            aiSymbolicReferences: structuredAi.aiSymbolicReferences,
                            aiEmotionsDetected: structuredAi.aiEmotionsDetected,
                            aiDehumanizationLevel: structuredAi.aiDehumanizationLevel,
                            aiGeneralizationType: structuredAi.aiGeneralizationType,
                            aiAccountType: structuredAi.aiAccountType,
                            aiReachLevel: structuredAi.aiReachLevel,
                            aiContentType: structuredAi.aiContentType,
                            aiLanguageRegister: structuredAi.aiLanguageRegister,
                            aiConflictContext: structuredAi.aiConflictContext,
                            aiPublisherLocation: structuredAi.aiPublisherLocation,
                            aiRecommendedPath: structuredAi.aiRecommendedPath,
                            aiPathSentence: structuredAi.aiPathSentence,
                            aiLegalBasis: structuredAi.aiLegalBasis,
                            aiEscalationFlag: structuredAi.aiEscalationFlag,
                            aiIncitementToAction: structuredAi.aiIncitementToAction,
                            aiGlorificationOfViolence: structuredAi.aiGlorificationOfViolence,
                            aiNotes: structuredAi.aiNotes,
                            aiScores: {
                                reasoning: reasoning_ar || '',
                                rationale: reasoning_ar || '',
                                imageDescription: image_description || '',
                                postLink: post_link || '',
                                reporterCountry: reporter_country || '',
                                targetGroup: selectedTargetGroupLabels.join(', ') || target_group || '',
                                target_group: selectedTargetGroupLabels.join(', ') || target_group || '',
                                target_group_label: selectedTargetGroupLabels.join(', ') || target_group || '',
                                platform: platform || '',
                                platformLabel: platform_label || platform || '',
                                immediateDanger: immediate_danger || '',
                                immediateDangerLabel: immediate_danger_label || immediate_danger || '',
                                ai_classification: structuredAi.aiClassification,
                                ai_severity: structuredAi.aiSeverity,
                                ai_path_sentence: structuredAi.aiPathSentence,
                                ai_recommended_path: structuredAi.aiRecommendedPath,
                                received_date: submittedAt.toISOString().slice(0, 10),
                            },
                            createdAt: submittedAt,
                        },
                    });

                    const reportNumber = await generateReportNumber(tx, submittedAt, attempt);
                    const legalReport = await tx.legalReport.create({
                        data: {
                            analysisLogId: analysis.id,
                            title: `User report - ${safeClassification}`,
                            details: details || 'User legal report submission',
                            aiProcessingStatus: 'done',
                            reportNumber,
                            escalationFlag,
                            humanReviewStatus,
                            platform: normalizePlatformValue(platform),
                            postUrl: post_link || null,
                            targetGroupsUser: selectedTargetGroupLabels,
                            isDirectRisk: normalizeDirectRiskValue(immediate_danger),
                            createdAt: submittedAt,
                        },
                    });

                    return { analysis, legalReport };
                });

                return NextResponse.json({
                    success: true,
                    analysis,
                    legalReport,
                    reportNumber: legalReport.reportNumber,
                });
            } catch (error) {
                if (isUniqueConstraintError(error) && attempt < 4) {
                    continue;
                }
                throw error;
            }
        }

        return NextResponse.json({ error: 'Failed to generate report number' }, { status: 500 });
    } catch (error) {
        console.error('Error saving legal report', error);
        return NextResponse.json({ error: 'Failed to save legal report' }, { status: 500 });
    }
}
