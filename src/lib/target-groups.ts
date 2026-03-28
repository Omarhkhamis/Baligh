export const TARGET_GROUP_KEYS = [
    'druze',
    'sunniMuslims',
    'alawites',
    'kurds',
    'arabs',
    'christians',
    'womenChildren',
    'otherGroupsMinorities',
    'unspecified',
] as const;

export type TargetGroupKey = (typeof TARGET_GROUP_KEYS)[number];

const TARGET_GROUP_CANONICAL_LABEL_BY_KEY: Record<TargetGroupKey, string> = {
    druze: 'Druze',
    sunniMuslims: 'Sunni Muslims',
    alawites: 'Alawites',
    kurds: 'Kurds',
    arabs: 'Arabs',
    christians: 'Christians',
    womenChildren: 'Women / Children',
    otherGroupsMinorities: 'Other Groups / Minorities',
    unspecified: 'Unspecified',
};

function normalizeTargetGroupAlias(value: string) {
    return value
        .normalize('NFKC')
        .trim()
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\s*\/\s*/g, ' / ')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');
}

const TARGET_GROUP_ALIAS_MAP: Record<string, TargetGroupKey | TargetGroupKey[]> = {
    druze: 'druze',
    'دروز': 'druze',
    'الدروز': 'druze',
    'طائفة الموحدين الدروز': 'druze',
    'dîrûz': 'druze',

    'sunni muslims': 'sunniMuslims',
    sunni: 'sunniMuslims',
    sunnis: 'sunniMuslims',
    'sunni muslim': 'sunniMuslims',
    'مسلمون سنة': 'sunniMuslims',
    'مسلمون سنه': 'sunniMuslims',
    'المسلمون السنة': 'sunniMuslims',
    'المسلمون السنه': 'sunniMuslims',
    'أهل السنة والجماعة': 'sunniMuslims',
    'السنة': 'sunniMuslims',
    'السنه': 'sunniMuslims',
    'misilmanên sunnî': 'sunniMuslims',

    alawites: 'alawites',
    alawite: 'alawites',
    'علويون': 'alawites',
    'العلويون': 'alawites',
    'العلويين': 'alawites',
    'elewî': 'alawites',

    kurds: 'kurds',
    kurd: 'kurds',
    kurdish: 'kurds',
    'كرد': 'kurds',
    'الكرد': 'kurds',
    'الأكراد': 'kurds',

    arabs: 'arabs',
    arab: 'arabs',
    'عرب': 'arabs',
    'العرب': 'arabs',
    ereb: 'arabs',

    christians: 'christians',
    christian: 'christians',
    'مسيحيين': 'christians',
    'مسيحيون': 'christians',
    'المسيحيين': 'christians',
    'mesîhî': 'christians',

    'women / children': 'womenChildren',
    'women/children': 'womenChildren',
    'women and children': 'womenChildren',
    women: 'womenChildren',
    children: 'womenChildren',
    'نساء / أطفال': 'womenChildren',
    'نساء/أطفال': 'womenChildren',
    'نساء وأطفال': 'womenChildren',
    'جین / زارۆک': 'womenChildren',
    'jin / zarok': 'womenChildren',
    'jin/zarok': 'womenChildren',
    'jin zarok': 'womenChildren',

    'other groups / minorities': 'otherGroupsMinorities',
    'other groups/minorities': 'otherGroupsMinorities',
    'other groups minorities': 'otherGroupsMinorities',
    'other minorities': 'otherGroupsMinorities',
    'أقليات أخرى': 'otherGroupsMinorities',
    'الأرمن': 'otherGroupsMinorities',
    'الإيزيديون': 'otherGroupsMinorities',
    'الشيعة': 'otherGroupsMinorities',
    'النازحون': 'otherGroupsMinorities',
    'أهل إدلب': 'otherGroupsMinorities',
    'kêmîneyên din': 'otherGroupsMinorities',

    unspecified: 'unspecified',
    'غير محدد': 'unspecified',
    nediyar: 'unspecified',

    'السنة والعلويين': ['sunniMuslims', 'alawites'],
    'السنه والعلويين': ['sunniMuslims', 'alawites'],
};

export function isTargetGroupKey(value: string): value is TargetGroupKey {
    return (TARGET_GROUP_KEYS as readonly string[]).includes(value);
}

export function getCanonicalTargetGroupLabelByKey(key: TargetGroupKey) {
    return TARGET_GROUP_CANONICAL_LABEL_BY_KEY[key];
}

