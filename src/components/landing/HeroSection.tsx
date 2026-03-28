'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useReportModal } from '@/components/reporting/ReportModalProvider';

export default function HeroSection() {
    const locale = useLocale();
    const t = useTranslations('landing.hero');
    const tTrust = useTranslations('landing.trustIndicators');
    const { openReportModal } = useReportModal();
    const isRtl = locale === 'ar';

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
                    <button
                        type="button"
                        onClick={openReportModal}
                        className="group relative px-12 py-5 bg-green-700 hover:bg-green-800 text-white font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 min-w-[280px] justify-center"
                    >
                        <span>{t('cta1')}</span>
                        <svg className="w-6 h-6 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={locale === 'ar' ? "M10 19l-7-7 7-7" : "M14 5l7 7-7 7"} />
                        </svg>
                    </button>

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

                <div
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="mt-10 w-full max-w-5xl animate-fade-up delay-[400ms]"
                >
                    <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/80 bg-gradient-to-l from-emerald-50 via-[#eef8f2] to-white px-6 py-6 md:px-8 md:py-7 shadow-[0_20px_45px_-30px_rgba(22,101,52,0.35)]">
                        <div
                            aria-hidden="true"
                            className={`absolute top-0 h-28 w-28 rounded-full bg-emerald-100/70 blur-2xl ${isRtl ? 'left-4' : 'right-4'}`}
                        />
                        <div className={`relative flex items-start gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <span className="mt-2 h-3.5 w-3.5 shrink-0 rounded-full bg-emerald-500" />
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-2xl font-bold text-emerald-900 leading-snug">
                                    {t('noteTitle')}
                                </h2>
                                <p className="text-base md:text-xl text-emerald-800 leading-relaxed">
                                    {t('noteBody')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
