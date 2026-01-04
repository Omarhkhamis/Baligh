'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Icons
const IconHeart = () => (
    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const IconUserGroup = () => (
    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IconGlobe = () => (
    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconHand = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
const IconFlag = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-6-4-6 4z" /></svg>;

const IconStop = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>; // Refreshed to "Navigation/Action" metaphor or Keep Stop
const IconXCircle = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconSpeaker = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const IconBulb = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;


export default function ResponsibilityTab() {
    const t = useTranslations('protection.content.responsibility');

    return (
        <div className="space-y-12">
            {/* Introduction */}
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 left-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 relative z-10">
                    {t('title')}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto relative z-10">
                    {t('intro')}
                </p>
            </div>

            {/* Section 1: Protect Others */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-green-50 p-3.5 rounded-2xl text-green-600">
                        <IconHeart />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('protectOthers.title')}
                        </h3>
                        <p className="text-gray-500 mt-1 max-w-2xl">{t('protectOthers.intro')}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-[0_8px_30px_rgba(34,197,94,0.06)] transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <IconHand />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{t('protectOthers.support.title')}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {t('protectOthers.support.desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-[0_8px_30px_rgba(34,197,94,0.06)] transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <IconFlag />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{t('protectOthers.reporting.title')}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {t('protectOthers.reporting.desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex items-start gap-4">
                    <div className="p-1 bg-green-100 rounded text-green-600 shrink-0 mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-green-800 font-medium leading-relaxed text-sm md:text-base">
                        {t('protectOthers.note')}
                    </p>
                </div>
            </section>

            {/* Section 2: Your Role */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600">
                        <IconUserGroup />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('bystander.title')}
                        </h3>
                        <p className="text-gray-500 mt-1 max-w-2xl">{t('bystander.intro')}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-all duration-300 text-center group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:rotate-6 transition-transform">
                            <IconXCircle />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{t('bystander.stop.title')}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{t('bystander.stop.desc')}</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-all duration-300 text-center group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:rotate-6 transition-transform">
                            <IconSpeaker />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{t('bystander.warn.title')}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{t('bystander.warn.desc')}</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-all duration-300 text-center group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:rotate-6 transition-transform">
                            <IconBulb />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{t('bystander.positive.title')}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{t('bystander.positive.desc')}</p>
                    </div>
                </div>

                <div className="bg-indigo-50/50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
                    <q className="text-indigo-900 text-lg font-medium italic block">
                        {t('bystander.note')}
                    </q>
                </div>
            </section>

            {/* Section 3: Safe Space */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600">
                        <IconGlobe />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('safeSpace.title')}
                        </h3>
                        <p className="text-gray-500 mt-1 max-w-2xl">{t('safeSpace.intro')}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <p className="text-gray-800 font-bold">{t('safeSpace.reduce')}</p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <p className="text-gray-800 font-bold">{t('safeSpace.share')}</p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                        <p className="text-gray-800 font-bold">{t('safeSpace.create')}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 md:p-14 rounded-3xl text-white text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <q className="text-xl md:text-2xl leading-relaxed font-medium opacity-95 relative z-10 max-w-4xl mx-auto block">
                        {t('safeSpace.quote')}
                    </q>
                </div>
            </section>

            {/* Final CTA */}
            <div className="text-center py-8">
                <Link
                    href="/ar/analyze"
                    className="inline-flex items-center gap-2 bg-[#1E8C4E] text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-[#166639] hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                >
                    {t('cta.title')}
                    <span className="group-hover:translate-x-1 transition-transform">←</span>
                </Link>
                <p className="text-gray-500 mt-4 text-sm">{t('cta.desc')}</p>
            </div>
        </div>
    );
}
