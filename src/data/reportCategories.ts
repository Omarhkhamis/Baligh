export type ReportCategoryKey = 'initiative' | 'analytical' | 'study' | 'infographic' | 'policy' | 'other';

export const REPORT_CATEGORIES: Record<ReportCategoryKey, { label: string; icon: string; color: string }> = {
    initiative: { label: 'Initiative Reports', icon: '🗂️', color: 'blue' },
    analytical: { label: 'Analytical Reports', icon: '📊', color: 'green' },
    study: { label: 'Studies', icon: '📘', color: 'purple' },
    infographic: { label: 'Infographics', icon: '🖼️', color: 'orange' },
    policy: { label: 'Policy Briefs', icon: '📝', color: 'teal' },
    other: { label: 'Other', icon: '🗃️', color: 'gray' },
};

export function normalizeReportCategory(category?: string | null): ReportCategoryKey {
    if (!category) return 'other';

    const lower = category.toLowerCase();
    if (lower in REPORT_CATEGORIES) {
        return lower as ReportCategoryKey;
    }

    switch (lower) {
        case 'monthly_report':
            return 'initiative';
        case 'research':
            return 'analytical';
        case 'infographic':
            return 'infographic';
        case 'policy_brief':
            return 'policy';
        case 'other':
            return 'other';
        default:
            return 'other';
    }
}
