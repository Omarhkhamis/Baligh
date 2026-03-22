import { getSeverityScoreOutOfFive } from '@/lib/analysis-utils';
import type { AnalysisResult } from '@/lib/report-generator';
import { canonicalizeTargetGroupValues } from '@/lib/target-groups';

const aiClassificationValues = ['explicit', 'implicit', 'incitement', 'none'] as const;
const aiSpeechTypeValues = ['direct', 'implicit', 'symbolic', 'false_propaganda'] as const;
const aiConfidenceValues = ['high', 'medium', 'low'] as const;
const aiContextSensitivityValues = ['high', 'medium', 'low'] as const;
const aiEmotionValues = [
    'hatred',
    'anger',
    'contempt',
    'gloating',
    'fear',
    'generalization',
    'revenge_desire',
    'other',
] as const;
const aiDehumanizationValues = ['none', 'implicit', 'explicit'] as const;
const aiGeneralizationValues = ['individual_to_group', 'geographic', 'religious', 'ethnic', 'none'] as const;
const aiAccountTypeValues = ['personal', 'media', 'political', 'religious', 'anonymous', 'military'] as const;
const aiReachValues = ['limited', 'moderate', 'wide'] as const;
const aiContentTypeValues = ['text', 'image', 'video', 'meme', 'comment', 'live_stream'] as const;
const aiLanguageRegisterValues = ['formal', 'colloquial', 'symbolic', 'mixed'] as const;
const aiConflictContextValues = ['active_conflict', 'tense', 'stable'] as const;
const aiRecommendedPathValues = ['legal_action', 'documentation', 'monitoring', 'no_action'] as const;

type AiClassificationValue = (typeof aiClassificationValues)[number];
type AiSpeechTypeValue = (typeof aiSpeechTypeValues)[number];
type AiConfidenceValue = (typeof aiConfidenceValues)[number];
type AiContextSensitivityValue = (typeof aiContextSensitivityValues)[number];
type AiEmotionValue = (typeof aiEmotionValues)[number];
type AiDehumanizationValue = (typeof aiDehumanizationValues)[number];
type AiGeneralizationValue = (typeof aiGeneralizationValues)[number];
type AiAccountTypeValue = (typeof aiAccountTypeValues)[number];
type AiReachValue = (typeof aiReachValues)[number];
type AiContentTypeValue = (typeof aiContentTypeValues)[number];
type AiLanguageRegisterValue = (typeof aiLanguageRegisterValues)[number];
type AiConflictContextValue = (typeof aiConflictContextValues)[number];
type AiRecommendedPathValue = (typeof aiRecommendedPathValues)[number];

type StructuredAiFields = {
    aiSeverity: number;
    aiSeverityExplanation: string;
    aiSpeechType: AiSpeechTypeValue;
    aiConfidence: AiConfidenceValue;
    aiContextSensitivity: AiContextSensitivityValue;
    aiTargetGroups: string[];
    aiHateKeywords: string[];
    aiSymbolicReferences: string[];
    aiEmotionsDetected: AiEmotionValue[];
    aiDehumanizationLevel: AiDehumanizationValue;
    aiGeneralizationType: AiGeneralizationValue;
    aiAccountType: AiAccountTypeValue;
    aiReachLevel: AiReachValue;
    aiContentType: AiContentTypeValue;
    aiLanguageRegister: AiLanguageRegisterValue;
    aiConflictContext: AiConflictContextValue;
    aiPublisherLocation: string | null;
    aiRecommendedPath: AiRecommendedPathValue;
    aiPathSentence: string;
    aiLegalBasis: string | null;
    aiEscalationFlag: boolean;
    aiIncitementToAction: boolean;
    aiGlorificationOfViolence: boolean;
    aiNotes: string | null;
    aiClassification: AiClassificationValue;
};

