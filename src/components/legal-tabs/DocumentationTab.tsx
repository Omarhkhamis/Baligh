'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function DocumentationTab() {
    const t = useTranslations('legal.documentationContent');

    return (
        <div className="space-y-12">
            {/* Legal Screenshot Section */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-r-4 border-green-600 pr-4">
                    📸 {t('screenshotTitle')}
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-lg text-gray-700 mb-6">
                        {t('screenshotIntro')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                                <span>✅</span>
                                <span>{t('mustIncludeTitle')}</span>
                            </h3>
                            <ul className="space-y-3">
                                {(t.raw('mustInclude') as string[]).map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-green-600 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                <span>❌</span>
                                <span>{t('mistakesTitle')}</span>
                            </h3>
                            <ul className="space-y-3">
                                {(t.raw('mistakes') as string[]).map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-red-600 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
                        <p className="text-blue-900 font-medium">
                            💡 <strong>{t('proTip')}</strong> {t('proTipText')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Archiving Tools Section */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-r-4 border-green-600 pr-4">
                    🗄️ {t('archivingTitle')}
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-lg text-gray-700 mb-6">
                        {t('archivingIntro')}
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        {(t.raw('archiveTools') as Array<{ name: string, icon: string, description: string, link: string }>).map((tool, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="text-4xl mb-3 text-center">{tool.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{tool.name}</h3>
                                <p className="text-sm text-gray-600 mb-4 text-center">{tool.description}</p>
                                <a
                                    href={tool.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center text-sm text-green-600 font-bold hover:underline"
                                >
                                    {t('visitWebsite')}
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">{t('archivingStepsTitle')}</h3>
                        <ol className="space-y-3">
                            {(t.raw('archivingSteps') as string[]).map((step, i) => (
                                <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-800 mt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Secure Storage Section */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-r-4 border-green-600 pr-4">
                    🔒 {t('storageTitle')}
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('whereToStoreTitle')}</h3>
                            <ul className="space-y-3">
                                {(t.raw('whereToStore') as Array<{ title: string, desc: string }>).map((item, i) => (
                                    <li key={i} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-bold text-gray-900">{item.title}</div>
                                        <div className="text-sm text-gray-600">{item.desc}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('securityTitle')}</h3>
                            <ul className="space-y-3">
                                {(t.raw('securityTips') as string[]).map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-green-600 mt-1">🔐</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
                        <p className="text-yellow-900 font-medium">
                            ⚠️ <strong>{t('retentionTitle')}</strong> {t('retentionText')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Tips */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>💡</span>
                    <span>{t('quickTipsTitle')}</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {(t.raw('quickTips') as string[]).map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                            <span className="text-green-600 text-xl mt-1">✓</span>
                            <span className="text-gray-800">{tip}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
