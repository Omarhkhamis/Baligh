'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function FinalCTA() {
    const locale = useLocale();
    const t = useTranslations('landing.finalCta');

    return (
        <section className="py-12 md:py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Heading */}
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        {t('title')}
                    </h2>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>

                    {/* CTA Buttons - Mirrored from Hero */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {/* Primary CTA */}
                        <Link
                            href={`/${locale}/analyze`}
                            className="group relative px-12 py-5 bg-green-700 hover:bg-green-800 text-white font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 min-w-[280px] justify-center"
                        >
                            <span>{t('primaryButton')}</span>
                            <svg className="w-6 h-6 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M10 19l-7-7 7-7" : "M14 5l7 7-7 7"} />
                            </svg>
                        </Link>
                    </div>

                    {/* Trust Badge - Simplified */}
                    <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{t('trustBadge')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