export function getTargetGroupKeyFromValue(value: string | null | undefined): TargetGroupKey | null {
    const source = typeof value === 'string' ? value.trim() : '';
    if (!source) {
        return null;
    }

    if (isTargetGroupKey(source)) {
        return source;
    }

    const normalized = normalizeTargetGroupAlias(source);
    const alias = TARGET_GROUP_ALIAS_MAP[normalized];
    if (!alias) {
        if (normalized.includes('دروز') || normalized.includes('druze')) return 'druze';
        if (normalized.includes('سنة') || normalized.includes('سنه') || normalized.includes('sunni')) return 'sunniMuslims';
        if (normalized.includes('علوي') || normalized.includes('alaw')) return 'alawites';
        if (normalized.includes('كرد') || normalized.includes('kurd')) return 'kurds';
        if (normalized.includes('عرب') || normalized.includes('arab')) return 'arabs';
        if (normalized.includes('مسيح') || normalized.includes('christ')) return 'christians';
        if (
            normalized.includes('نساء') ||
            normalized.includes('أطفال') ||
            normalized.includes('اطفال') ||
            normalized.includes('women') ||
            normalized.includes('children') ||
            normalized.includes('zarok')
        ) {
            return 'womenChildren';
        }
        if (
            normalized.includes('minorit') ||
            normalized.includes('أقليات') ||
            normalized.includes('اقليات') ||
            normalized.includes('أرمن') ||
            normalized.includes('ارمن') ||
            normalized.includes('إيزيد') ||
            normalized.includes('ايزيد') ||
            normalized.includes('آشور') ||
            normalized.includes('اشور') ||
            normalized.includes('سريان') ||
            normalized.includes('شيعة') ||
            normalized.includes('نازح') ||
            normalized.includes('إدلب') ||
            normalized.includes('ادلب')
        ) {
            return 'otherGroupsMinorities';
        }
        return null;
    }

    return Array.isArray(alias) ? alias[0] || null : alias;
}

function expandTargetGroupValue(value: string): string[] {
    const source = value.trim();
    if (!source) {
        return [];
    }

    const normalized = normalizeTargetGroupAlias(source);
    const alias = TARGET_GROUP_ALIAS_MAP[normalized];
    if (alias) {
        const keys = Array.isArray(alias) ? alias : [alias];
        return keys.map((key) => getCanonicalTargetGroupLabelByKey(key));
    }

    const inferredKey = getTargetGroupKeyFromValue(source);
    if (inferredKey) {
        return [getCanonicalTargetGroupLabelByKey(inferredKey)];
    }

    const splitCandidates = source.split(/[،,;]+/).map((item) => item.trim()).filter(Boolean);
    if (splitCandidates.length > 1) {
        return splitCandidates.flatMap((item) => expandTargetGroupValue(item));
    }

    return [source];
}

function expandKnownTargetGroupValue(value: string): string[] {
    const source = value.trim();
    if (!source) {
        return [];
    }

    const normalized = normalizeTargetGroupAlias(source);
    const alias = TARGET_GROUP_ALIAS_MAP[normalized];
    if (alias) {
        const keys = Array.isArray(alias) ? alias : [alias];
        return keys.map((key) => getCanonicalTargetGroupLabelByKey(key));
    }

    const inferredKey = getTargetGroupKeyFromValue(source);
    if (inferredKey) {
        return [getCanonicalTargetGroupLabelByKey(inferredKey)];
    }

    const splitCandidates = source.split(/[،,;]+/).map((item) => item.trim()).filter(Boolean);
    if (splitCandidates.length > 1) {
        return splitCandidates.flatMap((item) => expandKnownTargetGroupValue(item));
    }

    return [];
}

export function canonicalizeTargetGroupValues(values: Array<string | null | undefined>) {
    const deduped = new Set<string>();

    for (const value of values) {
        if (typeof value !== 'string' || !value.trim()) {
            continue;
        }

        for (const item of expandTargetGroupValue(value)) {
            if (!item.trim()) {
                continue;
            }
            deduped.add(item.trim());
        }
    }

    return Array.from(deduped);
}

export function canonicalizeKnownTargetGroupValues(values: Array<string | null | undefined>) {
    const deduped = new Set<string>();

    for (const value of values) {
        if (typeof value !== 'string' || !value.trim()) {
            continue;
        }

        for (const item of expandKnownTargetGroupValue(value)) {
            if (!item.trim()) {
                continue;
            }
            deduped.add(item.trim());
        }
    }

    return Array.from(deduped);
}

export function getCanonicalTargetGroupLabelsFromKeys(values: Array<string | null | undefined>) {
    return canonicalizeTargetGroupValues(
        values.map((value) => {
            if (typeof value !== 'string') {
                return null;
            }
            const key = isTargetGroupKey(value) ? value : getTargetGroupKeyFromValue(value);
            return key ? getCanonicalTargetGroupLabelByKey(key) : value;
        })
    );
}
