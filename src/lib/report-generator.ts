export interface AnalysisResult {
    classification: string; // Safe, Category A, Category B, Category C, Category D
    violation_type: string; // None, A, B, C, D
    is_identity_based?: string; // Yes, No (New field)
    severity_score: number; // 0-10
    target_group_arabic?: string;
    rationale_arabic: string;
    awareness_note_arabic?: string;

    // Optional/Legacy fields kept for UI compatibility (will be undefined in new reports)
    risk_level?: string;
    scores?: {
        intensity: string;
        vulnerability: string;
        context: string;
    };
    target_group?: string;
    detected_markers?: string[];
    rationale?: string;
    text?: string;
    image_description?: string;
    legal_citation?: string;
    reasoning_ar?: string; // Mapped alias for rationale_arabic
}

export interface LegalInfo {
    name: string;
    lang: string;
    citation: string;
    law_name: string;
    authority: string;
    report_link: string;
}

const LEGAL_DATA: Record<string, LegalInfo> = {
    Syria: {
        name: 'Syria',
        lang: 'ar',
        citation: 'المادة 287 من قانون العقوبات السوري',
        law_name: 'قانون العقوبات السوري / قانون الجرائم المعلوماتية',
        authority: 'النيابة العامة',
        report_link: 'https://www.moi.gov.sy/' // Placeholder
    },
    Germany: {
        name: 'Germany',
        lang: 'de',
        citation: '§130 StGB (Volksverhetzung)',
        law_name: 'Strafgesetzbuch (StGB) / Netzwerkdurchsetzungsgesetz (NetzDG)',
        authority: 'Staatsanwaltschaft / Polizei',
        report_link: 'https://www.zitis.bund.de/kontakt-hinweisgeber'
    },
    France: {
        name: 'France',
        lang: 'fr',
        citation: 'Article 24 de la loi du 29 juillet 1881',
        law_name: 'Loi sur la liberté de la presse / Code pénal',
        authority: 'Procureur de la République',
        report_link: 'https://www.internet-signalement.gouv.fr/'
    },
    Turkey: {
        name: 'Turkey',
        lang: 'tr',
        citation: 'TCK Madde 216 - Halkı kin ve düşmanlığa tahrik etme',
        law_name: 'Türk Ceza Kanunu (TCK)',
        authority: 'Cumhuriyet Başsavcılığı',
        report_link: 'https://www.egm.gov.tr/siber' // Placeholder
    },
    Lebanon: {
        name: 'Lebanon',
        lang: 'ar',
        citation: 'المادة 317 ق.ع. لبناني (إثارة النعرات)',
        law_name: 'قانون العقوبات اللبناني',
        authority: 'النيابة العامة التمييزية',
        report_link: 'https://www.justice.gov.lb/' // Placeholder
    },
    Iraq: {
        name: 'Iraq',
        lang: 'ar',
        citation: 'المادة 200 ق.ع. عراقي (إثارة الفتنة)',
        law_name: 'قانون العقوبات العراقي',
        authority: 'الادعاء العام أو مديرية الجريمة المنظمة',
        report_link: 'https://www.moj.gov.iq/' // Placeholder
    },
    Jordan: {
        name: 'Jordan',
        lang: 'ar',
        citation: 'المادة 150 ق.ع. أردني والمادة 11 ق. الجرائم الإلكترونية',
        law_name: 'قانون العقوبات الأردني / قانون الجرائم الإلكترونية',
        authority: 'وحدة الجرائم الإلكترونية',
        report_link: 'https://www.ccd.gov.jo/' // Placeholder
    },
    Egypt: {
        name: 'Egypt',
        lang: 'ar',
        citation: 'المادة 98 (و) ق.ع. مصري (ازدراء الطوائف)',
        law_name: 'قانون العقوبات المصري / قانون مكافحة الجرائم الإلكترونية',
        authority: 'النيابة العامة أو الإدارة العامة لتكنولوجيا المعلومات',
        report_link: 'https://www.pp.gov.eg/' // Placeholder
    },
    Belgium: {
        name: 'Belgium',
        lang: 'fr',
        citation: 'Loi antiracisme 1981 et Code pénal Art. 444',
        law_name: 'Loi antiracisme / Code pénal belge',
        authority: 'UNIA / Parquet',
        report_link: 'https://www.unia.be/'
    },
    Netherlands: {
        name: 'Netherlands',
        lang: 'nl',
        citation: 'Art. 137d Wetboek van Strafrecht',
        law_name: 'Wetboek van Strafrecht',
        authority: 'Openbaar Ministerie (OM)',
        report_link: 'https://www.politie.nl/aangifte-of-melding-doen'
    },
    Austria: {
        name: 'Austria',
        lang: 'de',
        citation: '§ 283 StGB (Verhetzung)',
        law_name: 'Strafgesetzbuch (StGB)',
        authority: 'Staatsanwaltschaft (Österreich)',
        report_link: 'https://www.justiz.gv.at/'
    },
    Sweden: {
        name: 'Sweden',
        lang: 'sv',
        citation: 'Brottsbalken Kap 16 § 8 (Hets mot folkgrupp)',
        law_name: 'Brottsbalken',
        authority: 'Polisen / Åklagarmyndigheten',
        report_link: 'https://polisen.se/utsatt-for-brott/anmal-brott/'
    },
    Canada: {
        name: 'Canada',
        lang: 'en',
        citation: 'Criminal Code, Section 318 & 319',
        law_name: 'Criminal Code of Canada',
        authority: 'Police / Crown Prosecutor\'s Office',
        report_link: 'https://www.rcmp-grc.gc.ca/en/how-report-crime'
    }
};

export function getLegalInfo(country: string): LegalInfo {
    return LEGAL_DATA[country] || LEGAL_DATA['Syria'];
}

export const SUPPORTED_COUNTRIES = Object.keys(LEGAL_DATA);
