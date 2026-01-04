'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function ReportingSteps() {
    const t = useTranslations('protection.content.tools.reporting');

    const steps = [
        {
            number: 1,
            title: t('steps.1.title'),
            description: t('steps.1.desc'),
            tips: [t('steps.1.tips.0'), t('steps.1.tips.1'), t('steps.1.tips.2')],
            icon: '📸',
            color: 'blue'
        },
        {
            number: 2,
            title: t('steps.2.title'),
            description: t('steps.2.desc'),
            tips: [t('steps.2.tips.0'), t('steps.2.tips.1'), t('steps.2.tips.2')],
            icon: '🚩',
            color: 'orange'
        },
        {
            number: 3,
            title: t('steps.3.title'),
            description: t('steps.3.desc'),
            tips: [t('steps.3.tips.0'), t('steps.3.tips.1'), t('steps.3.tips.2')],
            icon: '⚖️',
            color: 'green'
        }
    ];

    return (
        <div className="space-y-6">
            {steps.map((step) => (
                <div
                    key={step.number}
                    className={`bg-${step.color}-50 p-8 rounded-2xl border-2 border-${step.color}-200 hover:shadow-lg transition-all`}
                >
                    <div className="flex items-start gap-6">
                        {/* Number Badge */}
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-${step.color}-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg`}>
                            {step.number}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{step.icon}</span>
                                <h4 className="text-2xl font-bold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4">{step.description}</p>

                            {/* Tips */}
                            <div className="bg-white p-4 rounded-lg border-r-4 border-${step.color}-500">
                                <p className="font-bold text-gray-900 mb-2">💡 نصائح:</p>
                                <ul className="space-y-2">
                                    {step.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                                            <span className="text-${step.color}-600 font-bold">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Important Note */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
                <p className="text-lg font-bold text-center">
                    {t('note')}
                </p>
            </div>
        </div>
    );
}
