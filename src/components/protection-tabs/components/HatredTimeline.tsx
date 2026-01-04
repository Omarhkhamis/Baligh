'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function HatredTimeline() {
    const t = useTranslations('protection.content.awareness.timeline');

    const stages = [
        {
            number: 1,
            title: t('stages.1.title'),
            description: t('stages.1.desc'),
            color: 'red',
            icon: '⚠️'
        },
        {
            number: 2,
            title: t('stages.2.title'),
            description: t('stages.2.desc'),
            color: 'orange',
            icon: '📢'
        },
        {
            number: 3,
            title: t('stages.3.title'),
            description: t('stages.3.desc'),
            color: 'yellow',
            icon: '🔥'
        }
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; shadow: string }> = {
        red: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            text: 'text-red-600',
            badge: 'bg-red-500',
            shadow: 'shadow-red-100'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-500',
            text: 'text-orange-600',
            badge: 'bg-orange-500',
            shadow: 'shadow-orange-100'
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-500',
            text: 'text-yellow-600',
            badge: 'bg-yellow-500',
            shadow: 'shadow-yellow-100'
        }
    };

    return (
        <div className="relative py-8">
            {/* Central Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-200 via-orange-200 to-yellow-200 rounded-full"></div>

            {/* Mobile Line */}
            <div className="md:hidden absolute right-8 top-0 bottom-0 w-1 bg-gradient-to-b from-red-200 via-orange-200 to-yellow-200 rounded-full"></div>

            <div className="space-y-12 relative">
                {stages.map((stage, index) => {
                    const colors = colorMap[stage.color];
                    const isEven = index % 2 === 0;

                    return (
                        <div key={stage.number} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>

                            {/* Empty Space for Desktop Alternating Layout */}
                            <div className="hidden md:block w-1/2"></div>

                            {/* Center Node */}
                            <div className="absolute right-4 md:left-1/2 md:right-auto transform md:-translate-x-1/2 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-4 border-white shadow-lg z-10">
                                <div className={`w-full h-full rounded-full ${colors.badge} flex items-center justify-center text-white font-bold text-lg md:text-2xl`}>
                                    {stage.number}
                                </div>
                            </div>

                            {/* Card Container */}
                            <div className={`w-full md:w-1/2 pl-0 pr-16 md:px-12`}>
                                <div className={`bg-white p-6 rounded-2xl shadow-lg border-t-4 ${colors.border} hover:shadow-xl transition-all transform hover:-translate-y-1 group`}>
                                    <div className="flex items-start gap-4">
                                        <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{stage.icon}</span>
                                        <div>
                                            <h4 className={`text-xl font-bold ${colors.text} mb-2`}>{stage.title}</h4>
                                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                                {stage.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
