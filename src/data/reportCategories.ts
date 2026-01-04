export type ReportCategoryKey = 'initiative' | 'analytical' | 'study' | 'infographic' | 'policy' | 'other';

export const REPORT_CATEGORIES: Record<ReportCategoryKey, { label: string; icon: string; color: string }> = {
    initiative: { label: 'Initiative Reports', icon: '🗂️', color: 'blue' },
    analytical: { label: 'Analytical Reports', icon: '📊', color: 'green' },
    study: { label: 'Studies', icon: '📘', color: 'purple' },
    infographic: { label: 'Infographics', icon: '🖼️', color: 'orange' },
    policy: { label: 'Policy Briefs', icon: '📝', color: 'teal' },
    other: { label: 'Other', icon: '🗃️', color: 'gray' },
};
