'use client';

import React from 'react';
import { CountryLegalData } from '@/lib/countryReportingData';
import { useTranslations, useLocale } from 'next-intl';

interface CountryLegalModalProps {
    country: CountryLegalData;
    onClose: () => void;
}

export default function CountryLegalModal({ country, onClose }: CountryLegalModalProps) {
    const t = useTranslations('legal.modal');
    const tCountries = useTranslations('legal.countries');
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const laws = isArabic ? country.lawsAr : country.laws;
    const definition = isArabic ? country.definitionAr : country.definition;
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl">{country.flag}</span>
                                <div>
                                    <h2 className="text-2xl font-bold">{tCountries(country.countryName)}</h2>
                                    <p className="text-green-100 text-sm">{country.countryName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                                aria-label={t('close')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Laws Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{t('relevantLaws')}</h3>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-5 space-y-3">
                                {laws.map((law, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <span className="text-blue-600 font-bold mt-1">•</span>
                                        <p className="text-gray-800 font-medium">{law}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border-r-4 border-green-500">
                                <p className="text-gray-700 leading-relaxed">{definition}</p>
                            </div>
                        </div>

                        {/* Reporting Agencies Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{t('reportingAgencies')}</h3>
                            </div>

                            <div className="space-y-3">
                                {country.agencies.map((agency, index) => (
                                    <div
                                        key={index}
                                        className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-500 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1">{isArabic ? agency.nameAr : agency.name}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{agency.name}</p>
                                                {agency.email && (
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        📧 {agency.email}
                                                    </p>
                                                )}
                                            </div>
                                            <a
                                                href={agency.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                            >
                                                {t('visitWebsite')} →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Note */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-yellow-900 mb-1">{t('importantNote')}</p>
                                    <p className="text-sm text-yellow-800">
                                        {t('evidenceNote')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
