import { Metadata } from 'next';
import AppHeader from '../../../components/AppHeader';

export const metadata: Metadata = {
    title: "الذكاء الاصطناعي | بلّغ",
    description: "كيف يعمل نموذجنا اللغوي المتخصص باللهجة السورية - شفافية كاملة",
};

export default function AIPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />

            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            🤖 كيف يعمل الذكاء الاصطناعي لدينا؟
                        </h1>
                        <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                            نطوّر <strong>نموذجًا لغويًا متخصصًا باللهجة السورية</strong>، قادرًا على التعرف على خطاب الكراهية وتحليل السرديات المنتشرة على وسائل التواصل الاجتماعي.
                        </p>
                    </div>

                    {/* Principles */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-green-50 p-6 rounded-xl text-center">
                            <div className="text-4xl mb-3">🔍</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">الشفافية</h3>
                            <p className="text-gray-700">نوضح كيف يعمل النموذج بالتفصيل</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl text-center">
                            <div className="text-4xl mb-3">🎯</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">دقة التحليل</h3>
                            <p className="text-gray-700">تدريب مستمر على بيانات واقعية</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-xl text-center">
                            <div className="text-4xl mb-3">🔒</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">احترام الخصوصية</h3>
                            <p className="text-gray-700">حماية صارمة للبيانات الشخصية</p>
                        </div>
                    </div>

                    {/* Model Architecture */}
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">بنية النموذج اللغوي</h2>
                        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200">
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                يعتمد نموذجنا على تقنيات حديثة في <strong>معالجة اللغة الطبيعية (NLP)</strong>، مستندًا إلى نماذج عربية مفتوحة المصدر ونماذج دقيقة مُعَدّة خصيصًا للهجة السورية، مع طبقات تدريب إضافية مبنية على بيانات حقيقية.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                تسمح هذه البنية للنموذج بفهم <strong>التراكيب المحلية، السخرية، الشتائم السياقية</strong>، والدلالات السياسية والاجتماعية الكامنة وراء الكلمات.
                            </p>
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">مصادر البيانات المستخدمة في التدريب</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">📝 التبليغات الواردة</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    البلاغات التي تصل عبر المنصة تُستخدم لتدريب وتحسين النموذج <strong>بعد إزالة أي بيانات شخصية</strong>.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">🔍 الرصد اليدوي</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    يجمع فريقنا محتوى عامًا من المنصات الأكثر انتشارًا (فيسبوك، تيك توك، يوتيوب، تلغرام).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Training Process */}
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">كيف نعلّم النموذج؟</h2>
                        <div className="space-y-6">
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">تنظيف البيانات ومعالجتها</h3>
                                    <p className="text-gray-700">إزالة البيانات الشخصية وتحويل النصوص إلى شكل موحّد</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">التصنيف اليدوي</h3>
                                    <p className="text-gray-700">يُصنّف فريق مختص آلاف الأمثلة وفق معايير واضحة (نوع الخطاب، الفئة المستهدفة، شدة الخطاب، السياق)</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">التدريب الخاضع للإشراف</h3>
                                    <p className="text-gray-700">يُدرّب النموذج على التعرّف على الأنماط اللغوية عبر خوارزميات متقدمة</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Limitations */}
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">حدود النموذج</h2>
                        <div className="bg-yellow-50 border-r-4 border-yellow-500 p-8 rounded-xl">
                            <p className="text-lg text-gray-800 mb-4 font-semibold">نوضح بشفافية:</p>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600 mt-1">⚠️</span>
                                    <span>النموذج <strong>ليس بديلًا عن الحكم البشري</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600 mt-1">⚠️</span>
                                    <span>قد يواجه تحديات مع <strong>اللهجات المتعددة أو السخرية المعقدة</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600 mt-1">⚠️</span>
                                    <span>الأداة <strong>لا تتعامل مع بيانات خاصة أو رسائل خاصة</strong></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-8">حماية الخصوصية</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-green-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">✅ ما نفعله</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• إزالة أي معلومات شخصية</li>
                                    <li>• تخزين البيانات على خوادم آمنة</li>
                                    <li>• عدم استخدام الرسائل الخاصة</li>
                                    <li>• عدم مشاركة البيانات دون موافقة</li>
                                </ul>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">❌ ما لا نفعله</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• لا نبيع البيانات لأطراف ثالثة</li>
                                    <li>• لا نستخدم بيانات خاصة</li>
                                    <li>• لا نحتفظ بمعلومات تعريفية</li>
                                    <li>• لا نشارك البيانات مع حكومات</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Why Transparency */}
                    <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 p-10 rounded-3xl text-center">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">لماذا نُظهر كل هذه التفاصيل؟</h3>
                        <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            لأن <strong>الشفافية أساس بناء الثقة</strong>، خصوصًا في مبادرة تعمل على موضوع حساس مثل الكراهية والتحريض، ولأن المنظمات البحثية والإنسانية تحتاج لفهم آليات عمل التحليل قبل أن تعتمد نتائجه.
                        </p>
                    </div>
                </div>
            </section>

            <footer id="contact" className="bg-gray-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">اتصل بنا</h3>
                    <p className="text-gray-400 mb-6">للاستفسارات والشراكات والإبلاغ عن المحتوى</p>
                    <div className="flex justify-center gap-6">
                        <a href="mailto:contact@baligh.org" className="text-green-400 hover:text-green-300 transition-colors">
                            contact@baligh.org
                        </a>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
                        © 2024 مبادرة مكافحة خطاب العنف والكراهية - جميع الحقوق محفوظة
                    </div>
                </div>
            </footer>
        </div>
    );
}
