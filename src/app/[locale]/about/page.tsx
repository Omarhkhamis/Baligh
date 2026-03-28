'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import MethodologySections from '../../../components/about/MethodologySections';
import TrainingContent from '../../../components/about/TrainingContent';
import VolunteerApplicationModal from '../../../components/about/VolunteerApplicationModal';

// Icons
const IconVision = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const IconChange = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const IconTeam = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IconVolunteer = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const IconMethodology = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h10.5" />
    </svg>
);

const IconTraining = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);

type TabType = 'vision' | 'change' | 'methodology' | 'training' | 'team' | 'volunteer';

export default function AboutPage() {
    const locale = useLocale();
    const t = useTranslations('about');
    const isRtl = locale === 'ar';
    const [activeTab, setActiveTab] = useState<TabType>('vision');

    const tabs = [
        { id: 'vision' as TabType, label: t('tabs.vision'), icon: IconVision },
        { id: 'change' as TabType, label: t('tabs.change'), icon: IconChange },
        { id: 'methodology' as TabType, label: t('tabs.methodology'), icon: IconMethodology },
        { id: 'training' as TabType, label: t('tabs.training'), icon: IconTraining },
        { id: 'team' as TabType, label: t('tabs.team'), icon: IconTeam },
        { id: 'volunteer' as TabType, label: t('tabs.volunteer'), icon: IconVolunteer }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />

            {/* Custom Header Section */}
            <div className="bg-gradient-to-br from-green-50/80 to-white pb-2 pt-8 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    {/* Icon */}
                    <div className="text-2xl mb-1">
                        👥
                    </div>
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">
                        {t('title')}
                    </h1>
                    {/* Subtitle */}
                    <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>

                    {/* Divider - Transparent/Subtle & No Gap */}
                    <div className="w-full max-w-2xl mx-auto h-px bg-gray-200/50 mt-3 mb-3"></div>

                    {/* Tabs (Pill Style) */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-[#1E8C4E] text-white shadow-lg shadow-green-200 transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className={`w-full mx-auto animate-fade-in min-h-[400px] ${activeTab === 'methodology' || activeTab === 'training' ? 'max-w-none' : 'max-w-5xl'}`}>
                    {activeTab === 'vision' && <VisionTab locale={locale} />}
                    {activeTab === 'change' && <ChangeTab locale={locale} />}
                    {activeTab === 'methodology' && <MethodologySections />}
                    {activeTab === 'training' && <TrainingContent />}
                    {activeTab === 'team' && <TeamTab locale={locale} />}
                    {activeTab === 'volunteer' && <VolunteerTab locale={locale} />}
                </div>
            </main>

            <AppFooter />
        </div>
    );
}

// Vision Tab - رؤيتنا (includes Vision + Mission + Values)
function VisionTab({ locale }: { locale: string }) {
    const isRtl = locale === 'ar';

    const content = {
        ar: {
            startedTitle: "كيف بدأنا",
            startedLead: "لأن الكلمة تقتل أيضاً.",
            startedParagraphs: [
                "ليس بالطلقات دائماً — بل بالتحريض الذي يمهّد الطريق لها. في مجتمعات خرجت لتوّها من الصراع، كلمة واحدة منتشرة على وسائل التواصل تكفي لإعادة إشعال ما أُطفئ بصعوبة.",
                "رأينا هذا يحدث. ولم نستطع أن نصمت.",
                "في تموز 2025، التقى أفراد جمعهم إحساس واحد: خطاب الكراهية ينتشر بلا رقيب ولا حسيب، وتداعياته تصل إلى انتهاكات جماعية حقيقية — بينما الضحايا لا يجدون أحداً يوثّق ما حدث أو يساعدهم على المطالبة بحقوقهم.",
                "من هذا الإحساس المشترك وُلدت مبادرة بلّغ — جهد مستقل لرصد الخطاب المنفلت، وتفعيل قنوات المحاسبة، والدفع نحو فضاء رقمي يحترم كرامة الإنسان."
            ],
            visionTitle: "رؤيتنا",
            visionText: "فضاء يَتمكّن فيه الأفراد من التعبير عن آرائهم بحرية ومسؤولية، ضمن بيئة تحترم الكرامة الإنسانية، وتحمي التعددية من التحريض والوصم والإقصاء، وتدعم التماسك المجتمعي والعيش المشترك.",
            missionTitle: "رسالتنا",
            missionText: "الحد من خطاب الكراهية والعنف في الفضاء العام، عبر رصد مستقل قائم على الأدلة، وتحليل منهجي للسرديات الكارهة، وتطوير أدوات معرفية وتقنية تدعم الفاعلين المدنيين، وتعزز الاستجابات الوقائية والمساءلة الممكنة، وتسهم في بناء خطاب عام أكثر احترامًا وإنسانية.",
            valuesTitle: "قيمنا",
            values: [
                { icon: "🎯", title: "الاستقلالية", desc: "العمل بعيداً عن التجاذبات السياسية والدينية" },
                { icon: "📊", title: "الموضوعية", desc: "الاستناد إلى بيانات موثقة وقابلة للتحقق" },
                { icon: "🌍", title: "حساسية السياق", desc: "احترام تعقيدات وتنوع المجتمعات المحلية" },
                { icon: "🔒", title: "الخصوصية", desc: "الالتزام الصارم بمعايير الأمان الرقمي" },
                { icon: "🤝", title: "التشاركية", desc: "تكامل الأدوار وتبادل المعرفة المشتركة" }
            ]
        },
        en: {
            startedTitle: "How We Started",
            startedLead: "Because words can kill too.",
            startedParagraphs: [
                "Not always with bullets, but with the incitement that clears the way for them. In societies emerging from conflict, a single widely shared sentence on social media can be enough to reignite what was extinguished with difficulty.",
                "We saw this happen. And we could not stay silent.",
                "In July 2025, people came together around one shared conviction: hate speech was spreading without oversight or accountability, and its consequences were reaching real collective violations, while victims could find no one to document what happened or help them pursue their rights.",
                "From that shared conviction, Baligh was born: an independent effort to monitor unchecked hate speech, activate channels of accountability, and push toward a digital space that respects human dignity."
            ],
            visionTitle: "Our Vision",
            visionText: "A space where individuals can express their opinions freely and responsibly, in an environment that respects human dignity, protects pluralism from incitement, stigma and exclusion, and supports social cohesion and coexistence.",
            missionTitle: "Our Mission",
            missionText: "Reducing hate speech and violence in public discourse through independent evidence-based monitoring, methodical analysis of harmful narratives, and developing knowledge and technical tools that support civil actors' capacities, enhance preventive responses and possible accountability, and contribute to building a more respectful and humane public discourse.",
            valuesTitle: "Our Values",
            values: [
                { icon: "🎯", title: "Independence", desc: "Working free from political or religious polarization" },
                { icon: "📊", title: "Objectivity", desc: "Grounding our work in verifiable, transparent data" },
                { icon: "🌍", title: "Context Sensitivity", desc: "Respecting Syrian society's diversity and complexity" },
                { icon: "🔒", title: "Privacy", desc: "Upholding strict digital safety standards" },
                { icon: "🤝", title: "Partnership", desc: "Collaborating with organizations and researchers" }
            ]
        },
        ku: {
            startedTitle: "Me Çawa Dest Pê Kir",
            startedLead: "Ji ber ku peyv jî dikare bikuje.",
            startedParagraphs: [
                "Ne her dem bi guleyan, lê bi wê hêrs û tehrîkê ku rê ji wê re vedike. Di civakên ku nû ji pevçûnê derketine de, tenê yek peyva belavbûyî li ser medyaya civakî dikare têra ku tiştê ku bi zehmetî vemirandiye dîsa pê bike.",
                "Me ev yek dît. Û me nikarîbû bêdeng bimînin.",
                "Di Tîrmeha 2025-an de, kesên ku bi hestek hevpar hatibûn cem hev: gotara kînê bê çavdêrî û bê hesabpirsîn belav dibû, û encamên wê digihîştin binpêkirinên komî yên rastîn, di dema ku qurbaniyan kesek nedidît ku ya qewimî belge bike an alîkariya wan bike ji bo daxwaza mafên xwe.",
                "Ji vê hesta hevpar Baligh çêbû: hewldanek serbixwe ji bo şopandina gotara ji kontrolê derketî, çalakkirina rêyên hesabpirsînê, û xebitîn ji bo qadeke dîjîtal ku rûmeta mirovî rêz bigire."
            ],
            visionTitle: "Dîtina Me",
            visionText: "Qadeke ku kes dikarin bi azadî û berpirsyarî ramanên xwe îfade bikin, di jîngehek ku rûmeta mirovî rêz dike, pirrengiyê ji tehrîk, leke-lêdan û dûrxistinê diparêze.",
            missionTitle: "Peyama Me",
            missionText: "Kêmkirina Gotara tundî û kînê di gotara giştî de bi rêya çavdêriya serbixwe ya li ser bingeha delîlan, analîza metodîk a vegotinên ziyanbexş, û pêşxistina amûrên zanîn û teknîkî.",
            valuesTitle: "Nirxên Me",
            values: [
                { icon: "🎯", title: "Serbixweyî", desc: "Xebata dûrî qutbûnên siyasî û olî" },
                { icon: "📊", title: "Bêalîbûn", desc: "Piştrastkirina li ser belge û daneyên selmandin" },
                { icon: "🌍", title: "Hestiyariya Çarçoveyê", desc: "Rêzgirtina li tevlîhevî û pirrengiya civaka Sûriyeyî" },
                { icon: "🔒", title: "Nepenî", desc: "Pêbendbûna hişk bi standardên parastina dîjîtal" },
                { icon: "🤝", title: "Hevkarî", desc: "Xebata hevbeş bi rêxistinên xwecihî û navdewletî" }
            ]
        }
    };

    const t = content[locale as keyof typeof content] || content.ar;

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <span className="text-2xl">🌱</span> {t.startedTitle}
                </h3>
                <div className="space-y-4 text-[17px] text-gray-700 leading-[2.1]">
                    <p className="text-xl font-bold text-gray-900">{t.startedLead}</p>
                    {t.startedParagraphs.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <span className="text-2xl">👁️</span> {t.visionTitle}
                </h3>
                <p className="text-[17px] text-gray-800 leading-[2.1]">{t.visionText}</p>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <span className="text-2xl">🚀</span> {t.missionTitle}
                </h3>
                <p className="text-[17px] text-gray-700 leading-[2.1]">{'missionText' in t ? t.missionText : ''}</p>
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">💎</span> {t.valuesTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {t.values.map((value, idx) => (
                        <div key={idx} className="bg-gray-50 p-5 rounded-lg">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">{value.icon} {value.title}</h4>
                            <p className="text-gray-700 leading-relaxed">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Change Tab - منهجيتنا (Methodology)
function ChangeTab({ locale }: { locale: string }) {
    const isRtl = locale === 'ar';

    const content = {
        ar: {
            title: "منهجيتنا في مواجهة خطاب الكراهية",
            intro1: "تعتمد المبادرة إطارًا منهجيًا متكاملًا قائمًا على الأدلة، ينطلق من فهم مفاده أن خطاب الكراهية ليس تعبيرًا لغويًا معزولًا، بل عملية تراكمية ذات أبعاد اجتماعية وقانونية وثقافية، ولها آثار مباشرة على التماسك المجتمعي والسلامة العامة.",
            intro2: "يهدف هذا الإطار إلى تحويل خطاب الكراهية من ظاهرة مبهمة إلى نمط قابل للرصد والتحليل والاستجابة، من خلال تدخلات مترابطة تجمع بين المعرفة، التقنية، وبناء القدرات.",
            points: [
                { title: "الرصد والتوثيق المنهجي", desc: "نقوم برصد الخطاب العام وجمع البلاغات وتوثيق المحتوى الضار وفق معايير واضحة تضمن الاتساق والشفافية، مع تصنيف الخطاب بحسب طبيعته ومستوى الخطورة والفئات المستهدفة." },
                { title: "التحليل السياقي للسرديات", desc: "نحلل البنى اللغوية والسردية التي يقوم عليها خطاب الكراهية، ونفكك آليات التطبيع والإقصاء، مع اعتماد التفسير السياقي والإشراف البشري في جميع مراحل التحليل." },
                { title: "التمكين والمساءلة الممكنة", desc: "ندعم التوثيق المعياري وإنتاج أدوات إرشادية تسهّل الوصول إلى مسارات المساءلة القانونية والمؤسسية عندما تتوفر الشروط الواقعية، دون تولي التقاضي مباشرة." },
                { title: "الابتكار التقني", desc: "نطوّر أدوات تحليل ونماذج لغوية داعمة للكشف المبكر وتقدير المخاطر، بما يعزز سرعة الاستجابة ودقتها، ويكمل العمل التحليلي البشري." },
                { title: "بناء القدرات والتوعية", desc: "نحوّل نتائج التحليل إلى موارد تدريبية وتوعوية تدعم الفاعلين المدنيين والإعلاميين والعاملين الاجتماعيين في التعامل المهني مع الخطاب الضار." }
            ],
            conclusion: "من خلال هذا المسار المتكامل، تسهم المبادرة في تعزيز الاستجابة المبكرة لخطاب الكراهية، ورفع جودة التعامل المهني معه، ودعم فضاء عام أكثر احترامًا للتعددية والكرامة الإنسانية."
        },
        en: {
            title: "Our Methodology in Countering Hate Speech",
            intro1: "The initiative adopts an integrated evidence-based methodological framework, proceeding from the understanding that hate speech is not an isolated linguistic expression, but a cumulative process with social, legal, and cultural dimensions.",
            intro2: "This framework aims to transform hate speech from a vague phenomenon into a pattern that can be monitored, analyzed, and responded to, through interconnected interventions combining knowledge, technology, and capacity building.",
            points: [
                { title: "Systematic Monitoring and Documentation", desc: "We monitor public discourse, collect reports, and document harmful content according to clear standards ensuring consistency and transparency." },
                { title: "Contextual Narrative Analysis", desc: "We analyze the linguistic and narrative structures underlying hate speech and dismantle mechanisms of normalization and exclusion." },
                { title: "Empowerment and Accountability", desc: "We support standardized documentation and produce guidance tools that facilitate access to legal and institutional accountability pathways." },
                { title: "Technical Innovation", desc: "We develop analysis tools and linguistic models to support early detection and risk assessment, enhancing response speed and accuracy." },
                { title: "Capacity Building and Awareness", desc: "We transform analysis results into training and awareness resources that support civil actors and journalists." }
            ],
            conclusion: "Through this integrated path, the initiative contributes to enhancing early response to hate speech and supporting a public space that respects pluralism and human dignity."
        },
        ku: {
            title: "Metodolojiya Me",
            intro1: "Destpêşxerî çarçoveyek metodolojîk a yekgirtî ya li ser bingeha delîlan dihewîne.",
            intro2: "Armanca vê çarçoveyê ew e ku Gotara Kînê ji diyardeyeke nezelal veguhere teşeyek ku dikare were şopandin û analîzkirin.",
            points: [
                { title: "Şopandin û Belgekirina Rêkûpêk", desc: "Em gotara giştî dişopînin û raporan berhev dikin li gorî pîvanên zelal." },
                { title: "Analîza Vegotinê ya Çarçoveyî", desc: "Em pêkhateyên zimanî û vegotinê yên ku bingeha Gotara Kînê ne analîz dikin." },
                { title: "Bihêzkirin û Hesabpirsîn", desc: "Em piştgiriya belgekirina standard dikin û amûrên rêbernameyê hilberînin." },
                { title: "Nûbûniya Teknîkî", desc: "Em amûrên analîzê û modelên zimanî pêş dixin da ku tespîta zû piştgirî bikin." },
                { title: "Avakirina Kapasîteyê", desc: "Em encamên analîzê vediguherînin çavkaniyên perwerde û hişyariyê." }
            ],
            conclusion: "Bi riya vê riya yekgirtî, destpêşxerî beşdarî xurtkirina bersiva zû ya li hember Gotara Kînê dibe."
        }
    };

    const t = content[locale as keyof typeof content] || content.ar;

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Methodology Introduction */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">🧭</span> {t.title}
                </h3>
                <div className="space-y-5 text-[17px] text-gray-700 leading-[2.1]">
                    <p className="text-gray-900 font-medium">{t.intro1}</p>
                    <p>{t.intro2}</p>
                </div>
            </div>

            {/* 5 Pillars of Methodology */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 gap-6">
                    {t.points.map((point, idx) => (
                        <div key={idx} className={`bg-gray-50 p-6 rounded-lg ${isRtl ? 'border-r-4' : 'border-l-4'} border-[#1E8C4E] hover:bg-green-50/50 transition-colors`}>
                            <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-3">
                                <span className="bg-[#1E8C4E] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold">{idx + 1}</span>
                                {point.title}
                            </h4>
                            <p className="text-[17px] text-gray-700 leading-[2] text-justify">{point.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Team Tab - فريق المبادرة
type TeamMemberRecord = {
    id?: string;
    name: { ar?: string; en?: string; ku?: string };
    role: { ar?: string; en?: string; ku?: string };
    bio?: string | null;
    imageUrl?: string | null;
    objectPosition?: string;
    objectFit?: string;
    sortOrder?: number;
};

function TeamTab({ locale }: { locale: string }) {
    const isRtl = locale === 'ar';

    const content = {
        ar: {
            title: "أعضاء المبادرة",
            para1: "",
            para2: "",
            para3: "",
            teamSectionTitle: "أعضاء المبادرة"
        },
        en: {
            title: "Initiative Members",
            para1: "Baligh operates with a multidisciplinary team bringing together expertise in social research, analysis, human rights work, and digital technologies. This work was formed from a founding team that began collaboration from the early stages of establishing the initiative.",
            para2: "The initiative views its team as the core of continuous development and the engine of daily work, not just an administrative framework. The team's work is built on commitment to ethical standards, context sensitivity, privacy respect, and evidence-based work.",
            para3: "Today, the team includes researchers, analysts, developers, and experts working with clear roles within a flexible collaborative structure that encourages expertise integration and continuous learning.",
            teamSectionTitle: "Initiative Members"
        },
        ku: {
            title: "Endamên Destpêşxeriyê",
            para1: "Balagh bi tîmeke pir-şaxe ya ku pisporiyên di lêkolîna civakî, analîz, xebata mafên mirovan, û teknolojiyên dîjîtal de berhev dike dixebite.",
            para2: "Destpêşxerî tîma xwe wekî navika pêşxistina berdewam û motora xebata rojane dibîne, ne tenê çarçoveyek îdarî.",
            para3: "Îro, tîm lêkolîner, analîzkar, pêşdebir û pisporan dihewîne ku bi rolên zelal di nav avahiyek hevkarî ya nermbûyî de dixebitin.",
            teamSectionTitle: "Endamên Destpêşxeriyê"
        }
    };
    const t = content[locale as keyof typeof content] || content.ar;

    const [members, setMembers] = useState<TeamMemberRecord[]>([]);
    const [fromDb, setFromDb] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/team');
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMembers(data);
                    if (data.length > 0) setFromDb(true);
                }
            } catch (err) {
                console.error('Failed to load team members', err);
            }
        }
        load();
    }, []);

    const displayMembers = members;

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 px-2 text-center">{t.teamSectionTitle}</h3>
                {displayMembers.length === 0 ? (
                    <div className="text-center text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-8">
                        لا يوجد أعضاء فريق بعد. سيتم عرض أعضاء الفريق هنا عند إضافتهم من لوحة التحكم.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayMembers.map((member, idx) => {
                            const displayName =
                                (member.name?.[locale as keyof typeof member.name] as string | undefined) ||
                                member.name?.ar ||
                                member.name?.en ||
                                '';
                            const displayRole =
                                (member.role?.[locale as keyof typeof member.role] as string | undefined) ||
                                member.role?.ar ||
                                member.role?.en ||
                                '';
                            const imageSrc = member.imageUrl || (member as unknown as Record<string, string>).image || '';
                            return (
                                <div key={member.id || idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={displayName}
                                                fill
                                                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${member.objectFit === "contain" ? "object-contain" : ""}`}
                                                style={{
                                                    objectPosition: member.objectPosition || 'center'
                                                }}
                                            />
                                        ) : (
                                            <div className="text-4xl font-bold text-gray-400">{displayName?.slice(0, 2) || '👤'}</div>
                                        )}
                                    </div>
                                    <div className="p-4 text-center flex flex-col items-center">
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{displayName}</h4>
                                        <p className="text-sm text-gray-600">{displayRole}</p>
                                        {member.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{member.bio}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function VolunteerTab({ locale }: { locale: string }) {
    const isRtl = locale === 'ar';
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
    const content = {
        ar: {
            title: 'التطوع في بَلِّغ — شراكة لا مساهمة',
            body: 'قامت بلّغ منذ تأسيسها على جهد تطوعي مستقل، واستمر تطورها بخبرات متخصصة أسهمت في بناء منهجيتها وأدواتها. التطوع هنا ليس ترقيعاً لفجوات — هو جزء بنيوي من هوية المبادرة، يمنحها تنوعاً معرفياً واستقلالية حقيقية. لكل متطوع دور واضح ومسؤوليات محددة، ومعايير أخلاقية ومنهجية تحكم العمل وتضمن جودته. المتطوعون في بلّغ ليسوا مساعدين — هم شركاء في بناء فضاء رقمي أكثر مسؤولية.',
            cta: 'تطوّع معنا'
        },
        en: {
            title: 'Volunteering at Balagh — Partnership, Not Just Contribution',
            body: 'Balagh has relied, since its founding, on independent volunteer effort, and it has continued to grow through specialized expertise that helped shape its methodology and tools. Volunteering here is not patchwork for gaps. It is a structural part of the initiative’s identity, giving it real intellectual diversity and independence. Every volunteer has a clear role, defined responsibilities, and ethical and methodological standards that govern the work and protect its quality. Volunteers at Balagh are not assistants. They are partners in building a more responsible digital space.',
            cta: 'Volunteer with us'
        },
        ku: {
            title: 'Xebatkarî li Baligh — Hevkarî ye, ne tenê Beşdarî',
            body: 'Baligh ji destpêka xwe ve li ser hewldana dilxwazî ya serbixwe ava bûye, û pêşketina wê bi şarezayiyên taybet berdewam bûye ku di avakirina metodolojî û amûrên wê de beşdar bûne. Li vir xebatkarî ne tenê dagirtina valahiyan e, lê beşek bingehîn ji nasnameya destpêşxeriyê ye ku cihêrengiya zanînî û serbixwebûnek rastîn pê dide. Ji bo her dilxwazek rolêk zelal û berpirsiyariyên diyarkirî hene, û pîvanên exlaqî û metodolojîk hene ku xebatê rê ve dibin û kalîteya wê diparêzin. Dilxwazên Baligh ne alîkar in, ew hevkar in di avakirina qadeke dîjîtal a berpirstir de.',
            cta: 'Beşdarî me bibe'
        },
    };
    const t = content[locale as keyof typeof content] || content.ar;

    return (
        <>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm" dir={isRtl ? 'rtl' : 'ltr'}>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">🙌 {t.title}</h3>
                <p className={`text-[17px] text-gray-700 leading-[2] ${isRtl ? 'text-right' : 'text-left'}`}>{t.body}</p>
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setIsVolunteerModalOpen(true)}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1E8C4E] text-white font-semibold text-sm shadow-sm hover:bg-[#177342] transition-colors"
                    >
                        {t.cta || 'Volunteer'}
                    </button>
                </div>
            </div>
            <VolunteerApplicationModal
                isOpen={isVolunteerModalOpen}
                locale={locale}
                onClose={() => setIsVolunteerModalOpen(false)}
            />
        </>
    );
}
