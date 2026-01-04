'use client';

export default function MethodologySection() {
    const stages = [
        {
            number: 1,
            title: 'جمع البيانات',
            description: 'نجمع البيانات عبر التبليغات المجتمعية والرصد اليدوي للمنصات الأكثر تداولاً',
            details: [
                'التبليغات المجتمعية: يقدّم الأفراد بلاغاتهم عبر نموذج مُجهّز',
                'الرصد اليدوي: فريق متخصص يتابع فيسبوك، تيك توك، تلغرام'
            ],
            category: 'بناء المعرفة',
            color: 'blue'
        },
        {
            number: 2,
            title: 'التصنيف والتحليل',
            description: 'تحليل بشري وآلي لتصنيف الخطاب وفق نوعه، الفئة المستهدفة، ودرجة الخطورة',
            details: [
                'نوع الخطاب: إهانة، تجريد من الإنسانية، تحريض',
                'الفئة المستهدفة: دينية، طائفية، قومية، جندرية',
                'درجة الخطورة: مقياس شدة خطاب الكراهية'
            ],
            category: 'بناء المعرفة',
            color: 'blue'
        },
        {
            number: 3,
            title: 'التحقق',
            description: 'مراجعة بشرية متخصصة للسياق، اللهجة، النبرة، لمنع أخطاء الذكاء الاصطناعي',
            details: [
                'مراجعة السياق الكامل للمحتوى',
                'تحليل اللهجة والنبرة والعلاقة بين النص والصورة',
                'منع الأخطاء الناتجة عن الاعتماد الكامل على AI'
            ],
            category: 'الرصد والمساءلة',
            color: 'green'
        },
        {
            number: 4,
            title: 'المعالجة القانونية',
            description: 'تحويل المحتوى عالي الخطورة لمسار قانوني مبني على القوانين المحلية والدولية',
            details: [
                'إعداد مواد جاهزة للادعاء',
                'تقديم الشكاوى عند رغبة المتضررين',
                'الاستناد للقوانين المحلية والدولية'
            ],
            category: 'الرصد والمساءلة',
            color: 'green'
        },
        {
            number: 5,
            title: 'الفعل وانتاج المعرفة',
            description: 'تحويل البيانات إلى تقارير، دراسات، مواد تدريبية، وتوصيات سياساتية',
            details: [
                'تقارير دورية وخرائط حرارية',
                'دراسات بحثية ومواد تدريبية',
                'حملات توعية وتوصيات سياساتية'
            ],
            category: 'التكنولوجيا والتأثير',
            color: 'purple'
        }
    ];

    return (
        <section id="methodology" className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        🧭 المنهجية المعتمدة
                    </h2>
                    <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-4">
                        تعتمد مبادرتنا <strong>منهجية متكاملة</strong> تربط بين التحليل الاجتماعي، الأطر الحقوقية، والنماذج اللغوية المدعومة بالذكاء الاصطناعي.
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        هدفنا هو تحويل خطاب الكراهية من ظاهرة مبهمة إلى مادة قابلة للقياس والتحليل والمقارنة عبر الزمن والمناطق والفئات المستهدفة.
                    </p>
                </div>

                {/* Principle */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-r-4 border-green-600 p-8 rounded-2xl mb-16">
                    <p className="text-xl text-gray-800 font-bold text-center">
                        &quot;لا ننتج أداة تقنية فقط، بل إطارًا معرفيًا لفهم كيف تُنتج الكراهية، وكيف يمكن للمجتمع السوري التعامل معها بمهنية وعدالة ووعي سياقي.&quot;
                    </p>
                </div>

                {/* Process Flow */}
                <div className="mb-16">
                    <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        الحلقة المنهجية المتكاملة
                    </h3>
                    <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
                        <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-bold">جمع البيانات</div>
                        <span className="text-2xl text-gray-400">←</span>
                        <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-bold">التصنيف والتحليل</div>
                        <span className="text-2xl text-gray-400">←</span>
                        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold">التحقق</div>
                        <span className="text-2xl text-gray-400">←</span>
                        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold">المعالجة القانونية</div>
                        <span className="text-2xl text-gray-400">←</span>
                        <div className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full font-bold">الفعل وانتاج المعرفة</div>
                    </div>
                </div>

                {/* Stages Detail */}
                <div className="space-y-8">
                    {stages.map((stage) => (
                        <div key={stage.number} className={`bg-white p-8 rounded-2xl shadow-lg border-l-4 ${stage.color === 'blue' ? 'border-blue-500' :
                            stage.color === 'green' ? 'border-green-500' : 'border-purple-500'
                            } hover:shadow-xl transition-all`}>
                            <div className="flex items-start gap-6">
                                {/* Number */}
                                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${stage.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                    stage.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                        'bg-gradient-to-br from-purple-500 to-purple-600'
                                    } shadow-lg`}>
                                    {stage.number}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h4 className="text-2xl font-bold text-gray-900">{stage.title}</h4>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${stage.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                            stage.color === 'green' ? 'bg-green-100 text-green-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {stage.category}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-700 mb-4">{stage.description}</p>
                                    <ul className="space-y-2">
                                        {stage.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-600">
                                                <span className={`mt-1 ${stage.color === 'blue' ? 'text-blue-500' :
                                                    stage.color === 'green' ? 'text-green-500' : 'text-purple-500'
                                                    }`}>•</span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Key Features */}
                <div className="mt-16 grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-200 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">🤖</div>
                            <h4 className="text-2xl font-bold text-gray-900">الذكاء الاصطناعي</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            نموذج Gemini 2.0 مدرب على اللهجة السورية والسياق المحلي، قادر على فهم التراكيب المحلية، السخرية، والدلالات السياسية.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">✅</div>
                            <h4 className="text-2xl font-bold text-gray-900">التحقق المزدوج</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            مراجعة بشرية من خبراء متخصصين لضمان الدقة ومنع الأخطاء في السياق السوري المعقد.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
