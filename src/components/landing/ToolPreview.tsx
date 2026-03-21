'use client';

import { useReportModal } from '@/components/reporting/ReportModalProvider';

export default function ToolPreview() {
    const { openReportModal } = useReportModal();

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image/Preview Side */}
                    <div className="order-2 lg:order-1">
                        <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                            {/* Mock Analysis Interface */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 flex items-center justify-center mt-6">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🤖</div>
                                        <div className="text-green-700 font-semibold">تحليل ذكي فوري</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm">
                                دقة 95%
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            كيف نكتشف خطاب الكراهية؟
                        </h2>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            أداة تحليل متقدمة تعتمد على الذكاء الاصطناعي لكشف خطاب الكراهية والعنف الرقمي بدقة عالية
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900">تحليل فوري</h4>
                                    <p className="text-sm text-gray-600">نتائج خلال ثوانٍ معدودة</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900">دقة عالية</h4>
                                    <p className="text-sm text-gray-600">مدرب على السياق العربي والسوري</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900">تقارير قانونية جاهزة</h4>
                                    <p className="text-sm text-gray-600">لـ 9 دول عربية وأوروبية</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            type="button"
                            onClick={openReportModal}
                            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                            جرّب الأداة الآن →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
