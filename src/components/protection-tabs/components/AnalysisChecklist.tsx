'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AnalysisChecklist() {
    const t = useTranslations('protection.content.awareness.checklist');
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const questions = [
        t('questions.0'),
        t('questions.1'),
        t('questions.2'),
        t('questions.3'),
        t('questions.4')
    ];

    const toggleCheck = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);
    };

    const checkedCount = checkedItems.size;
    const getResultMessage = () => {
        if (checkedCount === 0) return { text: t('results.low'), color: 'gray' };
        if (checkedCount <= 2) return { text: t('results.medium'), color: 'yellow' };
        return { text: t('results.high'), color: 'red' };
    };

    const result = getResultMessage();

    return (
        <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
            <h4 className="text-xl font-bold text-gray-900 mb-6">{t('title')}</h4>

            <div className="space-y-4 mb-6">
                {questions.map((question, index) => (
                    <label
                        key={index}
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all"
                    >
                        <input
                            type="checkbox"
                            checked={checkedItems.has(index)}
                            onChange={() => toggleCheck(index)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-800 leading-relaxed">{question}</span>
                    </label>
                ))}
            </div>

            {/* Result Indicator */}
            {checkedCount > 0 && (
                <div className={`p-4 bg-${result.color}-100 border-r-4 border-${result.color}-500 rounded-lg animate-fade-in`}>
                    <p className={`text-${result.color}-800 font-bold text-lg`}>
                        {result.text}
                    </p>
                </div>
            )}

            {/* Syrian Context Alert */}
            <div className="mt-6 p-6 bg-white rounded-lg border-r-4 border-blue-600">
                <p className="text-gray-700 leading-relaxed">
                    <strong className="text-blue-800">{t('contextAlert')}</strong>
                </p>
            </div>
        </div>
    );
}
