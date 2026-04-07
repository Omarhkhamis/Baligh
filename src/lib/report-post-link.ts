const URL_SCHEME_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export function normalizeReportPostLink(value: string | null | undefined) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) {
        return '';
    }

    const candidate = URL_SCHEME_PATTERN.test(trimmed)
        ? trimmed
        : `https://${trimmed.replace(/^\/+/, '')}`;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }

        return parsed.toString();
    } catch {
        return '';
    }
}
