'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type ChecklistItem = { title: string; desc: string };
type FAQItem = { q: string; a: string };

export default function FAQTab() {
    const t = useTranslations('legal.faqContent');
    const checklistRaw = t.raw('checklist');
    const faqItemsRaw = t.raw('faqs');
    const checklist: ChecklistItem[] = Array.isArray(checklistRaw) ? checklistRaw as ChecklistItem[] : [];
    const faqs: FAQItem[] = Array.isArray(faqItemsRaw) ? faqItemsRaw as FAQItem[] : [];

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {/* Legal Readiness Checklist (Positive Framing) */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="bg-white p-2 rounded-lg shadow-sm text-2xl">📋</span>
                    {t('checklistTitle')}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {checklist.map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-green-100 shadow-sm flex flex-col items-start gap-3">
                            <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Specialized Legal Inquiries */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-50 p-3 rounded-xl">
                        <span className="text-2xl">⚖️</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('faqTitle')}</h2>
                        <p className="text-gray-500 mt-1">إجابات دقيقة للأسئلة القانونية الأكثر أهمية</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <details key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group transition-all duration-200 hover:shadow-md">
                            <summary className="font-bold text-lg text-gray-800 cursor-pointer list-none flex items-center justify-between select-none">
                                <span className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                    <span>{faq.q}</span>
                                </span>
                                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </summary>
                            <div className="mt-4 pl-5 border-l-2 border-indigo-100">
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* Call to Action - Redirect */}
            <div className="mt-12 text-center border-t border-gray-100 pt-8">
                <p className="text-gray-500 mb-4">{t('helpText')}</p>
                <Link
                    href="/ar/about#contact"
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100"
                >
                    <span>{t('contactButton')}</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}
