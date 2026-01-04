'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

// Icons
const IconSyria = () => <span className="text-4xl">🇸🇾</span>;
const IconWorld = () => <span className="text-4xl">🌍</span>;
const IconMobile = () => <span className="text-4xl">📱</span>;
const IconScale = () => (
    <svg className="w-6 h-6 text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

export default function ReportingTab() {
    const t = useTranslations('legal.reportingContent');
    const [activeOption, setActiveOption] = useState<'inside' | 'outside' | 'platforms' | null>(null);

    const options = [
        { id: 'inside', title: t('options.inside.title'), desc: t('options.inside.desc'), icon: IconSyria, color: 'border-green-500 bg-green-50/50' },
        { id: 'outside', title: t('options.outside.title'), desc: t('options.outside.desc'), icon: IconWorld, color: 'border-blue-500 bg-blue-50/50' },
        { id: 'platforms', title: t('options.platforms.title'), desc: t('options.platforms.desc'), icon: IconMobile, color: 'border-purple-500 bg-purple-50/50' },
    ] as const;

    return (
        <div className="space-y-12">
            {/* Reporting Guide Section */}
            <section className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                    <div className="bg-blue-100 p-4 rounded-2xl flex-shrink-0">
                        <span className="text-3xl">📋</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('title')}
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed font-medium">
                            {t('guide.intro')}
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="bg-[#1E8C4E] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">✓</span>
                        {t('guide.stepsTitle')}
                    </h3>
                    <div className="grid gap-4">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex gap-4 transition-colors hover:border-green-200 hover:bg-green-50/30">
                                <span className="font-bold text-green-600 text-xl font-mono">0{idx + 1}</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">{t(`guide.steps.${idx}.title`)}</h4>
                                    {t(`guide.steps.${idx}.desc`) && (
                                        <p className="text-gray-600 text-sm">{t(`guide.steps.${idx}.desc`)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conclusion */}
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 font-medium flex gap-3 text-lg">
                    <span>💡</span>
                    <p>{t('guide.conclusion')}</p>
                </div>
            </section>
            {/* Decision Section */}
            <section className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
                    <span>🧭</span> {t('decisionTitle')}
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-10 font-medium">
                    {t('decisionIntro')}
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    {options.map((option) => {
                        const isActive = activeOption === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setActiveOption(option.id)}
                                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 group hover:shadow-lg text-center ${isActive
                                    ? `bg-white ${option.color} shadow-md transform scale-[1.02]`
                                    : 'bg-white border-gray-100 hover:border-gray-300 hover:-translate-y-1'
                                    }`}
                            >
                                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    <option.icon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                                <p className="text-gray-600 text-sm font-medium">{option.desc}</p>

                                {isActive && (
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-r-2 border-b-2 border-inherit rotate-45 z-10"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>


            {/* Content Display Area */}
            {activeOption && (
                <div className="animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>

                    {/* Inside Government (Syria) */}
                    {activeOption === 'inside' && (
                        <div className="p-8 md:p-12 animate-fade-in">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                                <div className="bg-green-100 p-3 rounded-2xl">
                                    <IconScale />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{t('insideSyria.title')}</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                                        {t('insideSyria.desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Outside Government */}
                    {activeOption === 'outside' && (
                        <div className="p-8 md:p-12 animate-fade-in">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                                <div className="bg-blue-100 p-3 rounded-2xl">
                                    <IconWorld />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{t('outsideSyria.title')}</h3>
                                    <p className="text-gray-600 mt-1">{t('outsideSyria.desc')}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-10 flex items-start gap-3">
                                <span className="text-2xl mt-0.5">ℹ️</span>
                                <p className="text-blue-900 font-medium text-lg">
                                    {t('outsideSyria.action')}
                                </p>
                            </div>


                        </div>
                    )}

                    {/* Platforms */}
                    {activeOption === 'platforms' && (
                        <div className="p-8 md:p-12 animate-fade-in">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                                <div className="bg-purple-100 p-3 rounded-2xl">
                                    <IconMobile />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{t('platforms.title')}</h3>
                                    <p className="text-gray-600 mt-1">{t('platforms.desc')}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6 mb-10">
                                {[
                                    { name: 'Facebook', color: 'bg-blue-600', link: 'https://www.facebook.com/help/reportlinks' },
                                    { name: 'TikTok', color: 'bg-black', link: 'https://www.tiktok.com/community-guidelines' },
                                    { name: 'YouTube', color: 'bg-red-600', link: 'https://www.youtube.com/howyoutubeworks/policies/community-guidelines/' },
                                    { name: 'Telegram', color: 'bg-blue-400', link: 'https://telegram.org/faq#q-there-s-illegal-content-on-telegram-how-do-i-take-it-down' }
                                ].map((platform) => (
                                    <div key={platform.name} className="bg-white p-6 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                                        <div className={`w-12 h-12 ${platform.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl`}>
                                            {platform.name[0]}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-4">{platform.name}</h3>
                                        <a
                                            href={platform.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-green-600 font-bold hover:underline bg-green-50 px-4 py-2 rounded-lg block"
                                        >
                                            Link ↗
                                        </a>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-red-50 border-r-4 border-red-500 p-6 rounded-xl">
                                <p className="text-red-900 text-lg font-medium">
                                    ⚠️ {t('platforms.warning')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}




            {/* Limitations */}
            <section className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start gap-6 shadow-sm">
                <span className="text-4xl bg-gray-100 p-4 rounded-full">⚖️</span>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('limitations.title')}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {t('limitations.text')}
                    </p>
                </div>
            </section>
        </div>
    );
}
