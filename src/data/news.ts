// News and activities data for the initiative

export interface NewsItem {
    id: number;
    title: { ar: string; en: string; ku: string };
    category: 'training' | 'media' | 'event' | 'achievement' | 'statement';
    date: string;
    description: { ar: string; en: string; ku: string };
    content: { ar: string; en: string; ku: string };
    image?: string;
    videoUrl?: string; // YouTube embed URL
    author?: { ar: string; en: string; ku?: string };
    tags?: { ar: string[]; en: string[]; ku: string[] };
}

export const NEWS_CATEGORIES = {
    training: { label: 'تدريبات', icon: '📚', color: 'blue' },
    media: { label: 'لقاءات إعلامية', icon: '🎤', color: 'purple' },
    event: { label: 'مشاركات في أحداث', icon: '🤝', color: 'green' },
    achievement: { label: 'إنجازات', icon: '🏆', color: 'yellow' },
    statement: { label: 'بيانات', icon: '📢', color: 'red' }
};

export const newsItems: NewsItem[] = [
    {
        id: 5,
        title: {
            ar: 'مبادرة لوقف خطاب الكراهية على الإنترنت',
            en: 'Initiative to Stop Hate Speech Online',
            ku: 'Destpêşxeriyek ji bo rawestandina gotara nefretê li ser înternetê'
        },
        category: 'media',
        date: '2025-10-12',
        description: {
            ar: 'حلقة من برنامج "ريبوست" على تلفزيون سوريا تناقش المبادرة وأدواتها في رصد ومواجهة خطاب الكراهية في الفضاء الرقمي السوري.',
            en: 'An episode of the "Repost" program on Syria TV discussing the initiative and its tools for monitoring and countering hate speech in the Syrian digital space.',
            ku: 'Xelekek ji bernameya "Repost" li ser Syria TV, ku destpêşxerî û amûrên wê yên di şopandin û rûbirûbûna gotara nefretê de li qada dîjîtal a Sûriyeyî gotûbêj dike.'
        },
        image: 'https://img.youtube.com/vi/UiE5NKs7HkU/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/UiE5NKs7HkU',
        content: {
            ar: `استضاف برنامج "ريبوست" على تلفزيون سوريا الحديث عن المبادرة كجهد مدني يهدف للحد من انتشار خطاب الكراهية.

ناقشت الحلقة الآليات التي تعتمدها المبادرة في الرصد والتحليل، وأهمية التوعية بمخاطر هذا الخطاب على السلم الأهلي.

كما تم التطرق إلى دور الأدوات الرقمية والمشاركة المجتمعية في خلق بيئة إلكترونية أكثر أماناً.`,
            en: `The "Repost" program on Syria TV hosted a discussion about the initiative as a civil effort aimed at curbing the spread of hate speech.

The episode discussed the mechanisms adopted by the initiative in monitoring and analysis, and the importance of raising awareness about the dangers of this speech on civil peace.

It also touched upon the role of digital tools and community participation in creating a safer online environment.`,
            ku: `Bernameya "Repost" li ser Syria TV mêvandariya nîqaşekê li ser destpêşxeriya me kir, wekî hewldaneke sivîl ji bo kêmkirina belavbûna gotara nefretê.

Di xelekê de mekanîzmayên ku destpêşxerî di şopandin û analîzkirinê de bi kar tîne, û girîngiya hişyarkirina li ser metirsiyên vê gotarê li ser aştiya navxweyî hatin nîqaşkirin.

Her wiha behsa rola amûrên dîjîtal û beşdariya civakî di avakirina jîngeheke elektronîk a ewletir de hat kirin.`
        },
        tags: {
            ar: ['تلفزيون سوريا', 'ريبوست', 'خطاب الكراهية', 'مقابلة'],
            en: ['SyriaTV', 'Repost', 'HateSpeech', 'Interview'],
            ku: ['SyriaTV', 'Repost', 'Gotara_Nefretê']
        }
    },
    {
        id: 4,
        title: {
            ar: '✍🏻 📱"بلّغ"… مبادرة سورية لرفع مستوى الوعي الرقمي ومحاربة الكراهية',
            en: '"Ballagh"... A Syrian Initiative to Raise Digital Awareness and Combat Hate',
            ku: '"Balagh"… Destpêşxeriyeke Sûriyeyî ji bo bilindkirina asta hişyariya dîjîtal û şerê li dijî nefretê'
        },
        category: 'media',
        date: '2025-10-05',
        description: {
            ar: 'لقاء إعلامي يسلط الضوء على مبادرة "بلّغ" ودورها في تعزيز الوعي الرقمي ومواجهة خطاب الكراهية في سوريا.',
            en: 'A media interview highlighting the "Ballagh" initiative and its role in enhancing digital awareness and countering hate speech in Syria.',
            ku: 'Hevpeyvîneke medyayî ku ronahiyê dixe ser destpêşxeriya "Balagh" û rola wê di xurtkirina hişyariya dîjîtal û rûbirûbûna gotara nefretê li Sûriyeyê.'
        },
        image: 'https://img.youtube.com/vi/ksacY4LRf4g/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/ksacY4LRf4g',
        content: {
            ar: `في هذا اللقاء الإعلامي القصير، يتم تسليط الضوء على مبادرة "بلّغ" كخطوة رائدة لرفع مستوى الوعي الرقمي بين السوريين.

تتناول المبادرة آليات رصد ومواجهة خطاب الكراهية المنتشر على منصات التواصل الاجتماعي، وتهدف إلى خلق بيئة رقمية أكثر أماناً ومسؤولية.

شاهد الفيديو للتعرف أكثر على أهداف المبادرة وكيفية المساهمة فيها.`,
            en: `In this short media interview, the "Ballagh" initiative is highlighted as a pioneering step to raise digital awareness among Syrians.

The initiative addresses mechanisms for monitoring and countering hate speech spreading on social media platforms, aiming to create a safer and more responsible digital environment.

Watch the video to learn more about the initiative's goals and how to contribute.`,
            ku: `Di vê hevpeyvîna medyayî ya kurt de, ronahî tê xistin ser destpêşxeriya "Balagh" wekî gaveke pêşeng ji bo bilindkirina asta hişyariya dîjîtal di nav Sûriyeyiyan de.

Destpêşxerî mekanîzmayên şopandin û rûbirûbûna gotara nefretê ya ku li ser platformên medyaya civakî belav dibe, digire dest, û armanc dike ku jîngeheke dîjîtal a ewletir û berpirsyartir ava bike.

Vîdyoyê temaşe bike da ku tu zêdetir li ser armancên destpêşxeriyê û awayê beşdariya tê de nas bikî.`
        },
        tags: {
            ar: ['لقاء إعلامي', 'بلّغ', 'وعي رقمي', 'خطاب الكراهية'],
            en: ['MediaInterview', 'Ballagh', 'DigitalAwareness', 'HateSpeech'],
            ku: ['Hevpeyvîna_Medyayî', 'Balagh', 'Hişyariya_Dîjîtal']
        }
    },
    {
        id: 3,
        title: {
            ar: 'الاجتماع التأسيسي لمبادرة مكافحة خطاب الكراهية: وضع أسس العمل وتحديد مراحل المواجهة',
            en: 'Founding Meeting of the Anti-Hate Speech Initiative: Setting the Framework and Defining the Stages of Action',
            ku: 'Civîna Damezrîner a destpêşxeriya rûbirûbûna gotara nefretê: Danîna bingehên xebatê û diyarkirina qonaxên rûbirûbûnê'
        },
        category: 'achievement',
        date: '2025-07-25',
        description: {
            ar: 'عقدت مبادرة مكافحة خطاب العنف والكراهية اجتماعها التأسيسي بمشاركة 28 شخصاً من باحثين وناشطين وخبراء، بهدف وضع إطار عمل مشترك للتصدي لخطاب الكراهية المتصاعد في السياق السوري.',
            en: 'The Anti-Hate Speech Initiative convened its founding meeting on 25 July 2025, gathering 28 researchers, activists, and specialists to establish a shared operational framework to confront the escalating spread of hate speech within the Syrian context.',
            ku: 'Destpêşxeriya rûbirûbûna gotara tundî û nefretê civîna xwe ya damezrîner bi beşdariya 28 kesan ji lêkolîner, çalakvan û pisporan li dar xist, bi armanca danîna çarçoveyeke hevbeş a xebatê ji bo bersivdayîna gotara nefretê ya ku di çarçoveya Sûriyeyî de zêde dibe.'
        },
        image: '/images/news/founding-meeting-2025.png',
        content: {
            ar: `عقدت مبادرة مكافحة خطاب العنف والكراهية اجتماعها التأسيسي بتاريخ 25 تموز 2025 بمشاركة 28 شخصاً من باحثين وناشطين وخبراء، بهدف وضع إطار عمل مشترك للتصدي لخطاب الكراهية المتصاعد في السياق السوري.

استُهل الاجتماع بعرض تقديمي تناول مخاطر خطاب الكراهية في البلدان الخارجة من الصراع، مع أمثلة من رواندا والبوسنة وميانمار، وإبراز تشابه أنماط الخطاب في المراحل التي تسبق ارتكاب الانتهاكات الجماعية واسعة النطاق.

وتناول النقاش فهم أبعاد خطاب الكراهية، طرق إنتاجه، وتحديد مصادره، وآليات مواجهته عبر التفكيك، وإنتاج خطاب بديل.

واتُّفق خلال الاجتماع على إطلاق ثلاث مراحل رئيسية للعمل:

1. الرصد: تتبع منشورات خطاب الكراهية وتعبئة نموذج موحّد للحالات المكتشفة.

2. التحليل: دراسة اللغة والمشاعر وشدة الخطاب، وبناء قاموس سوري خاص بخطاب الكراهية.

3. الإجراء: ويشمل مسارين، تقنياً عبر الإبلاغ عن الصفحات المحرِّضة وإغلاقها، وقانونياً عبر رفع دعاوى داخل سوريا أو دول الإقامة الأوروبية.

كما طُرحت مجموعة من التحديات، أبرزها غياب تعريف موحّد لخطاب الكراهية، التحيزات السياسية والطائفية، ضخامة المحتوى وسرعة انتشاره، إضافة إلى التباين بين الأطر القانونية في كل بلد.

وشهد الاجتماع نقاشاً موسعاً حول أهمية تفكيك السرديات التي ترافق الأحداث، وتوظيف الكوميديا والإعلام المرئي والمحتوى الساخر في إنتاج سرديات بديلة، إضافة إلى ضرورة التعاون مع الخبراء والمنظمات التي تعمل في مجال مكافحة المعلومات المضللة.

وفي ختام الاجتماع، اتفق الحضور على خطة عمل تشمل تشكيل مجموعات للرصد والتحليل والتقنية والمتابعة القانونية، وفتح مجموعة على فيسبوك لتسهيل تبادل المعلومات، إلى جانب وضع إطار زمني لجولة أولى من الرصد والتحليل.

وأكد المشاركون أن المبادرة تقوم على العمل التطوعي وغير المركزي، وتعتمد على خبرات وجهود جميع أعضائها، انطلاقاً من مسؤولية مشتركة لمنع تفاقم خطاب الكراهية وقطع الطريق أمام الانزلاق نحو عنف أهلي محتمل.`,
            en: `The Anti-Hate Speech Initiative convened its founding meeting on 25 July 2025, gathering 28 researchers, activists, and specialists to establish a shared operational framework to confront the escalating spread of hate speech within the Syrian context.

The meeting opened with a presentation outlining the risks of hate speech in post-conflict societies, drawing on comparative cases from Rwanda, Bosnia, and Myanmar. These examples highlighted the structural similarities between early hate-speech patterns and the stages that typically precede large-scale collective violations.

Participants discussed the nature of hate speech, how it is produced and circulated, and the mechanisms through which it can be countered—whether through deconstruction, narrative reframing, or generating constructive alternative discourse.

The meeting concluded with agreement on three principal stages of collective action:

1. Monitoring
Tracking hate-speech content online and documenting incidents through a unified reporting template.

2. Analysis
Assessing linguistic markers, emotional tone, and intensity levels of hate speech; developing a Syrian-specific hate-speech lexicon to support systematic documentation and automated detection.

3. Action
A dual-track approach:
• Technical response: Reporting and requesting the takedown of accounts and pages that incite hatred.
• Legal response: Initiating complaints and legal proceedings inside Syria or in European host countries.

The group also identified a set of key challenges, including the lack of a unified definition of hate speech, political and sectarian biases, the scale and speed of content circulation, and the variations between legal frameworks across countries.

A central part of the discussion focused on the need to dismantle the narratives accompanying political developments, and on the potential of comedy, visual media, and satirical content to generate alternative narratives capable of diffusing tension. Participants emphasized collaboration with experts and organizations working on counter-disinformation.

By the end of the meeting, attendees endorsed a workplan that includes forming dedicated teams for monitoring, analysis, technical response, and legal follow-up; creating a Facebook group for internal coordination; and setting a timeline for the first monitoring and analysis cycle.

Participants affirmed that the initiative is grounded in voluntary, decentralized action, relying on the collective expertise and commitment of its members. They underscored that confronting hate speech is a shared responsibility essential for preventing escalation and safeguarding social cohesion in Syria.`,
            ku: `Destpêşxeriya rûbirûbûna gotara tundî û nefretê civîna xwe ya damezrîner di 25ê Tîrmeha 2025an de bi beşdariya 28 kesan ji lêkolîner, çalakvan û pisporan li dar xist, bi armanca danîna çarçoveyeke hevbeş a xebatê ji bo bersivdayîna gotara nefretê ya ku di çarçoveya Sûriyeyî de zêde dibe.

Civîn bi pêşkêşiyekê dest pê kir ku behsa metirsiyên gotara nefretê di welatên ku ji şer derketine kir, ligel mînakên ji Rwanda, Bosna û Myanmarê.

Nîqaş li ser fêmkirina pîvanên gotara nefretê, awayên hilberîna wê, û mekanîzmayên rûbirûbûna wê bi rêya hilweşandin û hilberîna gotara alternatîf bû.

Di civînê de li ser destpêkirina sê qonaxên sereke yên xebatê lihevhatin çêbû:

1. Şopandin: Şopandina weşanên gotara nefretê û dagirtina formeke yekgirtî ji bo dozên hatine keşfkirin.

2. Analîz: Lêkolîna ziman, hest û tundiya gotarê, û avakirina ferhengeke Sûriyeyî ya taybet bi gotara nefretê.

3. Çalakî: Du rêyan li xwe digire, teknîkî bi rêya ragihandina rûpelên teşwîqkar û girtina wan, û yasayî bi rêya vekirina dozan li hundirê Sûriyeyê an welatên rûniştinê yên Ewropî.

Beşdaran tekez kirin ku destpêşxerî li ser xebata dilxwazî û ne-navendî ava bûye, û dispêre pisporî û hewldanên hemû endamên xwe.`
        },
        tags: {
            ar: ['اجتماع تأسيسي', 'إنجاز', 'خطة عمل', 'رصد', 'تحليل', 'مواجهة'],
            en: ['FoundingMeeting', 'Milestone', 'WorkPlan', 'Monitoring', 'Analysis', 'Action'],
            ku: ['Civîna_Damezrîner', 'Destkeftî', 'Plana_Xebatê']
        }
    },
    {
        id: 2,
        title: {
            ar: 'تفكيك خطاب الكراهية… خطوة نحو المصالحة والسلم الأهلي',
            en: 'Deconstructing Hate Speech... A Step Towards Reconciliation and Civil Peace',
            ku: 'Hilweşandina gotara nefretê… gavek ber bi lihevhatin û aştiya navxweyî ve'
        },
        category: 'training',
        date: '2025-09-18',
        description: {
            ar: 'اختتمت مؤسسة إمباكت بالتعاون مع مبادرة مكافحة خطاب العنف والكراهية دورة تدريبية متخصصة في مدينة القامشلي بعنوان "خطاب الكراهية: تفكيكه وطرق مواجهته".',
            en: 'Impact Foundation, in cooperation with the Anti-Hate Speech Initiative, concluded a specialized training course in Qamishli titled "Hate Speech: Deconstructing and Countering It".',
            ku: 'Saziya Impact bi hevkariya destpêşxeriya rûbirûbûna gotara tundî û nefretê, xûleke perwerdehiyê ya taybet li bajarê Qamişlo bi navnîşana "Gotara Nefretê: Hilweşandin û Rêyên Rûbirûbûnê" bi dawî kir.'
        },
        image: '/images/news/qamishli-training-2025-1.jpg',
        content: {
            ar: `اختتمت مؤسسة إمباكت بالتعاون مع مبادرة مكافحة خطاب العنف والكراهية دورة تدريبية متخصصة في مدينة القامشلي بعنوان "خطاب الكراهية: تفكيكه وطرق مواجهته"، قدّمها المدرب محمد الجسيم على مدار يومي 17 و18 أيلول/سبتمبر 2025.

ركز التدريب على تعزيز وعي المشاركين من المنظمات الشريكة بخطورة خطاب الكراهية وآثاره على السلم الأهلي، والتعرّف على أشكاله المختلفة، إضافة إلى تطوير أدوات عملية لمواجهته بطرق مدنية فعّالة.

وشمل اليوم الأول أنشطة تفاعلية لصياغة تعريف جماعي لخطاب الكراهية، ومناقشة تداعياته، واستعراض مصفوفة شدة الخطاب وأنماط استهداف المكونات السورية المختلفة.

في اليوم الثاني، تناول التدريب آليات تفكيك خطاب الكراهية ودرجات شدته، ودور السرديات والنكات في تكريس التمييز أو تفكيكه، إلى جانب مناقشة مستويات المواجهة المدنية الممكنة.

تأتي هذه الجلسة ضمن جهود المبادرة لتعزيز الوعي المجتمعي والتصدي لخطاب الكراهية، والمساهمة في تعزيز المصالحة والسلم الأهلي في سوريا.`,
            en: `Impact Foundation, in cooperation with the Anti-Hate Speech Initiative, concluded a specialized training course in Qamishli titled "Hate Speech: Deconstructing and Countering It", presented by trainer Mohammad Al-Jassem on 17-18 September 2025.

The training focused on raising awareness among participants from partner organizations about the dangers of hate speech and its impact on civil peace, identifying its various forms, and developing practical tools to counter it through effective civil methods.

The first day included interactive activities to formulate a collective definition of hate speech, discuss its repercussions, and review the hate speech intensity matrix and patterns of targeting different Syrian components.

On the second day, the training covered mechanisms for deconstructing hate speech and its intensity levels, the role of narratives and jokes in reinforcing or dismantling discrimination, as well as discussing possible levels of civil confrontation.

This session comes as part of the initiative's efforts to enhance community awareness, combat hate speech, and contribute to promoting reconciliation and civil peace in Syria.`,
            ku: `Saziya Impact bi hevkariya destpêşxeriya rûbirûbûna gotara tundî û nefretê, xûleke perwerdehiyê ya taybet li bajarê Qamişlo bi navnîşana "Gotara Nefretê: Hilweşandin û Rêyên Rûbirûbûnê" bi dawî kir, ku ji aliyê rahêner Mihemed El-Casim ve di rojên 17 û 18ê Îlona 2025an de hat pêşkêşkirin.

Perwerde li ser bihêzkirina hişyariya beşdaran li ser metirsiya gotara nefretê û bandorên wê li ser aştiya navxweyî rawestiya.

Roja yekem çalakiyên înteraktîf ji bo danîna pênaseyekê ji bo gotara nefretê li xwe girt.

Di roja duyemîn de, perwerde li ser mekanîzmayên hilweşandina gotara nefretê û astên wê rawestiya.

Ev rûniştin di çarçoveya hewldanên destpêşxeriyê de tê ji bo bihêzkirina hişyariya civakî û rûbirûbûna gotara nefretê.`
        },
        author: {
            ar: 'محمد الجسيم',
            en: 'Mohammad Al-Jassem',
            ku: 'Mihemed El-Casim'
        },
        tags: {
            ar: ['تدريب', 'القامشلي', 'خطاب الكراهية', 'السلم الأهلي', 'المصالحة', 'إمباكت'],
            en: ['Training', 'Qamishli', 'HateSpeech', 'CivilPeace', 'Reconciliation', 'Impact'],
            ku: ['Perwerde', 'Qamişlo', 'Gotara_Nefretê']
        }
    },
    {
        id: 1,
        title: {
            ar: 'انتهاء جلسة تدريب "الباحثون المحترفون" حول تقنيات البحث العكسي والتحقق من المعلومات المضللة',
            en: 'Conclusion of "Professional Researchers" Training Session on Reverse Search Techniques and Verification of Misinformation',
            ku: 'Bidawîbûna rûniştina perwerdehiyê ya "Lêkolînerên Pîşesaz" li ser teknîkên lêgerîna berevajî û piştrastkirina agahiyên çewt'
        },
        category: 'training',
        date: '2025-08-16',
        description: {
            ar: 'اختتمت مبادرة محاربة خطاب العنف والكراهية جلسة تدريب متخصصة ضمن برنامج "الباحثون المحترفون"، ركزت على تقنيات البحث العكسي وأساليب التحقق من المعلومات المضللة.',
            en: 'The Anti-Hate Speech Initiative concluded a specialized training session as part of the "Professional Researchers" program, focusing on reverse search techniques and methods for verifying misinformation.',
            ku: 'Destpêşxeriya şerê li dijî gotara tundî û nefretê rûniştineke perwerdehiyê ya taybet di çarçoveya bernameya "Lêkolînerên Pîşesaz" de bi dawî kir, ku bal kişand ser teknîkên lêgerîna berevajî (Reverse Search) û rêbazên piştrastkirina agahiyên çewt.'
        },
        image: '/images/news/training-osint-2025.png',
        content: {
            ar: `اختتمت مبادرة محاربة خطاب العنف والكراهية اليوم السبت، 16 آب 2025، جلسة تدريب متخصصة ضمن برنامج "الباحثون المحترفون"، ركزت على تقنيات البحث العكسي وأساليب التحقق من المعلومات المضللة عبر الإنترنت.

أدار الجلسة الصحفي نورس يكن، الصحفي السوري العامل في قناة فرانس 24 الدولية للأخبار، الذي قدم محتوى تدريبياً متقدماً حول أدوات التحقيق الرقمي، واستخدام المصادر المفتوحة (OSINT)، وكيفية تحليل المعلومات وتدقيق الصور والفيديوهات، إضافة إلى شرح آليات عمل الخوارزميات وكيف تُستخدم في إعادة تشكيل المحتوى وتوجيهه.

جاء التدريب ثمرة تعاون تطوعي بين المبادرة والصحفي نورس يكن، بالاستناد إلى برنامج "الباحثون المحترفون" التابع لشركة Google، والذي قامت شبكة أريج بترجمته إلى اللغة العربية، بهدف تعزيز التربية الإعلامية لدى الجمهور العربي.

وشارك في الجلسة عدد من الطلاب، والصحفيين، والباحثين، والمهتمين بالتربية الإعلامية، حيث اكتسبوا مهارات عملية في كشف الأخبار الزائفة، والتحقق من صحة المحتوى المتداول على وسائل التواصل الاجتماعي، وفهم آليات التضليل الرقمي، وأدوات حماية المجتمع من انتشار المعلومات غير الدقيقة.

تؤكد المبادرة من خلال هذا التدريب على أهمية بناء قدرات مجتمعية قادرة على مقاومة التضليل، وتعزيز الوعي الرقمي لدى السوريين، خصوصاً في ظل انتشار المحتوى المضلل وتأثيره على السلم المجتمعي.`,
            en: `The Anti-Hate Speech Initiative concluded on Saturday, 16 August 2025, a specialized training session as part of the "Professional Researchers" program, focusing on reverse search techniques and methods for verifying misinformation online.

The session was led by journalist Nawras Yakan, a Syrian journalist working at France 24 International News Channel, who presented advanced training content on digital investigation tools, Open Source Intelligence (OSINT), information analysis, and image/video verification, in addition to explaining how algorithms work and how they are used to reshape and direct content.

The training was the result of voluntary cooperation between the Initiative and journalist Nawras Yakan, based on Google's "Professional Researchers" program, which was translated into Arabic by the ARIJ network to enhance media literacy among the Arab public.

The session was attended by students, journalists, researchers, and those interested in media literacy, who gained practical skills in detecting fake news, verifying content circulating on social media, understanding digital disinformation mechanisms, and tools to protect society from the spread of inaccurate information.

Through this training, the Initiative emphasizes the importance of building community capabilities capable of resisting disinformation and enhancing digital awareness among Syrians, especially in light of the spread of misleading content and its impact on social peace.`,
            ku: `Destpêşxeriya şerê li dijî gotara tundî û nefretê îro Şemiyê, 16ê Tebaxa 2025an, rûniştineke perwerdehiyê ya taybet di çarçoveya bernameya "Lêkolînerên Pîşesaz" de bi dawî kir.

Rûniştin ji aliyê rojnamevan Newres Yeken ve hat birêvebirin, ku naverokeke perwerdehiyê ya pêşketî li ser amûrên lêkolîna dîjîtal û karanîna çavkaniyên vekirî (OSINT) pêşkêş kir.

Perwerde encama hevkariya dilxwazî ya di navbera destpêşxerî û rojnamevan Newres Yeken de bû.

Di rûniştinê de hejmarek ji xwendekar, rojnamevan û lêkolîneran beşdar bûn, û wan jêhatîbûnên pratîkî di kifşkirina nûçeyên sexte de bi dest xistin.

Destpêşxerî bi rêya vê perwerdeyê tekezî li ser girîngiya avakirina şiyanên civakî dike ji bo berxwedana li dijî agahiyên çewt.`
        },
        author: {
            ar: 'نورس يكن',
            en: 'Nawras Yakan',
            ku: 'Newres Yeken'
        },
        tags: {
            ar: ['تدريب', 'البحث العكسي', 'OSINT', 'التحقق من المعلومات', 'Google'],
            en: ['Training', 'ReverseSearch', 'OSINT', 'FactChecking', 'Google'],
            ku: ['Perwerde', 'Lêgerîna_Berevajî', 'OSINT']
        }
    }
];
