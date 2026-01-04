'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProtectionChecklist from './components/ProtectionChecklist';
import ReportingSteps from './components/ReportingSteps';
import Link from 'next/link';

// Icons
const IconShield = () => (
    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconAlert = () => (
    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const IconReport = () => (
    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

// New Sub-Icons for Immediate Actions
const IconCamera = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconFlag = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-6-4-6 4z" /> {/* Simplified flag metaphor or use standard flag */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 11V3" /> {/* Pole */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h12l-2 3 2 3H4" /> {/* Flag */}
    </svg>
);
// Retrying IconFlag with standard path
const IconFlagStandard = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8m-2 0h2m-2-8a2 2 0 01-2-2v-3a2 2 0 012-2h3" /> {/* This is becoming complex, let's use a simpler one */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 13V5a2 2 0 012-2h11l-3 4 3 4H5v2" />
    </svg>
);


const IconEyeOff = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

// Protection Icons
const IconLock = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconUserX = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const IconDatabase = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const IconKey = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const IconPhone = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

const protectionIcons = {
    privacy: IconLock,
    unknown: IconUserX,
    data: IconDatabase,
    password: IconKey,
    twofactor: IconPhone
};

export default function ToolsTab() {
    const t = useTranslations('protection.content.tools');

    return (
        <div className="space-y-12">
            {/* Introduction - Cleaner, Centered */}
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 relative z-10">
                    {t('title')}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto relative z-10">
                    {t('intro')}
                </p>
            </div>

            {/* Section 1: Technical Protection - Enhanced Grid */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600">
                        <IconShield />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('protection.title')}
                        </h3>
                        <p className="text-gray-500 mt-1">{t('protection.intro')}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50/30 to-blue-50/30 p-8 rounded-3xl border border-indigo-50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {['privacy', 'unknown', 'data', 'password', 'twofactor'].map((item, idx) => {
                            const Icon = protectionIcons[item as keyof typeof protectionIcons];
                            return (
                                <div key={item} className={`bg-white p-6 rounded-2xl border border-indigo-100/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 ${idx >= 3 ? 'lg:col-span-1.5' : ''}`}> {/* Adjusted grid span attempt, or just standard */}
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                                        <Icon />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">{t(`protection.items.${item}.title`)}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{t(`protection.items.${item}.desc`)}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 text-center bg-white/60 backdrop-blur-sm py-4 rounded-xl border border-indigo-100/50 max-w-md mx-auto">
                        <p className="text-indigo-800 font-bold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {t('protection.completion')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Immediate Actions - Professional Cards */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-red-50 p-3.5 rounded-2xl text-red-600">
                        <IconAlert />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {t('immediate.title')}
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Document */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-[0_8px_30px_rgba(239,68,68,0.06)] transition-all duration-300 group text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 group-hover:scale-110 transition-transform duration-300">
                            <IconCamera />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">{t('immediate.document.title')}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{t('immediate.document.desc')}</p>
                    </div>
                    {/* Report */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-[0_8px_30px_rgba(239,68,68,0.06)] transition-all duration-300 group text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 group-hover:scale-110 transition-transform duration-300">
                            <IconFlagStandard />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">{t('immediate.report.title')}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{t('immediate.report.desc')}</p>
                    </div>
                    {/* Ignore */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-[0_8px_30px_rgba(239,68,68,0.06)] transition-all duration-300 group text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 group-hover:scale-110 transition-transform duration-300">
                            <IconEyeOff />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">{t('immediate.ignore.title')}</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">{t('immediate.ignore.desc')}</p>
                    </div>
                </div>

                <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-red-900 text-lg font-medium pt-1">
                        {t('immediate.warning')}
                    </p>
                </div>
            </section>

            {/* Section 3: Advanced Reporting */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600">
                        <IconReport />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {t('reporting.title')}
                    </h3>
                </div>

                <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-50 mb-10 text-center">
                    <p className="text-xl font-medium text-blue-900 leading-relaxed max-w-4xl mx-auto">
                        {t('reporting.intro')}
                    </p>
                </div>

                <ReportingSteps />
            </section>


        </div>
    );
}
