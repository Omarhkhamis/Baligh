// Country-specific legal framework and reporting agencies data

export interface ReportingAgency {
    name: string;
    nameAr: string;
    website: string;
    email?: string;
}

export interface CountryLegalData {
    countryCode: string;
    countryName: string;
    countryNameAr: string;
    flag: string;
    laws: string[];
    lawsAr: string[];
    definition: string;
    definitionAr: string;
    agencies: ReportingAgency[];
}

export const COUNTRY_LEGAL_DATA: Record<string, CountryLegalData> = {
    'Syria': {
        countryCode: 'SY',
        countryName: 'Syria',
        countryNameAr: 'سوريا',
        flag: '🇸🇾',
        laws: [
            'Penal Code Article 307 (1949)',
            'Cybercrime Law Article 31 (2022)'
        ],
        lawsAr: [
            'قانون العقوبات العام - المادة 307 (1949)',
            'قانون مكافحة الجريمة المعلوماتية - المادة 31 (2022)'
        ],
        definition: 'Criminalizes incitement of sectarian strife and hatred that threatens national unity.',
        definitionAr: 'تجريم إثارة النعرات الطائفية والمذهبية والحض على الكراهية عبر الشبكة',
        agencies: [
            {
                name: 'Syrian Public Prosecution',
                nameAr: 'النيابة العامة السورية',
                website: 'https://www.moj.gov.sy'
            }
        ]
    },
    'Germany': {
        countryCode: 'DE',
        countryName: 'Germany',
        countryNameAr: 'ألمانيا',
        flag: '🇩🇪',
        laws: [
            'StGB Article 130 (Volksverhetzung)',
            'NetzDG (Network Enforcement Act)'
        ],
        lawsAr: [
            'المادة 130 من قانون العقوبات (Volksverhetzung)',
            'قانون إنفاذ الشبكة (NetzDG)'
        ],
        definition: 'Article 130 criminalizes incitement to hatred against the population or groups based on origin, race, religion, etc., or calls for violence or grave insults to human dignity. Penalties up to 5 years imprisonment. NetzDG requires social media companies to remove violating content within 24 hours of reporting if the violation is clear.',
        definitionAr: 'المادة 130 تجرم التحريض على الكراهية ضد السكان أو مجموعات بسبب الأصل أو الانتماء العرقي أو الديني... إلخ، أو دعوات العنف أو الإهانة الجسيمة للكرامة الإنسانية. العقوبة تصل إلى 5 سنوات سجن. قانون NetzDG يلزم شركات التواصل بإزالة المحتوى المخالف خلال 24 ساعة',
        agencies: [
            {
                name: 'BKA (Federal Criminal Police)',
                nameAr: 'المكتب الفيدرالي للشرطة الجنائية',
                website: 'https://www.bka.de'
            },
            {
                name: 'Meldestelle REspect',
                nameAr: 'Meldestelle REspect',
                website: 'https://www.respect-berlin.de'
            },
            {
                name: 'Online-Wache (Police)',
                nameAr: 'Online-Wache (الشرطة)',
                website: 'https://www.polizei.de'
            }
        ]
    },
    'Turkey': {
        countryCode: 'TR',
        countryName: 'Turkey',
        countryNameAr: 'تركيا',
        flag: '🇹🇷',
        laws: [
            'Turkish Penal Code Article 216 (TCK)'
        ],
        lawsAr: [
            'المادة 216 من قانون العقوبات التركي (TCK)'
        ],
        definition: 'Article 216 criminalizes: (1) Public incitement to hatred and enmity among segments of the people, if it poses a direct threat to public security (1-3 years imprisonment), and (2) Insulting the religious values of a segment of the people, if it creates danger to public peace (6 months to 1 year).',
        definitionAr: 'المادة 216 تعاقب على: (1) التحريض العلني على الكراهية والعداوة بين فئات من الشعب، إذا كان يشكل تهديداً مباشراً للأمن العام (سنة إلى 3 سنوات سجن)، و(2) إهانة القيم الدينية لفئة من الشعب، إذا أوجد خطراً على السلم (6 أشهر إلى سنة)',
        agencies: [
            {
                name: 'CİMER (Presidential Portal)',
                nameAr: 'CİMER (موقع رئاسة الجمهورية)',
                website: 'https://www.cimer.gov.tr'
            },
            {
                name: 'Emniyet Genel Müdürlüğü',
                nameAr: 'المديرية العامة للأمن',
                website: 'https://www.egm.gov.tr'
            },
            {
                name: 'ESB (Service Providers Union)',
                nameAr: 'ESB (اتحاد مزودي الخدمة)',
                website: 'https://www.esbirligi.org.tr'
            }
        ]
    },
    'France': {
        countryCode: 'FR',
        countryName: 'France',
        countryNameAr: 'فرنسا',
        flag: '🇫🇷',
        laws: [
            'Press Law of 29 July 1881 - Article 24'
        ],
        lawsAr: [
            'قانون الصحافة 29 يوليو 1881 - المادة 24'
        ],
        definition: 'Hate speech is a crime and not protected by freedom of expression. Article 24 punishes public incitement to discrimination, hatred, or violence against a person or group based on origin, race, religion, etc. Penalty up to 1 year imprisonment and €45,000 fine.',
        definitionAr: 'خطاب الكراهية جريمة وليست محمية بحرية التعبير. المادة 24 تعاقب على التحريض العلني على التمييز أو الكراهية أو العنف ضد فرد أو مجموعة بسبب الأصل أو العرق أو الدين... إلخ. العقوبة تصل إلى سنة سجن وغرامة 45,000 يورو',
        agencies: [
            {
                name: 'PHAROS (Police & Gendarmerie)',
                nameAr: 'PHAROS (الشرطة والدرك)',
                website: 'https://www.internet-signalement.gouv.fr'
            },
            {
                name: 'LICRA (Legal Support)',
                nameAr: 'LICRA (الدعم القانوني)',
                website: 'https://www.licra.org'
            },
            {
                name: 'Défenseur des droits',
                nameAr: 'Défenseur des droits',
                website: 'https://www.defenseurdesdroits.fr'
            }
        ]
    },
    'Belgium': {
        countryCode: 'BE',
        countryName: 'Belgium',
        countryNameAr: 'بلجيكا',
        flag: '🇧🇪',
        laws: [
            'Law of 30 July 1981 (Moureaux Law)',
            'Law of 10 May 2007 (Anti-Discrimination)',
            'Law of 10 May 2007 (Gender Equality)'
        ],
        lawsAr: [
            'قانون 30 يوليو 1981 (قانون Moureaux)',
            'قانون 10 مايو 2007 (مكافحة التمييز)',
            'قانون 10 مايو 2007 (المساواة بين الجنسين)'
        ],
        definition: 'Criminalizes incitement or dissemination of hatred, violence, or discrimination based on protected criteria (race, religion, gender, disability, sexual orientation, etc.) whether by speech, writing, or images in public places.',
        definitionAr: 'يعاقب القانون كل من يحرض أو ينشر الكراهية أو العنف أو التمييز بسبب أحد المعايير المحمية (العرق، الدين، الجنس، الإعاقة، التوجه الجنسي... إلخ)، سواء بالقول أو الكتابة أو الصور في الأماكن العامة',
        agencies: [
            {
                name: 'UNIA (Interfederal Centre)',
                nameAr: 'UNIA (المركز الفيدرالي)',
                website: 'https://www.unia.be',
                email: 'info@unia.be'
            },
            {
                name: 'IEFH/IGVM (Gender Equality)',
                nameAr: 'معهد المساواة بين النساء والرجال',
                website: 'https://igvm-iefh.belgium.be',
                email: 'egalite.hommesfemmes@iefh.belgium.be'
            },
            {
                name: 'CSA/VRM (Media Regulator)',
                nameAr: 'المجلس الأعلى للإعلام السمعي البصري',
                website: 'https://www.csa.be'
            }
        ]
    },
    'Sweden': {
        countryCode: 'SE',
        countryName: 'Sweden',
        countryNameAr: 'السويد',
        flag: '🇸🇪',
        laws: [
            'Penal Code Chapter 16 Section 8 (Hets mot folkgrupp)'
        ],
        lawsAr: [
            'قانون العقوبات الفصل 16 القسم 8 (Hets mot folkgrupp)'
        ],
        definition: 'Criminalizes dissemination of threats or expressions of contempt or incitement against a population group (based on origin, skin color, religion, sexual orientation, etc.). Penalty up to 2 years imprisonment.',
        definitionAr: 'يعاقب على نشر تهديدات أو تعبيرات ازدراء أو تحريض ضد مجموعة سكانية (بسبب الأصل أو لون البشرة أو الدين أو التوجه الجنسي... إلخ) بالسجن حتى عامين',
        agencies: [
            {
                name: 'Polisen (Swedish Police)',
                nameAr: 'Polisen (الشرطة السويدية)',
                website: 'https://polisen.se'
            },
            {
                name: 'Näthatsgranskaren',
                nameAr: 'Näthatsgranskaren',
                website: 'https://nathatsgranskaren.se'
            },
            {
                name: 'Diskrimineringsombudsmannen (DO)',
                nameAr: 'Diskrimineringsombudsmannen (DO)',
                website: 'https://www.do.se'
            }
        ]
    },
    'Netherlands': {
        countryCode: 'NL',
        countryName: 'Netherlands',
        countryNameAr: 'هولندا',
        flag: '🇳🇱',
        laws: [
            'Penal Code Article 137c',
            'Penal Code Article 137d'
        ],
        lawsAr: [
            'قانون العقوبات المادة 137c',
            'قانون العقوبات المادة 137d'
        ],
        definition: 'Article 137c criminalizes collective insult based on race, religion, belief, etc. Article 137d criminalizes incitement to hatred, discrimination, or violence against persons or property based on race, religion, orientation, or disability.',
        definitionAr: 'المادة 137c تُجرّم الإهانة الجماعية بسبب العرق أو الدين أو العقيدة إلخ. المادة 137d تجرّم التحريض على الكراهية أو التمييز أو العنف ضد أشخاص أو ممتلكات بسبب العرق أو الدين أو الميول أو الإعاقة',
        agencies: [
            {
                name: 'MiND (Internet Discrimination)',
                nameAr: 'MiND (التمييز الإلكتروني)',
                website: 'https://www.meldpunt.nl'
            },
            {
                name: 'Meld Misdaad Anoniem',
                nameAr: 'Meld Misdaad Anoniem',
                website: 'https://www.meldmisdaadanoniem.nl'
            },
            {
                name: 'Politie (Dutch Police)',
                nameAr: 'Politie (الشرطة الهولندية)',
                website: 'https://www.politie.nl'
            }
        ]
    },
    'USA': {
        countryCode: 'US',
        countryName: 'USA',
        countryNameAr: 'الولايات المتحدة',
        flag: '🇺🇸',
        laws: [
            'First Amendment protections with exceptions for true threats and incitement to imminent lawless action'
        ],
        lawsAr: [
            'التعديل الأول مع استثناءات للتهديدات الحقيقية والتحريض على العنف الوشيك'
        ],
        definition: 'Strong free speech protections, but criminalizes true threats and imminent incitement to violence.',
        definitionAr: 'حماية قوية لحرية التعبير، لكن تجرّم التهديدات الحقيقية والتحريض المباشر على العنف',
        agencies: [
            {
                name: 'FBI (Hate Crimes)',
                nameAr: 'FBI (جرائم الكراهية)',
                website: 'https://www.fbi.gov/investigate/civil-rights/hate-crimes'
            },
            {
                name: 'Department of Justice',
                nameAr: 'وزارة العدل',
                website: 'https://www.justice.gov/crt'
            }
        ]
    },
    'UK': {
        countryCode: 'GB',
        countryName: 'UK',
        countryNameAr: 'المملكة المتحدة',
        flag: '🇬🇧',
        laws: [
            'Public Order Act 1986',
            'Communications Act 2003'
        ],
        lawsAr: [
            'قانون النظام العام 1986',
            'قانون الاتصالات 2003'
        ],
        definition: 'Criminalizes threatening, abusive, or insulting communications intended to stir up hatred.',
        definitionAr: 'تجرّم الاتصالات التهديدية أو المسيئة التي تهدف إلى إثارة الكراهية',
        agencies: [
            {
                name: 'True Vision (Police)',
                nameAr: 'True Vision (الشرطة)',
                website: 'https://www.report-it.org.uk'
            },
            {
                name: 'Crown Prosecution Service',
                nameAr: 'خدمة الادعاء الملكي',
                website: 'https://www.cps.gov.uk'
            }
        ]
    },
    'Canada': {
        countryCode: 'CA',
        countryName: 'Canada',
        countryNameAr: 'كندا',
        flag: '🇨🇦',
        laws: [
            'Criminal Code Section 319 (Public Incitement of Hatred)'
        ],
        lawsAr: [
            'القانون الجنائي - المادة 319 (التحريض العلني على الكراهية)'
        ],
        definition: 'Criminalizes public incitement of hatred against identifiable groups.',
        definitionAr: 'تجرّم التحريض العلني على الكراهية ضد مجموعات محددة',
        agencies: [
            {
                name: 'RCMP (Federal Police)',
                nameAr: 'RCMP (الشرطة الفيدرالية)',
                website: 'https://www.rcmp-grc.gc.ca'
            },
            {
                name: 'Canadian Human Rights Commission',
                nameAr: 'اللجنة الكندية لحقوق الإنسان',
                website: 'https://www.chrc-ccdp.gc.ca'
            }
        ]
    },
    'Austria': {
        countryCode: 'AT',
        countryName: 'Austria',
        countryNameAr: 'النمسا',
        flag: '🇦🇹',
        laws: [
            'Criminal Code Section 283 (Incitement)'
        ],
        lawsAr: [
            'قانون العقوبات - المادة 283 (التحريض)'
        ],
        definition: 'Criminalizes incitement to hatred or violence against groups based on nationality, ethnicity, or religion.',
        definitionAr: 'تجرّم التحريض على الكراهية أو العنف ضد مجموعات بناءً على الجنسية أو العرق أو الدين',
        agencies: [
            {
                name: 'Austrian Police',
                nameAr: 'الشرطة النمساوية',
                website: 'https://www.polizei.gv.at'
            },
            {
                name: 'ZARA (Anti-Racism)',
                nameAr: 'ZARA (مكافحة العنصرية)',
                website: 'https://www.zara.or.at'
            }
        ]
    },
    'Switzerland': {
        countryCode: 'CH',
        countryName: 'Switzerland',
        countryNameAr: 'سويسرا',
        flag: '🇨🇭',
        laws: [
            'Criminal Code Article 261bis (Racial Discrimination)'
        ],
        lawsAr: [
            'قانون العقوبات - المادة 261bis (التمييز العنصري)'
        ],
        definition: 'Criminalizes public incitement to hatred or discrimination based on race, ethnicity, or religion.',
        definitionAr: 'تجرّم التحريض العلني على الكراهية أو التمييز بناءً على العرق أو الإثنية أو الدين',
        agencies: [
            {
                name: 'Swiss Police',
                nameAr: 'الشرطة السويسرية',
                website: 'https://www.fedpol.admin.ch'
            },
            {
                name: 'Federal Commission against Racism',
                nameAr: 'اللجنة الفيدرالية لمكافحة العنصرية',
                website: 'https://www.ekr.admin.ch'
            }
        ]
    },
    'Spain': {
        countryCode: 'ES',
        countryName: 'Spain',
        countryNameAr: 'إسبانيا',
        flag: '🇪🇸',
        laws: [
            'Criminal Code Article 510 (Hate Crimes)'
        ],
        lawsAr: [
            'قانون العقوبات - المادة 510 (جرائم الكراهية)'
        ],
        definition: 'Criminalizes public incitement to hatred, hostility, or violence against groups.',
        definitionAr: 'تجرّم التحريض العلني على الكراهية أو العداء أو العنف ضد مجموعات',
        agencies: [
            {
                name: 'National Police',
                nameAr: 'الشرطة الوطنية',
                website: 'https://www.policia.es'
            },
            {
                name: 'Fiscalía (Prosecution)',
                nameAr: 'Fiscalía (النيابة)',
                website: 'https://www.fiscal.es'
            }
        ]
    },
    'Italy': {
        countryCode: 'IT',
        countryName: 'Italy',
        countryNameAr: 'إيطاليا',
        flag: '🇮🇹',
        laws: [
            'Mancino Law (No. 205/1993)'
        ],
        lawsAr: [
            'قانون مانشينو (رقم 205/1993)'
        ],
        definition: 'Criminalizes incitement to violence or discrimination for racial, ethnic, national or religious motives.',
        definitionAr: 'يعاقب على التحريض على العنف أو التمييز لأسباب عنصرية أو إثنية أو قومية أو دينية',
        agencies: [
            {
                name: 'Polizia Postale',
                nameAr: 'شرطة البريد والاتصالات',
                website: 'https://www.commissariatodips.it'
            },
            {
                name: 'UNAR (Anti-Discrimination)',
                nameAr: 'المكتب الوطني لمكافحة التمييز العنصري',
                website: 'https://www.unar.it'
            }
        ]
    }
};
