export const RADAR_DESCRIPTION_LOCALES = ['ar', 'en', 'ku'] as const;
export const RADAR_DESCRIPTION_KEYS = [
    'pageSubtitle',
    'classificationSubtitle',
    'targetGroupsSubtitle',
    'emotionsSubtitle',
    'keywordsSubtitle',
] as const;

export type RadarDescriptionLocale = (typeof RADAR_DESCRIPTION_LOCALES)[number];
export type RadarDescriptionKey = (typeof RADAR_DESCRIPTION_KEYS)[number];
export type RadarDescriptions = Record<RadarDescriptionLocale, Record<RadarDescriptionKey, string>>;

export const DEFAULT_RADAR_DESCRIPTIONS: RadarDescriptions = {
    ar: {
        pageSubtitle: 'يركز هذا المرصد على أربعة مؤشرات أساسية مرتبطة مباشرة بقاعدة البيانات: نوع الخطاب، الفئة المستهدفة، خريطة النبرة العاطفية، وسحابة الكلمات الكارهة.',
        classificationSubtitle: 'توزيع البلاغات بين الخطاب الصريح والضمني والتحريضي والحالات غير المصنفة كخطاب كراهية.',
        targetGroupsSubtitle: 'توزيع تنازلي للفئات أو المجتمعات التي تكررت بوصفها هدفًا داخل البلاغات.',
        emotionsSubtitle: 'تجميع الفئات العاطفية الثابتة المستخرجة من التحليل الآلي.',
        keywordsSubtitle: 'تكرارات الكلمات الحساسة المستخرجة من البلاغات المخزنة، وتعرض فقط في السياق الداخلي المخول.',
    },
    en: {
        pageSubtitle: 'This radar focuses on four core indicators linked directly to the database: type of speech, targeted group, emotional tone map, and hate keyword cloud.',
        classificationSubtitle: 'Distribution across explicit, implicit, incitement, and non-hate classifications.',
        targetGroupsSubtitle: 'Descending distribution of the communities or groups most frequently identified as targets.',
        emotionsSubtitle: 'Fixed emotion categories aggregated from AI output.',
        keywordsSubtitle: 'Recurring sensitive keywords extracted from stored reports and shown only in authorized internal context.',
    },
    ku: {
        pageSubtitle: 'Ev radar li ser çar nîşanderên bingehîn ên rasterast bi databeysê ve girêdayî disekine: cureyê axaftinê, koma armanc, nexşeya tona hestyarî, û ewrika peyvên nefretê.',
        classificationSubtitle: 'Belavbûna ragihandinan di navbera gotara kînê ya aşkere, veşartî, teşwîqî û ne-gotara kînê de.',
        targetGroupsSubtitle: 'Belavbûna ji zêdetir bo kêmtir a kom an civakên ku herî zêde wek armanc hatine destnîşankirin.',
        emotionsSubtitle: 'Komkirina kategoriya hestyarî ya sabît a ji derketina AI.',
        keywordsSubtitle: 'Dubarebûna peyvên hesas ên ji ragihandinên tomarbûyî derxistine û tenê di çarçoveya navxweyî ya destûrdar de tên nîşandan.',
    },
};

function cloneDefaultRadarDescriptions(): RadarDescriptions {
    return {
        ar: { ...DEFAULT_RADAR_DESCRIPTIONS.ar },
        en: { ...DEFAULT_RADAR_DESCRIPTIONS.en },
        ku: { ...DEFAULT_RADAR_DESCRIPTIONS.ku },
    };
}

export function getDefaultRadarDescriptions() {
    return cloneDefaultRadarDescriptions();
}

export function normalizeRadarDescriptions(input: unknown): RadarDescriptions {
    const normalized = cloneDefaultRadarDescriptions();

    if (!input || typeof input !== 'object') {
        return normalized;
    }

    for (const locale of RADAR_DESCRIPTION_LOCALES) {
        const localeValue = (input as Record<string, unknown>)[locale];
        if (!localeValue || typeof localeValue !== 'object') {
            continue;
        }

        for (const key of RADAR_DESCRIPTION_KEYS) {
            const value = (localeValue as Record<string, unknown>)[key];
            if (typeof value !== 'string') {
                continue;
            }

            const trimmed = value.trim();
            if (trimmed) {
                normalized[locale][key] = trimmed;
            }
        }
    }

    return normalized;
}
