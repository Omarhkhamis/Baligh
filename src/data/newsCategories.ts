export type NewsCategoryKey = 'training' | 'media' | 'event' | 'achievement' | 'statement' | 'other';

export const NEWS_CATEGORIES: Record<NewsCategoryKey, { label: string; icon: string; color: string }> = {
    training: { label: 'Training', icon: '📚', color: 'blue' },
    media: { label: 'Media Interviews', icon: '🎤', color: 'purple' },
    event: { label: 'Event Participation', icon: '🤝', color: 'green' },
    achievement: { label: 'Updates', icon: '🏆', color: 'yellow' },
    statement: { label: 'Statements', icon: '📢', color: 'red' },
    other: { label: 'Other', icon: '🗂️', color: 'gray' },
};
