'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HatredTimeline from './components/HatredTimeline';
import AnalysisChecklist from './components/AnalysisChecklist';
import MisinfoTable from './components/MisinfoTable';

// Icons
const IconClock = () => (
    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconChecklist = () => (
    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const IconWarning = () => (
    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export default function AwarenessTab() {
    const t = useTranslations('protection.content.awareness');

    return (
        <div className="space-y-12">
            {/* Executive Summary & Intro */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10 border-b border-gray-50">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        {t('title')}
                    </h2>



                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t('intro')}
                    </p>
                </div>
            </div>

            {/* Section 1: Hatred Timeline */}
            <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div className="bg-green-50 p-4 rounded-2xl text-[#1E8C4E]">
                        <IconClock />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('timeline.title')}
                        </h3>
                    </div>
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-4xl">
                    {t('timeline.intro')}
                </p>

                <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
                    <HatredTimeline />
                </div>

                <div className="mt-8 flex items-start gap-4 bg-green-50/50 p-6 rounded-xl border border-green-100">
                    <span className="text-2xl">💡</span>
                    <p className="text-green-900 text-lg font-medium leading-relaxed pt-1">
                        {t('timeline.tip')}
                    </p>
                </div>
            </section>

            {/* Section 2: Analysis Checklist */}
            <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <IconChecklist />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('checklist.title')}
                        </h3>
                    </div>
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    {t('checklist.intro')}
                </p>

                <div className="bg-blue-50/30 p-6 md:p-8 rounded-2xl border border-blue-100/50">
                    <AnalysisChecklist />
                </div>
            </section>

            {/* Section 3: Misinformation Table */}
            <section className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                        <IconWarning />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('misinfo.title')}
                        </h3>
                    </div>
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    {t('misinfo.intro')}
                </p>

                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                    <MisinfoTable />
                </div>

                <div className="mt-8 flex items-start gap-4 bg-purple-50/50 p-6 rounded-xl border border-purple-100">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-purple-900 text-lg font-medium leading-relaxed pt-1">
                        {t('misinfo.tip')}
                    </p>
                </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#1E8C4E] to-[#166639] p-8 rounded-2xl text-center shadow-md text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-2xl font-bold mb-3">
                        {t('cta.title')}
                    </h4>
                    <p className="text-lg text-green-50 max-w-2xl mx-auto leading-relaxed">
                        {t('cta.desc')}
                    </p>
                </div>
            </div>
        </div>
    );
}
