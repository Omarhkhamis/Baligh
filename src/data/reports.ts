
export type ReportCategory = 'initiative' | 'analytical' | 'study';

type LocalizedText = { ar: string; en: string; ku?: string };
type LocalizedTags = { ar: string[]; en: string[]; ku?: string[] };

export interface ReportItem {
    id: number;
    title: LocalizedText;
    date: string;
    description: LocalizedText;
    image?: string;
    fileUrl?: string; // URL to the PDF or external report
    author?: LocalizedText;
    tags?: LocalizedTags;
    content: LocalizedText; // Full article content (HTML supported)
    category: ReportCategory;
}

export const reports: ReportItem[] = [
    {
        id: 1,
        title: {
            ar: 'خرائط الكراهية في الفضاء الرقمي السوري',
            en: 'Hate Maps in the Syrian Space: An Analytical Reading of Digital Reports Data'
        },
        date: '2025-12-13',
        author: {
            ar: 'فريق المبادرة',
            en: 'Initiative Team'
        },
        description: {
            ar: 'أطلقت “مبادرة مكافحة خطاب العنف والكراهية” تقريرها “خرائط الكراهية في الفضاء السوري: قراءة تحليلية في بيانات البلاغات الرقمية”، الذي يستند إلى تحليل 250 بلاغًا وردت عبر منصة التبليغ.',
            en: 'The "Violence and Hate Speech Combat Initiative" launched its report "Hate Maps in the Syrian Space: An Analytical Reading of Digital Reports Data", based on the analysis of 250 reports.'
        },
        content: {
            ar: `
                <p>أطلقت “مبادرة مكافحة خطاب العنف والكراهية” تقريرها الأول بعنوان “خرائط الكراهية في الفضاء السوري: قراءة تحليلية في بيانات البلاغات الرقمية”، الذي يستند إلى تحليل 250 بلاغًا وردت عبر منصة التبليغ خلال الفترة الممتدة بين 27 تموز/يوليو و18 آب/أغسطس 2025. يوفر التقرير نظرة معمّقة إلى أنماط خطاب الكراهية المنتشر في الفضاء السوري، مع تتبّع مستوياته اللغوية، وتوزّعه الجغرافي، والفئات الأكثر استهدافًا.</p>

                <p>ويبيّن التقرير هيمنة الخطاب الصريح والتحريض المباشر على الفضاء الرقمي، إلى جانب تزايد الكراهية “الضمنية” التي تُعبَّر عنها عبر التلميحات والرموز، مما يعكس تحولًا في لغة التحريض لتجاوز خوارزميات المنصات. كما تكشف البيانات أن جزءًا كبيرًا من الخطاب العنيف يُنتج خارج سوريا، خاصةً في دول اللجوء، حيث تتراجع القيود الاجتماعية وترتفع حدة التعبير الطائفي والسياسي.</p>

                <p>على مستوى المنصات، يظل فيسبوك المجال الأوسع لانتشار السرديات الطائفية، تليه إنستغرام، بينما تظهر مجموعات تيلغرام بوصفها بؤرًا مغلقة للتحشيد والتجييش. كما يوضح التقرير أن استهداف الجماعات لا يتبع نمطًا ثابتًا، بل يتحرك وفق إيقاع الأحداث السياسية والميدانية، متصدرًا الدروز والسنة والعلويين ضمن موجات متفاوتة الحدة.</p>

                <p>ويؤكد التقرير أن اللغة المستخدمة في هذه الخطابات ليست مجرد شتائم، بل نظام لغوي متكامل يجمع بين نزع الإنسانية، التحقير الجسدي، التهديد، والتعميم الجماعي، بما يحول الخطاب الرقمي إلى أداة تعبئة خطيرة. ويدعو التقرير إلى تطوير أدوات الرصد، وتعزيز الوعي الرقمي، والتدخل على مستوى الشتات حيث يُنتج جزء كبير من الخطاب العنيف.</p>

                <p>يمثّل هذا التقرير خطوة نحو بناء قاعدة معرفية مستدامة تساعد صانعي السياسات والإعلاميين والباحثين على فهم ديناميات الكراهية في سوريا، وتطوير استجابات أكثر فاعلية لوقف انتشارها وحماية السلم الأهلي.</p>
            `,
            en: `
                <p>The "Violence and Hate Speech Combat Initiative" launched its report "Hate Maps in the Syrian Space: An Analytical Reading of Digital Reports Data", based on the analysis of 250 reports received via the reporting platform between July 27 and August 18, 2025.</p>
                <h3>Key Findings:</h3>
                <ul>
                    <li>A significant increase in regional-based hate speech.</li>
                    <li>Social media platforms used as a primary tool for incitement.</li>
                    <li>Most targeted groups include women and internally displaced persons.</li>
                </ul>
                <p>The report provides an in-depth look at the patterns of hate speech spreading in the Syrian space, tracking its linguistic levels, geographic distribution, and most targeted groups. It aims to equip civil and human rights actors with analytical tools to understand the phenomenon and formulate more effective responses.</p>
                <p>To view the full report and detailed data analysis, you can download the PDF file.</p>
            `
        },
        image: '/images/reports/hate-maps-syria-v2.png',
        fileUrl: '/reports/hate_maps_syria_2025.pdf',
        tags: {
            ar: ['رصد', 'تقرير ربعي', '2025'],
            en: ['Monitoring', 'QuarterlyReport', '2025']
        },
        category: 'initiative'
    },
    {
        id: 2,
        title: {
            ar: 'كيف تُصنع السرديات الكارهة في السياق السوري',
            en: 'How Hateful Narratives are Crafted in the Syrian Context: Analyzing Mechanisms of Division and Hate Speech'
        },
        date: '2025-12-13',
        author: {
            ar: 'محمد الجسيم',
            en: 'Muhammad Al-Jassim'
        },
        description: {
            ar: 'دراسة بحثية معمقة تتناول العلاقة بين انتشار المعلومات المضللة وتصاعد التوترات الأهلية في المجتمعات المحلية.',
            en: 'An in-depth research study examining the relationship between the spread of disinformation and escalating civil tensions in local communities.'
        },
        content: {
            ar: `
                <p>يتناول المقال الكيفية التي يتحول بها الخطاب الكاره والتحريضي من تعبيرات فردية عابرة إلى منظومات سردية قادرة على إعادة تشكيل الوعي الجمعي وتهديد السلم الأهلي.</p>

                <p>حيث لم تعد العبارات القاسية والمتداولة على وسائل التواصل الاجتماعي مجرد ردود فعل انفعالية مرتبطة بلحظات غضب أو استقطاب سياسي، بل أصبحت جزءًا من بنية خطابية متماسكة تُنتج تصورات وجودية عن “الآخر”، وتحول الخلافات السياسية والدينية والمناطقية إلى صراعات صفرية بين جماعات.</p>

                <p>ويقدّم الباحث محمد الجسيم إطارًا تحليليًا يوضح أربع مراحل رئيسية في صناعة السرديات الطائفية: تبدأ بالتهيئة النفسية ونزع الإنسانية عبر اللغة والإيحاءات الرمزية، ثم الانتقال إلى الاختزال والتعميم الذي يحوّل التنوع داخل كل جماعة إلى صورة نمطية واحدة، يلي ذلك التضخيم وبناء الخوف الجماعي حيث يُعاد تأطير الأحداث الفردية بوصفها تهديدات وجودية، وصولًا إلى مأسسة الخطاب عندما تتبناه النخب السياسية والإعلامية ويُقدَّم بوصفه تفسيرًا تاريخيًا مشروعًا.</p>

                <p>ويحذّر المقال من أن هذه الديناميات تتعزز في ظل غياب الردع القانوني وضعف دور المؤسسات المعنية بضبط الخطاب العام، إلى جانب الدور الذي تلعبه خوارزميات المنصات الرقمية وغرف الصدى في تضخيم المحتوى الأكثر تطرفًا، ما يمنح خطاب الكراهية قدرة متزايدة على الانتشار والتأثير وتبرير الإقصاء والعنف.</p>

                <p>ويؤكد الباحث أن خطورة السرديات الطائفية لا تكمن فقط في محتواها، بل في تحولها إلى “معرفة عامة” غير قابلة للنقاش، تُستخدم لإدارة الولاءات وتأديب الخصوم والتحكم بالفضاء العام، الأمر الذي يهدد بإدامة الانقسام وإعادة إنتاج العنف في المجتمع السوري.</p>

                <p>ويخلص المقال إلى أن تفكيك السرديات الطائفية بات ضرورة ملحّة لحماية السلم الأهلي ومنع الانزلاق نحو دورات جديدة من العنف، داعيًا إلى تطوير أدوات الرصد والتوثيق، وتفعيل القوانين الرادعة لخطاب التحريض، وتعزيز دور الإعلام المسؤول، وبناء سرديات بديلة تقوم على الاعتراف بالتنوع والعيش المشترك.</p>
            `,
            en: `
                <p>An in-depth research study examining the relationship between the spread of disinformation and escalating civil tensions in local communities. The study focuses on how "framing" and "generalization" are used as tools to create an imaginary enemy and justify violence against them.</p>
                <h3>Study Themes:</h3>
                <ol>
                    <li>Psychosocial mechanisms for accepting disinformation.</li>
                    <li>The role of digital influencers in amplifying hateful narratives.</li>
                    <li>Recommendations to mitigate the impact of media disinformation.</li>
                </ol>
                <p>The study concludes that combating hate speech requires deconstructing the narratives that underpin it, not just pursuing individual content. It offers practical recommendations for activists and journalists to build alternative narratives that foster social cohesion.</p>
            `
        },
        image: '/images/reports/narratives-study-v2.png',
        fileUrl: '#',
        tags: {
            ar: ['دراسة', 'معلومات مضللة', 'سلم أهلي'],
            en: ['Study', 'Disinformation', 'CivilPeace']
        },
        category: 'analytical'
    }
];
