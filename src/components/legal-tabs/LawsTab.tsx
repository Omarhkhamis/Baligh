'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import InteractiveLegalMap from '../InteractiveLegalMap';

// Icons
const IconScroll = () => (
    <svg className="w-10 h-10 text-[#1E8C4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);



export default function LawsTab() {
    const t = useTranslations('legal.lawsContent');
    const tMap = useTranslations('legal.map');
    const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);


    return (
        <div className="space-y-12">
            {/* Introduction & Tabs */}
            <section>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-green-100 p-3 rounded-2xl">
                            <IconScroll />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('title')}
                            </h2>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed max-w-4xl text-lg mb-8">
                        {t('description')}
                    </p>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 flex items-start gap-4">
                        <span className="text-2xl">💡</span>
                        <div className="prose prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: t.raw('sectionInfo') }} />
                    </div>

                    {/* Region Tabs */}




                </div>
            </section>

            {/* Interactive Map */}
            <section className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50 text-center">
                    <p className="text-xl font-medium text-gray-800 mb-2">
                        {t('mapInstruction')}
                    </p>
                </div>
                <div className="p-4">
                    <InteractiveLegalMap
                        selectedCountry={selectedCountry}
                        onSelectCountry={setSelectedCountry}
                    />
                </div>
            </section>
        </div>
    );
}
