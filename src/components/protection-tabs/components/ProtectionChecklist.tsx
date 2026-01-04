'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ProtectionChecklist() {
    const t = useTranslations('protection.content.tools.protection');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const items = [
        { id: 'privacy', title: t('items.privacy.title'), description: t('items.privacy.desc'), icon: '🔒' },
        { id: 'unknown', title: t('items.unknown.title'), description: t('items.unknown.desc'), icon: '👤' },
        { id: 'data', title: t('items.data.title'), description: t('items.data.desc'), icon: '🛡️' },
        { id: 'password', title: t('items.password.title'), description: t('items.password.desc'), icon: '🔑' },
        { id: 'twofactor', title: t('items.twofactor.title'), description: t('items.twofactor.desc'), icon: '📱' }
    ];

    const toggleCheck = (id: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(id)) {
            newChecked.delete(id);
        } else {
            newChecked.add(id);
        }
        setCheckedItems(newChecked);
    };

    const progress = (checkedItems.size / items.length) * 100;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${progress}%` }}
                >
                    {progress > 0 && (
                        <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
                    )}
                </div>
            </div>

            {/* Checklist Items */}
            <div className="grid md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className={`flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${checkedItems.has(item.id)
                            ? 'bg-indigo-50 border-indigo-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={checkedItems.has(item.id)}
                            onChange={() => toggleCheck(item.id)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{item.icon}</span>
                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    </label>
                ))}
            </div>

            {/* Completion Message */}
            {progress === 100 && (
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl text-center animate-fade-in">
                    <span className="text-4xl mb-2 block">🎉</span>
                    <p className="text-xl font-bold">{t('completion')}</p>
                </div>
            )}
        </div>
    );
}
