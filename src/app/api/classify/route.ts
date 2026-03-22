import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeContent } from '@/lib/analysis-service';
import { getSeverityScoreOutOfFive, mapRiskLevel } from '@/lib/analysis-utils';
import { buildEncryptedAnalysisLogFields, toDateOnlyTimestamp } from '@/lib/data-security';
import { buildStructuredAiFields } from '@/lib/structured-report-fields';
import { canonicalizeTargetGroupValues } from '@/lib/target-groups';

export async function POST(req: NextRequest) {
    try {
        const { text, image, locale = 'ar' } = await req.json();
        const analysis = await analyzeContent({ text, image, locale });

        try {
            const severity = Math.max(0, Math.min(9.9999, Number(analysis.severity_score || 0)));
            const riskLevel = mapRiskLevel(
                analysis.violation_type ?? analysis.risk_level ?? analysis.classification
            );
            const detectedKeywords = Array.from(
                new Set(
                    [
                        ...(analysis.detected_markers || []),
                        analysis.target_group_arabic || '',
                    ].filter(Boolean)
                )
            );
            const selectedTargetGroupLabels = canonicalizeTargetGroupValues([
                analysis.target_group_arabic || '',
                analysis.target_group || '',
            ]);
            const structuredAi = buildStructuredAiFields({
                analysis,
                selectedTargetGroupLabels,
                analysisText: text || '',
                hasImage: Boolean(image),
                escalationFlag: getSeverityScoreOutOfFive(severity) === 5,
            });
            const {
                detected_markers: _detectedMarkers,
                ai_hate_keywords: _aiHateKeywords,
                ai_notes: _aiNotes,
                ai_legal_basis: _aiLegalBasis,
                ...analysisForStorage
            } = analysis;

            await prisma.analysisLog.create({
                data: {
                    ...buildEncryptedAnalysisLogFields(
                        text || '',
                        structuredAi.aiHateKeywords.length > 0 ? structuredAi.aiHateKeywords : detectedKeywords
                    ),
                    classification: analysis.classification || 'Unknown',
                    riskLevel,
                    confidenceScore: severity,
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
                        ...analysisForStorage,
                        speech_type: analysis.classification,
                        rationale: analysis.rationale_arabic || analysis.rationale || '',
                        target_group: selectedTargetGroupLabels.join(', ') || analysis.target_group_arabic || analysis.target_group || '',
                        target_group_label: selectedTargetGroupLabels.join(', ') || analysis.target_group_arabic || analysis.target_group || '',
                        ai_classification: structuredAi.aiClassification,
                        ai_severity: structuredAi.aiSeverity,
                        ai_path_sentence: structuredAi.aiPathSentence,
                        ai_recommended_path: structuredAi.aiRecommendedPath,
                        risk_label: riskLevel,
                        locale,
                        has_image: Boolean(image),
                        received_date: toDateOnlyTimestamp(new Date()).toISOString().slice(0, 10),
                    },
                    createdAt: toDateOnlyTimestamp(new Date()),
                },
            });
        } catch (dbError) {
            console.error('Error saving analysis log:', dbError);
        }

        const {
            ai_hate_keywords: _responseAiHateKeywords,
            ai_notes: _responseAiNotes,
            ai_legal_basis: _responseAiLegalBasis,
            ai_escalation_flag: _responseAiEscalationFlag,
            ...publicAnalysis
        } = analysis;

        return NextResponse.json(publicAnalysis);
    } catch (error: unknown) {
        console.error('Error in /api/classify:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: errorMessage || 'Internal Server Error',
                details: String(error),
            },
            { status: 500 }
        );
    }
}
