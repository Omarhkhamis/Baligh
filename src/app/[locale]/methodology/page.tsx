'use client';

import { useLocale } from 'next-intl';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import PageHero from '../../../components/PageHero';

// Icons
const IconMonitor = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-8 h-8 text-blue-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const IconAnalysis = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-8 h-8 text-purple-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const IconLegal = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-8 h-8 text-green-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

const IconTech = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-8 h-8 text-indigo-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const IconAwareness = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-8 h-8 text-orange-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export default function MethodologyPage() {
    const locale = useLocale();

    // Content Data for cleaner rendering
    const content = {
        ar: {
            title: "منهجيتنا في مواجهة خطاب الكراهية",
            subtitle: "",
            intro: "تعتمد مبادرتنا في مكافحة خطاب الكراهية والعنف على منهجية متدرجة، تدمج بين التحليل الاجتماعي والتقني والقانوني، وتستند إلى خبرة عملية في الرصد داخل البيئة الرقمية السورية.",
            coreTitle: "تنطلق منهجيتنا من مسلّمة بسيطة:",
            coreText: "خطاب الكراهية ليس تعبيرًا عابرًا، بل عملية مركّبة تبدأ بالكلمة وتنتهي بالفعل، ولا يمكن مواجهتها إلا بفهم آلياتها.",
            steps: [
                {
                    id: 1,
                    title: "الرصد المنتظم للمحتوى الرقمي",
                    tag: "الجمع والتصنيف",
                    desc: "مراقبة المحتوى المتداول عبر المنصات الرقمية، وجمع البلاغات، وتصنيف الخطاب وفق طبيعته، ومخاطره، والمجموعات المستهدفة.",
                    icon: IconMonitor,
                    color: "blue"
                },
                {
                    id: 2,
                    title: "التحليل التفكيكي للسرديات",
                    tag: "الفهم العميق",
                    desc: "تحديد البنى اللغوية والمفاهيمية التي يقوم عليها خطاب الكراهية، وفهم آلياته، واستخلاص السرديات الرئيسية التي يعيد إنتاجها.",
                    icon: IconAnalysis,
                    color: "purple"
                },
                {
                    id: 3,
                    title: "التبليغ القانوني والمتابعة",
                    tag: "المساءلة",
                    desc: "صياغة البلاغات القانونية وفق الأطر السورية والدولية، وتوثيق الانتهاكات، وإحالتها إلى الجهات المختصة عبر شبكة قانونية متعاونة.",
                    icon: IconLegal,
                    color: "green"
                },
                {
                    id: 4,
                    title: "تطوير أدوات الذكاء الاصطناعي",
                    tag: "التقنية",
                    desc: "بناء نموذج لغوي قادر على تصنيف الخطاب باللهجة السورية، واكتشاف الأنماط الكارهة، وتقدير مستوى الخطورة، وتوليد تقارير مساعدة للمستخدمين.",
                    icon: IconTech,
                    color: "indigo"
                },
                {
                    id: 5,
                    title: "تعزيز الوعي المجتمعي",
                    tag: "التمكين",
                    desc: "تحويل المعرفة إلى أدوات تدريب وتوعية، وتطوير مواد تعليمية تساعد الأفراد على التمييز بين الخطاب المشروع والخطاب المؤذي.",
                    icon: IconAwareness,
                    color: "orange"
                }
            ],
            flowTitle: "المسار المنهجي المتكامل",
            ctaTitle: "استخدم أدواتنا",
            ctaText: "ابدأ بتحليل محتوى مشبوه أو تعرّف على آليات الحماية الرقمية",
            ctaButton1: "🔍 ابدأ التحليل",
            ctaButton2: "🛡️ دليل الحماية"
        },
        en: {
            title: "Our Methodology",
            subtitle: "",
            intro: "Our approach to combating hate speech is built on a layered methodology that integrates social analysis, legal accountability, and technological innovation.",
            coreTitle: "Our methodology begins with a simple principle:",
            coreText: "Hate speech is not a momentary expression—it is a process. It begins with a word and can end in real-world harm.",
            steps: [
                {
                    id: 1,
                    title: "Continuous Monitoring",
                    tag: "Collection & Classification",
                    desc: "We systematically track online content, gather public reports, and categorize hate speech according to its type and severity.",
                    icon: IconMonitor,
                    color: "blue"
                },
                {
                    id: 2,
                    title: "Narrative Analysis",
                    tag: "Deep Understanding",
                    desc: "We identify the linguistic and conceptual structures that shape hate speech and extract the core narratives driving it.",
                    icon: IconAnalysis,
                    color: "purple"
                },
                {
                    id: 3,
                    title: "Legal Accountability",
                    tag: "Documentation & Action",
                    desc: "We prepare legal complaints in accordance with Syrian and international frameworks and refer cases to relevant bodies.",
                    icon: IconLegal,
                    color: "green"
                },
                {
                    id: 4,
                    title: "AI Development",
                    tag: "Technical Innovation",
                    desc: "We build a Syrian-dialect language model capable of classifying hate speech and assessing levels of risk.",
                    icon: IconTech,
                    color: "indigo"
                },
                {
                    id: 5,
                    title: "Community Awareness",
                    tag: "Empowerment",
                    desc: "We translate insights into training materials and digital safety guides that help individuals distinguish harmful speech.",
                    icon: IconAwareness,
                    color: "orange"
                }
            ],
            flowTitle: "Our Integrated Process",
            ctaTitle: "Use Our Tools",
            ctaText: "Analyze suspicious content or explore practical digital protection methods",
            ctaButton1: "🔍 Start Analysis",
            ctaButton2: "🛡️ Digital Safety Guide"
        },
        ku: {
            title: "Metodolojiya Me",
            subtitle: "",
            intro: "Destpêşxeriya me di rûbirûbûna Gotara Kînê de pişta xwe dide metodolojiyeke pir-qonax, ku analîza civakî, teknîkî û yasayî bi hev re dike yek.",
            coreTitle: "Metodolojiya me ji rastiyeke sade dest pê dike:",
            coreText: "Gotara Kînê ne tenê îfadeyeke demkî ye, lê pêvajoyeke hevgirtî ye ku bi peyvê dest pê dike û bi çalakiyê bi dawî dibe.",
            steps: [
                {
                    id: 1,
                    title: "Şopandina Rêkûpêk",
                    tag: "Komkirin û Dabeşkirin",
                    desc: "Çavdêriya naveroka ku li ser platformên dîjîtal tê belavkirin, komkirina raporan, û dabeşkirina gotarê li gorî cewherê wê.",
                    icon: IconMonitor,
                    color: "blue"
                },
                {
                    id: 2,
                    title: "Analîza Vegotinan",
                    tag: "Têgihiştina Kûr",
                    desc: "Destnîşankirina pêkhateyên zimanî û têgehî yên ku Gotara Kînê li ser wan ava dibe û fêmkirina mekanîzmayên wê.",
                    icon: IconAnalysis,
                    color: "purple"
                },
                {
                    id: 3,
                    title: "Ragihandina Yasayî",
                    tag: "Hesabpirsîn",
                    desc: "Amadekirina raporên yasayî li gorî çarçoveyên Sûriyeyî û navdewletî û şandina wan ji aliyên peywendîdar re.",
                    icon: IconLegal,
                    color: "green"
                },
                {
                    id: 4,
                    title: "Pêşxistina Amûrên AI",
                    tag: "Teknîk",
                    desc: "Avakirina modeleke zimanî ku dikare gotarê bi zaravayên Sûriyeyî dabeş bike û qalibên nefretê keşf bike.",
                    icon: IconTech,
                    color: "indigo"
                },
                {
                    id: 5,
                    title: "Xurtkirina Hişyariyê",
                    tag: "Bihêzkirin",
                    desc: "Veguherîna zanînê bo amûrên perwerde û hişyarkirinê, û pêşxistina materyalên hînkirinê.",
                    icon: IconAwareness,
                    color: "orange"
                }
            ],
            flowTitle: "Riya Metodolojîk a Yekgirtî",
            ctaTitle: "Amûrên Me Bikar Bîne",
            ctaText: "Dest bi analîzkirina naveroka gumanbar bike an jî mekanîzmayên parastina dîjîtal nas bike",
            ctaButton1: "🔍 Dest bi Analîzê Bike",
            ctaButton2: "🛡️ Rêbera Parastinê"
        }
    };

    const t = content[locale as keyof typeof content] || content.ar;
    const isRtl = locale === 'ar';

    return (
        <div className="min-h-screen bg-[#F9FAFB]" dir={isRtl ? 'rtl' : 'ltr'}>
            <AppHeader />
            <PageHero
                icon="🧭"
                title={t.title}
                subtitle={t.subtitle}
            />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-5xl mx-auto space-y-10 md:space-y-12">


                    {/* Introduction */}
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-xl text-gray-700 leading-relaxed font-medium">
                            {t.intro}
                        </p>
                    </div>

                    {/* Core Principle - Green Box */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-[#1E8C4E] to-[#166639] p-8 md:p-10 rounded-2xl text-white shadow-lg transform rotate-0 md:-rotate-1 hover:rotate-0 transition-transform duration-300">
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl md:text-3xl font-bold opacity-95 leading-tight">
                                    {t.coreTitle}
                                </h2>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                    {t.coreText}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* The 5 Methodologies */}
                    <div className="space-y-6">
                        {t.steps.map((step) => (
                            <div key={step.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-6">
                                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-${step.color}-50 group-hover:bg-${step.color}-100 transition-colors`}>
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                                            <span className={`bg-${step.color}-50 text-${step.color}-700 px-3 py-1 rounded-full text-xs font-bold border border-${step.color}-100`}>
                                                {step.tag}
                                            </span>
                                        </div>
                                        <p className="text-lg text-gray-600 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* CTA */}
                    <div className="bg-gradient-to-br from-[#1E8C4E] to-[#166639] p-10 rounded-3xl text-center shadow-lg text-white">
                        <h3 className="text-3xl font-bold mb-4">{t.ctaTitle}</h3>
                        <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">{t.ctaText}</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href={`/${locale}/#analyze`} className="inline-block bg-white text-[#1E8C4E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                                {t.ctaButton1}
                            </a>
                            <a href={`/${locale}/protection`} className="inline-block bg-[#166639]/30 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#166639]/50 transition-all">
                                {t.ctaButton2}
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
