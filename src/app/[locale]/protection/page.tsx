'use client';

import { useState } from 'react';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import AwarenessTab from '../../../components/protection-tabs/AwarenessTab';
import ToolsTab from '../../../components/protection-tabs/ToolsTab';
import ResponsibilityTab from '../../../components/protection-tabs/ResponsibilityTab';
import { useTranslations } from 'next-intl';

// Icons
const IconBrain = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const IconTools = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconHandshake = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

type TabType = 'awareness' | 'tools' | 'responsibility';

export default function ProtectionPage() {
    const t = useTranslations('protection');
    const [activeTab, setActiveTab] = useState<TabType>('awareness');

    const tabs = [
        { id: 'awareness' as TabType, label: t('tabs.awareness'), icon: IconBrain },
        { id: 'tools' as TabType, label: t('tabs.tools'), icon: IconTools },
        { id: 'responsibility' as TabType, label: t('tabs.responsibility'), icon: IconHandshake }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />

            {/* Custom Header Section */}
            <div className="bg-gradient-to-br from-green-50/80 to-white pb-2 pt-8 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    {/* Icon */}
                    <div className="text-2xl mb-1">
                        🛡️
                    </div>
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">
                        {t('title')}
                    </h1>
                    {/* Subtitle */}
                    <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>

                    {/* Divider - Transparent/Subtle & No Gap */}
                    <div className="w-full max-w-2xl mx-auto h-px bg-gray-200/50 mt-3 mb-3"></div>

                    {/* Tabs (Pill Style) - Merged */}
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
                <div className="w-full max-w-7xl mx-auto animate-fade-in min-h-[600px]">
                    {activeTab === 'awareness' && <AwarenessTab />}
                    {activeTab === 'tools' && <ToolsTab />}
                    {activeTab === 'responsibility' && <ResponsibilityTab />}
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
