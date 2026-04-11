import type { AnalysisResult } from '@/lib/report-generator';

export type RiskLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

function inferViolationType(classification?: string | null) {
    const value = (classification || '').toUpperCase();
    if (value.includes('CATEGORY A')) return 'A';
    if (value.includes('CATEGORY B')) return 'B';
    if (value.includes('CATEGORY C')) return 'C';
    if (value.includes('CATEGORY D')) return 'D';
    if (value.includes('CATEGORY T')) return 'T';
    if (value.includes('SAFE') || value.includes('NONE') || value.includes('INCOMPLETE')) return 'None';
    return '';
}

function parseNumeric(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const numeric = value.split('/')[0]?.trim();
        const parsed = Number.parseFloat(numeric || '');
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function parseSeverityScore(value: unknown) {
    return parseNumeric(value);
}

function parseSeverityLevel(value: unknown) {
    const parsed = parseNumeric(value);
    if (parsed === null) {
        return null;
    }

    return parsed <= 5 ? parsed * 2 : parsed;
}

function normalizeDelimitedString(value: unknown, separators: RegExp) {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value !== 'string') {
        return [] as string[];
    }

    return value
        .split(separators)
        .map((item) => item.trim())
        .filter(Boolean);
}

function inferIdentityBased(classification: string) {
    const violationType = inferViolationType(classification);
    if (violationType === 'A' || violationType === 'B' || violationType === 'C' || violationType === 'D') {
        return 'Yes';
    }

    return 'No';
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
        normalized === 'T' ||
        normalized.includes('HIGH') ||
        normalized.includes('CATEGORY B') ||
        normalized.includes('CATEGORY T') ||
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
    const severity_score =
        parseSeverityScore(raw.severity_score ?? raw.severityScore ?? raw.score ?? raw.scores) ??
        parseSeverityLevel(raw.severity) ??
        0;

    const detected_markers = Array.from(
        new Set([
            ...normalizeDelimitedString(raw.detected_markers, /[|,]/),
            ...normalizeDelimitedString(raw.hateful_words, /\|/),
        ])
    );

    const rationale_arabic =
        (raw.rationale_arabic ||
            raw.reasoning_ar ||
            raw.reasoning ||
            raw.rationale ||
            'لم يقدم النموذج تفسيراً.') as string;

    const target_group_arabic = (raw.target_group_arabic || raw.target_group || '') as string;
    const image_description =
        typeof raw.image_description === 'string' ? raw.image_description : '';

    return {
        ...(raw as unknown as Partial<AnalysisResult>),
        classification,
        violation_type,
        is_identity_based: (raw.is_identity_based || inferIdentityBased(classification)) as string,
        severity_score,
        rationale_arabic,
        rationale: rationale_arabic,
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
