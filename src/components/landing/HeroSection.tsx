'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function HeroSection() {
    const locale = useLocale();
    const t = useTranslations('landing.hero');
    const tTrust = useTranslations('landing.trustIndicators');

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center bg-white px-4 py-12 md:py-20 overflow-hidden">
            <div className="container mx-auto max-w-4xl text-center relative z-10 flex flex-col items-center">

                {/* Main Heading - Optimized for 2 lines */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight animate-fade-up max-w-4xl">
                    {t('title')}
                </h1>

                {/* Subtitle - Increased readability */}
                <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-100">
                    {t('subtitle')}
                </p>

                {/* Primary Action Only - Centered & Dominant */}
                <div className="flex flex-col items-center gap-6 mb-12 animate-fade-up delay-200">
                    <Link
                        href={`/${locale}/analyze`}
                        className="group relative px-12 py-5 bg-green-700 hover:bg-green-800 text-white font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 min-w-[280px] justify-center"
                    >
                        <span>{t('cta1')}</span>
                        <svg className="w-6 h-6 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M10 19l-7-7 7-7" : "M14 5l7 7-7 7"} />
                        </svg>
                    </Link>

                    {/* Secondary Action - Text Link Style */}
                    <a
                        href="#services"
                        className="text-gray-500 hover:text-green-700 font-medium text-base transition-colors border-b-2 border-transparent hover:border-green-700 pb-0.5"
                    >
                        {t('cta2')}
                    </a>
                </div>

                {/* Simplified Trust Indicators - Minimalist Row */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 animate-fade-up delay-300 border-t border-gray-100 pt-10 w-full max-w-3xl">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl grayscale">🤖</span>
                        <span className="font-semibold text-gray-700 text-sm md:text-base">{tTrust('ai.title')}</span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl grayscale">🌍</span>
                        <span className="font-semibold text-gray-700 text-sm md:text-base">{tTrust('countries.title')}</span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl grayscale">✓</span>
                        <span className="font-semibold text-gray-700 text-sm md:text-base">{tTrust('free.title')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