function normalizeString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown) {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    const normalized = normalizeString(value);
    if (!normalized) {
        return [] as string[];
    }

    return normalized
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function dedupe(values: string[]) {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeEnumValue<T extends string>(
    value: unknown,
    allowed: readonly T[],
    fallback: T
): T {
    const normalized = normalizeString(value).toLowerCase() as T;
    return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeEmotionValue(value: string): AiEmotionValue {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return 'other';
    if (normalized.includes('hate') || normalized.includes('كره') || normalized.includes('hatred')) return 'hatred';
    if (normalized.includes('anger') || normalized.includes('غضب')) return 'anger';
    if (normalized.includes('contempt') || normalized.includes('احتقار')) return 'contempt';
    if (normalized.includes('gloat') || normalized.includes('شمات')) return 'gloating';
    if (normalized.includes('fear') || normalized.includes('خوف')) return 'fear';
    if (normalized.includes('general') || normalized.includes('تعميم')) return 'generalization';
    if (normalized.includes('revenge') || normalized.includes('انتقام')) return 'revenge_desire';
    return aiEmotionValues.includes(normalized as AiEmotionValue) ? (normalized as AiEmotionValue) : 'other';
}

function inferAiClassification(analysis: AnalysisResult): AiClassificationValue {
    const direct = normalizeEnumValue(
        (analysis as AnalysisResult & { ai_classification?: string }).ai_classification,
        aiClassificationValues,
        'none'
    );
    if (direct !== 'none') {
        return direct;
    }

    const violationType = normalizeString(analysis.violation_type).toUpperCase();
    if (violationType === 'A' || violationType === 'B') return 'incitement';
    if (violationType === 'C') return 'explicit';
    if (violationType === 'D') return 'implicit';
    return 'none';
}

function inferGeneralizationType(targetGroups: string[]): AiGeneralizationValue {
    const normalized = targetGroups.join(' ').toLowerCase();
    if (!normalized) return 'none';
    if (/(druze|sunni|alawite|christian|مسلم|سن[ةي]|علوي|درزي|مسيحي)/i.test(normalized)) return 'religious';
    if (/(kurd|arab|كرد|عرب)/i.test(normalized)) return 'ethnic';
    if (/(damascus|aleppo|idlib|حمص|حلب|دمشق|إدلب)/i.test(normalized)) return 'geographic';
    return 'individual_to_group';
}

function inferPathSentence(path: AiRecommendedPathValue) {
    if (path === 'legal_action') {
        return 'تشير المؤشرات الحالية إلى مسار قانوني أولي مع حاجة إلى مراجعة بشرية متخصصة قبل أي إجراء.';
    }
    if (path === 'monitoring') {
        return 'يُنصح بإحالة هذا المحتوى إلى مسار الرصد والمتابعة مع مراجعة بشرية لتقدير التصعيد المحتمل.';
    }
    if (path === 'documentation') {
        return 'يُنصح بحفظ هذا البلاغ ضمن مسار التوثيق والمتابعة الأولية دون إجراء قانوني فوري.';
    }
    return 'لا تظهر المؤشرات الحالية ما يكفي لإطلاق مسار إجرائي، مع إبقاء البلاغ موثقاً للمراجعة البشرية.';
}

function inferRecommendedPath(aiClassification: AiClassificationValue, severity: number): AiRecommendedPathValue {
    if (aiClassification === 'none') {
        return 'no_action';
    }
    if (severity >= 4) {
        return 'legal_action';
    }
    if (severity === 3) {
        return 'monitoring';
    }
    return 'documentation';
}

function looksLikeIncitementToAction(text: string) {
    return /(اقتلو|اقتلوا|اطردوا|اطردو|احرقوا|احرقو|هاجموا|هاجمو|نظفوا|قاتلوا|kill|expel|burn|attack|cleanse)/i.test(text);
}

function looksLikeGlorification(text: string) {
    return /(نفتخر|فخر|مجد|أبطال|بطولي|سحقنا|أبدنا|hero|glory|proud|victory)/i.test(text);
}

export function buildStructuredAiFields(input: {
    analysis: AnalysisResult;
    selectedTargetGroupLabels: string[];
    analysisText: string;
    hasImage: boolean;
    escalationFlag: boolean;
}): StructuredAiFields {
    const { analysis, selectedTargetGroupLabels, analysisText, hasImage, escalationFlag } = input;
    const aiClassification = inferAiClassification(analysis);
    const aiSeverity = Math.max(
        aiClassification === 'none' ? 1 : 2,
        Math.min(
            5,
            Number.isFinite(Number(analysis.ai_severity))
                ? Number(analysis.ai_severity)
                : getSeverityScoreOutOfFive(Number(analysis.severity_score || 0))
        )
    );
    const aiTargetGroups = canonicalizeTargetGroupValues([
        ...normalizeStringArray(analysis.ai_target_groups),
        ...selectedTargetGroupLabels,
        normalizeString(analysis.target_group_arabic),
        normalizeString(analysis.target_group),
    ]);
    const aiHateKeywords = dedupe([
        ...normalizeStringArray(analysis.ai_hate_keywords),
        ...normalizeStringArray(analysis.detected_markers),
    ]);
    const aiSymbolicReferences = dedupe(normalizeStringArray(analysis.ai_symbolic_references));
    const aiEmotionsDetected = dedupe(normalizeStringArray(analysis.ai_emotions_detected))
        .map((value) => normalizeEmotionValue(value))
        .filter((value, index, array) => array.indexOf(value) === index);

    const aiSpeechType = normalizeEnumValue(
        analysis.ai_speech_type,
        aiSpeechTypeValues,
        aiSymbolicReferences.length > 0 ? 'symbolic' : aiClassification === 'implicit' ? 'implicit' : 'direct'
    );
    const aiConfidence = normalizeEnumValue(
        analysis.ai_confidence,
        aiConfidenceValues,
        aiSeverity >= 4 ? 'high' : aiSeverity >= 2 ? 'medium' : 'low'
    );
    const aiContextSensitivity = normalizeEnumValue(
        analysis.ai_context_sensitivity,
        aiContextSensitivityValues,
        aiSymbolicReferences.length > 0 || aiTargetGroups.length > 0 ? 'high' : 'medium'
    );
    const aiDehumanizationLevel = normalizeEnumValue(
        analysis.ai_dehumanization_level,
        aiDehumanizationValues,
        aiClassification === 'explicit' ? 'explicit' : aiClassification === 'implicit' ? 'implicit' : 'none'
    );
    const aiGeneralizationType = normalizeEnumValue(
        analysis.ai_generalization_type,
        aiGeneralizationValues,
        inferGeneralizationType(aiTargetGroups)
    );
    const aiAccountType = normalizeEnumValue(
        analysis.ai_account_type,
        aiAccountTypeValues,
        'anonymous'
    );
    const aiReachLevel = normalizeEnumValue(
        analysis.ai_reach_level,
        aiReachValues,
        aiSeverity >= 4 ? 'wide' : aiSeverity >= 2 ? 'moderate' : 'limited'
    );
    const aiContentType = normalizeEnumValue(
        analysis.ai_content_type,
        aiContentTypeValues,
        hasImage ? 'image' : 'text'
    );
    const aiLanguageRegister = normalizeEnumValue(
        analysis.ai_language_register,
        aiLanguageRegisterValues,
        aiSpeechType === 'symbolic' ? 'symbolic' : 'mixed'
    );
    const aiConflictContext = normalizeEnumValue(
        analysis.ai_conflict_context,
        aiConflictContextValues,
        'tense'
    );
    const aiRecommendedPath = normalizeEnumValue(
        analysis.ai_recommended_path,
        aiRecommendedPathValues,
        inferRecommendedPath(aiClassification, aiSeverity)
    );
    const aiIncitementToAction =
        typeof analysis.ai_incitement_to_action === 'boolean'
            ? analysis.ai_incitement_to_action
            : looksLikeIncitementToAction(analysisText);
    const aiGlorificationOfViolence =
        typeof analysis.ai_glorification_of_violence === 'boolean'
            ? analysis.ai_glorification_of_violence
            : looksLikeGlorification(analysisText);

    return {
        aiClassification,
        aiSeverity,
        aiSeverityExplanation:
            normalizeString(analysis.ai_severity_explanation) ||
            normalizeString(analysis.rationale_arabic) ||
            normalizeString(analysis.reasoning_ar) ||
            'التقدير الأولي يشير إلى مستوى الشدة الموضح أعلاه وفق مؤشرات النص والسياق.',
        aiSpeechType,
        aiConfidence,
        aiContextSensitivity,
        aiTargetGroups,
        aiHateKeywords,
        aiSymbolicReferences,
        aiEmotionsDetected,
        aiDehumanizationLevel,
        aiGeneralizationType,
        aiAccountType,
        aiReachLevel,
        aiContentType,
        aiLanguageRegister,
        aiConflictContext,
        aiPublisherLocation: normalizeString(analysis.ai_publisher_location) || null,
        aiRecommendedPath,
        aiPathSentence: normalizeString(analysis.ai_path_sentence) || inferPathSentence(aiRecommendedPath),
        aiLegalBasis: normalizeString(analysis.ai_legal_basis) || null,
        aiEscalationFlag:
            typeof analysis.ai_escalation_flag === 'boolean' ? analysis.ai_escalation_flag : escalationFlag,
        aiIncitementToAction,
        aiGlorificationOfViolence,
        aiNotes: normalizeString(analysis.ai_notes) || null,
    };
}
