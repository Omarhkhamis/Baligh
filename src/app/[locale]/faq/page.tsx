'use client';

import { useTranslations } from 'next-intl';
import AppHeader from '../../../components/AppHeader';

type FAQItem = { q: string; a: string };

export default function FAQPage() {
    const tPage = useTranslations('faq');
    const faqItemsRaw = tPage.raw('items');
    const faqItems: FAQItem[] = Array.isArray(faqItemsRaw) ? faqItemsRaw as FAQItem[] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AppHeader />
            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {tPage('title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {tPage('subtitle')}
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    {faqItems.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
