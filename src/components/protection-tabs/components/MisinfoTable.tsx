'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function MisinfoTable() {
    const t = useTranslations('protection.content.awareness.misinfo');

    const mechanisms = [
        {
            name: t('mechanisms.framing.name'),
            definition: t('mechanisms.framing.def'),
            example: t('mechanisms.framing.ex'),
            icon: '🎯'
        },
        {
            name: t('mechanisms.generalization.name'),
            definition: t('mechanisms.generalization.def'),
            example: t('mechanisms.generalization.ex'),
            icon: '🔄'
        },
        {
            name: t('mechanisms.halfTruth.name'),
            definition: t('mechanisms.halfTruth.def'),
            example: t('mechanisms.halfTruth.ex'),
            icon: '⚖️'
        },
        {
            name: t('mechanisms.echoChambers.name'),
            definition: t('mechanisms.echoChambers.def'),
            example: t('mechanisms.echoChambers.ex'),
            icon: '🔊'
        }
    ];

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full bg-white rounded-xl overflow-hidden shadow-md">
                    <thead className="bg-purple-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-right font-bold w-1/4">{t('headers.mechanism')}</th>
                            <th className="px-6 py-4 text-right font-bold w-2/4">{t('headers.definition')}</th>
                            <th className="px-6 py-4 text-right font-bold w-1/4">{t('headers.example')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mechanisms.map((mech, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-purple-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{mech.icon}</span>
                                        <span className="font-bold text-gray-900">{mech.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{mech.definition}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm italic">{mech.example}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {mechanisms.map((mech, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{mech.icon}</span>
                            <h4 className="text-xl font-bold text-gray-900">{mech.name}</h4>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{mech.definition}</p>
                        <div className="bg-purple-50 p-3 rounded-lg border-r-4 border-purple-400">
                            <p className="text-sm text-gray-600 italic">
                                <strong>{t('headers.example')}:</strong> {mech.example}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
