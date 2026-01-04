'use client';

export default function VisionSection() {
    return (
        <section id="vision" className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        🎯 رؤيتنا وأهدافنا
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Vision */}
                    <div className="bg-gradient-to-br from-green-50/50 to-white p-8 rounded-2xl shadow-lg border border-green-100 ltr:border-l-4 rtl:border-r-4 border-green-500">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">🌟 الرؤية</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            فضاء رقمي خالٍ من خطاب العنف والكراهية، يسوده الاحترام والتعايش السلمي، ويُحاسب فيه المحرضون وفق القانون.
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 rounded-2xl shadow-lg border border-blue-100 ltr:border-l-4 rtl:border-r-4 border-blue-500">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 الرسالة</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            رصد وتوثيق ومساءلة خطاب العنف والكراهية في الفضاء الرقمي، باستخدام التكنولوجيا والمنهجية العلمية، لحماية المجتمعات وتعزيز السلام.
                        </p>
                    </div>
                </div>

                {/* Goals */}
                <div className="mt-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">الأهداف الاستراتيجية</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <div className="text-4xl mb-3">📊</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">الرصد الشامل</h4>
                            <p className="text-gray-700">بناء قاعدة بيانات شاملة لخطاب الكراهية والعنف في الفضاء الرقمي</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <div className="text-4xl mb-3">⚖️</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">المساءلة القانونية</h4>
                            <p className="text-gray-700">تقديم الأدلة والتقارير للجهات القضائية لمحاسبة المحرضين</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <div className="text-4xl mb-3">🛡️</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">الحماية والتوعية</h4>
                            <p className="text-gray-700">تمكين الأفراد والمجتمعات من التعرف على خطاب الكراهية والحماية منه</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
