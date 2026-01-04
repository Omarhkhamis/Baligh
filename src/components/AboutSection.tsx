'use client';

export default function AboutSection() {
    const values = [
        { icon: '🎯', title: 'الاستقلالية', description: 'العمل بعيدًا عن الاستقطابات السياسية والدينية' },
        { icon: '📊', title: 'الموضوعية', description: 'الاعتماد على أدلة وبيانات قابلة للتحقق' },
        { icon: '🌍', title: 'الحساسية للسياق', description: 'احترام تعقيدات المجتمع السوري وتنوّعه' },
        { icon: '🔒', title: 'السرية وحماية البيانات', description: 'التزام صارم بمعايير الحماية الرقمية' },
        { icon: '🤝', title: 'الشراكة', description: 'التعاون مع منظمات محلية ودولية وباحثين' },
    ];

    const workPillars = [
        {
            icon: '📡',
            title: 'الرصد والتحليل',
            description: 'نستقبل تبليغات من السوريين والسوريات داخل البلاد والشتات حول المحتوى المسيء أو التحريضي. تُحلّل هذه البلاغات عبر نموذج تصنيف بشري وتقني لتحديد النوع والسردية ودرجة الخطورة.'
        },
        {
            icon: '🤖',
            title: 'التطوير التقني',
            description: 'نبني نموذجًا لغويًا خاصًا باللهجة السورية، يتعلم من آلاف الأمثلة الواقعية، بهدف رصد خطاب الكراهية بشكل أدق وأسرع، مع الحفاظ على التحقق البشري.'
        },
        {
            icon: '📢',
            title: 'التوعية والمناصرة',
            description: 'نحوّل التحليل والبيانات إلى حملات توعية، ومواد تدريبية، وتوصيات سياساتية تساعد الفاعلين في المجتمع المدني والمنظمات الإنسانية على تصميم تدخلات مبنية على الأدلة.'
        }
    ];

    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Main Intro */}
                <div className="text-center mb-16">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            نحن <strong>مبادرة سورية مستقلة</strong> تعمل عند تقاطع البحث الاجتماعي، والعمل الحقوقي، والتقنيات الرقمية، بهدف مواجهة خطاب الكراهية والعنف في الفضاءين الرقمي والمجتمعي في سوريا ومناطق اللجوء.
                        </p>

                        <div className="bg-green-50 border-r-4 border-green-600 p-6 rounded-lg mt-6">
                            <p className="text-lg text-gray-800 font-semibold italic">
                                &quot;نؤمن بأن الكلمة ليست مجرّد رأي، بل قوة تسهم في بناء مجتمع متماسك أو في إشعال عنف جديد&quot;
                            </p>
                        </div>
                    </div>
                </div>



                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gradient-to-br from-green-50 via-white to-green-50 p-10 rounded-3xl shadow-lg border border-green-100">
                        <div className="text-5xl mb-4">🌟</div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">رؤيتنا</h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            مجتمع سوري يستطيع أفراده التعبير بحرية ومسؤولية، دون خوف من التحريض أو الوصم أو الإقصاء، وتتوفر فيه آليات عادلة لحماية السلم الأهلي والعيش المشترك.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 p-10 rounded-3xl shadow-lg border border-blue-100">
                        <div className="text-5xl mb-4">🎯</div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">رسالتنا</h3>
                        <p className="text-lg text-gray-700 leading-relaxed mb-3">
                            تعزيز بيئة رقمية ومجتمعية آمنة عبر:
                        </p>
                        <ul className="text-gray-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>رصد وتحليل خطاب الكراهية بطرق علمية دقيقة</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>بناء نماذج لغوية قادرة على فهم السياقات السورية</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>تمكين المجتمع المدني من التعامل مع الخطاب الضار</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>دعم المسار القانوني لمساءلة المحرّضين</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>إنتاج سرديات بديلة تعزز الكرامة والإنسانية</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h3 className="text-4xl font-bold text-gray-900 mb-10 text-center">قيمنا</h3>
                    <div className="grid md:grid-cols-5 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How We Work */}
                <div className="mb-16">
                    <h3 className="text-4xl font-bold text-gray-900 mb-6 text-center">كيف نعمل؟</h3>
                    <p className="text-lg text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                        يعتمد عملنا على ثلاث ركائز مترابطة لتقديم فهم شامل لخطاب الكراهية ومواجهته:
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {workPillars.map((pillar, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                                <div className="text-5xl mb-4">{pillar.icon}</div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-3">{pillar.title}</h4>
                                <p className="text-gray-700 leading-relaxed">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Volunteer Section */}
                <div className="mb-16 bg-gradient-to-br from-purple-50 to-indigo-50 p-10 rounded-2xl border-2 border-purple-200 text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">كن شريكاً في التغيير</h3>
                    <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                        نؤمن بأن مواجهة خطاب الكراهية مسؤولية جماعية. إذا كنت باحثاً، مطوراً تقنياً، قانونياً، أو ناشطاً مدنياً، وترغب في استثمار مهاراتك لبناء فضاء رقمي سوري آمن وشامل، فإن مبادرة <strong>بَلِّغ</strong> تفتح لك أبواب التطوع لتكون جزءاً من الحل.
                    </p>
                    <a href="mailto:contact@baligh.org?subject=طلب تطوع" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-purple-700 hover:shadow-lg transition-all transform hover:scale-105">
                        انضم لفريقنا
                    </a>
                </div>

                <div className="mt-12">
                    <p className="text-gray-600 mb-6">أو تواصل معنا مباشرة عبر البريد الإلكتروني:</p>
                    <a href="mailto:contact@baligh.org" className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105">
                        📧 contact@baligh.org
                    </a>
                </div>

            </div>
        </section>
    );
}
