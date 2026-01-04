'use client';

import { useState } from 'react';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import HateSpeechTab from '../../../components/legal-tabs/HateSpeechTab';
import DocumentationTab from '../../../components/legal-tabs/DocumentationTab';
import LawsTab from '../../../components/legal-tabs/LawsTab';
import ReportingTab from '../../../components/legal-tabs/ReportingTab';
import FAQTab from '../../../components/legal-tabs/FAQTab';
import { useTranslations } from 'next-intl';

// Icons
const IconScale = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

const IconCamera = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconScroll = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconSend = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const IconQuestion = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function LegalPage() {
    const t = useTranslations('legal');
    const tabsT = useTranslations('legal.tabs');
    const [activeTab, setActiveTab] = useState('hate-speech');

    const tabs = [
        { id: 'hate-speech', label: tabsT('hateSpeech'), icon: IconScale },
        { id: 'documentation', label: tabsT('documentation'), icon: IconCamera },
        { id: 'laws', label: tabsT('laws'), icon: IconScroll },
        { id: 'reporting', label: tabsT('reporting'), icon: IconSend },
        { id: 'faq', label: tabsT('faq'), icon: IconQuestion }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />

            {/* Custom Header Section */}
            <div className="bg-gradient-to-br from-green-50/80 to-white pb-2 pt-8 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    {/* Icon */}
                    <div className="text-2xl mb-1">
                        ⚖️
                    </div>
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">
                        {t('title')}
                    </h1>
                    {/* Subtitle */}
                    <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        {t('description')}
                    </p>

                    {/* Divider - Transparent/Subtle & No Gap */}
                    <div className="w-full max-w-2xl mx-auto h-px bg-gray-200/50 mt-3 mb-3"></div>

                    {/* Tabs (Pill Style) */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-full font-bold text-base transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-[#1E8C4E] text-white shadow-lg shadow-green-200 transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-current'}`} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="w-full max-w-7xl mx-auto animate-fade-in min-h-[500px]">
                    {activeTab === 'hate-speech' && <HateSpeechTab />}
                    {activeTab === 'documentation' && <DocumentationTab />}
                    {activeTab === 'laws' && <LawsTab />}
                    {activeTab === 'reporting' && <ReportingTab />}
                    {activeTab === 'faq' && <FAQTab />}
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
