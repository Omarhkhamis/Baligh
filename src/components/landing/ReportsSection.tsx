"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { REPORT_CATEGORIES, type ReportCategoryKey } from '@/data/reportCategories';

const IconChart = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

type ReportItem = {
    id: string;
    title: Record<string, string>;
    summary?: Record<string, string>;
    category: string;
    imageUrl?: string | null;
    documentUrl?: string | null;
    authorName?: string | null;
    authorNameEn?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
};

export default function ReportsSection() {
    const locale = useLocale() as 'ar' | 'en' | 'ku';
    const t = useTranslations('reports');
    const [items, setItems] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/reports');
                if (!res.ok) {
                    console.warn(`Failed to load reports: ${res.status}`);
                    setItems([]);
                } else {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setItems(data.slice(0, 2));
                    }
                }
            } catch (e) {
                console.error('Error loading reports', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const latestReports = useMemo(() => items, [items]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'ar' ? 'ar-SY' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <section className="py-12 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 col-span-full">{t('loading')}</p>
                    ) : latestReports.length === 0 ? (
                        <p className="text-center text-gray-500 col-span-full">{t('noReports')}</p>
                    ) : (
                        latestReports.map((item) => {
                            const title = item.title?.[locale] || item.title?.ar || item.title?.en || '';
                            const description = item.summary?.[locale] || item.summary?.ar || item.summary?.en || '';
                            const category = REPORT_CATEGORIES[item.category as ReportCategoryKey] || REPORT_CATEGORIES.other;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/${locale}/reports/${item.id}`}
                                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                >
                                    {/* Image */}
                                    {item.imageUrl && (
                                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                                            <Image
                                                src={item.imageUrl}
                                                alt={title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        {/* Category Badge */}
                                        <div className="mb-4">
                                            {(() => {
                                                const colorMap: Record<string, string> = {
                                                    blue: 'bg-blue-50 text-blue-700 border-blue-100',
                                                    purple: 'bg-purple-50 text-purple-700 border-purple-100',
                                                    green: 'bg-green-50 text-green-700 border-green-100',
                                                    orange: 'bg-orange-50 text-orange-700 border-orange-100',
                                                    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                                    teal: 'bg-teal-50 text-teal-700 border-teal-100',
                                                    gray: 'bg-gray-50 text-gray-700 border-gray-100',
                                                };
                                                const colorClass = colorMap[category.color] || colorMap.gray;
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${colorClass}`}>
                                                        <span>{category.icon}</span>
                                                        <span>{category.label}</span>
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2 leading-tight">
                                            {title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                            {description}
                                        </p>

                                        {/* Footer: Date & Download */}
                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                            <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                                <IconChart />
                                                <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                                            </div>
                                            {item.documentUrl && (
                                                <div className="flex items-center gap-2 text-green-700 font-bold text-sm group-hover:gap-3 transition-all">
                                                    <span>{t('download')}</span>
                                                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* View All Button */}
                <div className="text-center mt-10">
                    <Link
                        href={`/${locale}/reports`}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-white border-2 border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-600 font-bold rounded-full transition-all duration-300 hover:shadow-lg"
                    >
                        <span>{t('viewAll')}</span>
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
