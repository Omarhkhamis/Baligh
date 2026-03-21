import type { AnalysisResult } from '@/lib/report-generator';

export type RiskLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

function inferViolationType(classification?: string | null) {
    const value = (classification || '').toUpperCase();
    if (value.includes('CATEGORY A')) return 'A';
    if (value.includes('CATEGORY B')) return 'B';
    if (value.includes('CATEGORY C')) return 'C';
    if (value.includes('CATEGORY D')) return 'D';
    if (value.includes('SAFE') || value.includes('NONE')) return 'None';
    return '';
}

function parseSeverityScore(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const numeric = value.split('/')[0]?.trim();
        const parsed = Number.parseFloat(numeric || '0');
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

export function mapRiskLevel(value?: string | null): RiskLevelType {
    const normalized = (value || '').toString().trim().toUpperCase();

    if (
        normalized === 'A' ||
        normalized.includes('CRITICAL') ||
        normalized.includes('CATEGORY A')
    ) {
        return 'CRITICAL';
    }

    if (
        normalized === 'B' ||
        normalized.includes('HIGH') ||
        normalized.includes('CATEGORY B') ||
        normalized.includes('عال')
    ) {
        return 'HIGH';
    }

    if (
        normalized === 'C' ||
        normalized.includes('MEDIUM') ||
        normalized.includes('CATEGORY C') ||
        normalized.includes('متوسط')
    ) {
        return 'MEDIUM';
    }

    return 'LOW';
}

export function normalizeAnalysisResult(raw: Record<string, unknown>, fallbackText = ''): AnalysisResult {
    const classification = (raw.classification || raw.label || raw.category || 'Safe') as string;
    const violation_type = (raw.violation_type || raw.violationType || inferViolationType(classification) || 'None') as string;
    const severity_score = parseSeverityScore(
        raw.severity_score ?? raw.severityScore ?? raw.score ?? raw.scores
    );

    const detected_markers = Array.isArray(raw.detected_markers)
        ? raw.detected_markers.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];

    const rationale_arabic =
        (raw.rationale_arabic ||
            raw.reasoning_ar ||
            raw.reasoning ||
            raw.rationale ||
            'لم يقدم النموذج تفسيراً.') as string;

    const target_group_arabic = (raw.target_group_arabic || raw.target_group || '') as string;
    const image_description = (raw.image_description || '') as string;

    return {
        ...(raw as unknown as Partial<AnalysisResult>),
        classification,
        violation_type,
        severity_score,
        rationale_arabic,
        awareness_note_arabic: (raw.awareness_note_arabic || '') as string,
        target_group_arabic,
        detected_markers,
        target_group: target_group_arabic,
        reasoning_ar: rationale_arabic,
        image_description,
        risk_level: (raw.risk_level || raw.riskLevel || mapRiskLevel(violation_type)) as string,
        text: (raw.text || raw.inputText || raw.input || raw.originalText || fallbackText) as string,
    };
}

export function getSeverityScoreOutOfFive(score?: number) {
    const normalized = Math.max(0, Math.min(10, Number(score || 0)));
    return Math.max(1, Math.min(5, Math.round(normalized / 2)));
}
