"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { useTranslations, useLocale } from 'next-intl';
import { normalizeReportCategory, REPORT_CATEGORIES, type ReportCategoryKey } from '@/data/reportCategories';

// Icons
const IconChart = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || 'w-16 h-16 text-gray-300'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const IconFolder = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const IconInitiative = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const IconStudy = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const IconAnalytical = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} className={props.className || 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);

const IconDownload = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const IconCalendar = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

type ReportItem = {
    id: string;
    title: Record<string, string>;
    summary?: Record<string, string>;
    body?: Record<string, string>;
    category: string;
    authorName?: string | null;
    authorNameEn?: string | null;
    imageUrl?: string | null;
    documentUrl?: string | null;
    documentUrlAr?: string | null;
    documentUrlEn?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
};

export default function ReportsPage() {
    const t = useTranslations('reports');
    const locale = useLocale() as 'ar' | 'en' | 'ku';
    const [activeTab, setActiveTab] = useState<ReportCategoryKey | 'all'>('all');
    const [items, setItems] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 'all' as const, label: t('categories.all'), icon: IconFolder },
        { id: 'initiative' as const, label: t('categories.initiative'), icon: IconInitiative },
        { id: 'analytical' as const, label: t('categories.analytical'), icon: IconAnalytical },
        { id: 'study' as const, label: t('categories.study'), icon: IconStudy },
        { id: 'infographic' as const, label: t('categories.infographic', { defaultMessage: 'Infographics' }), icon: IconAnalytical },
        { id: 'policy' as const, label: t('categories.policy', { defaultMessage: 'Policy Briefs' }), icon: IconAnalytical },
    ];

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const qs = activeTab === 'all' ? '' : `?category=${activeTab}`;
                const res = await fetch(`/api/reports${qs}`);
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [activeTab]);

    const filteredReports = useMemo(() => items, [items]);

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
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />

            {/* Custom Header Section */}
            <div className="bg-gradient-to-br from-green-50/80 to-white pb-2 pt-8 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    {/* Icon */}
                    <div className="text-2xl mb-1">
                        📊
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

                    {/* Tabs (Pill Style) */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(category.id)}
                                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === category.id
                                    ? 'bg-[#1E8C4E] text-white shadow-lg shadow-green-200 transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#1E8C4E] border border-gray-100'
                                    }`}
                            >
                                <category.icon className={`w-5 h-5 ${activeTab === category.id ? 'text-white' : 'text-gray-500'}`} />
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Introduction */}
                    {t('intro') && (
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <p className="text-xl text-gray-700 leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                {t('intro')}
                            </p>
                        </div>
                    )}

                    {/* Reports Grid */}
                    <div>
                        {loading ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <IconChart />
                                </div>
                                <p className="text-gray-500 text-xl font-medium">{t('loading')}</p>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <IconChart />
                                </div>
                                <p className="text-gray-500 text-xl font-medium">{t('noReports')}</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {filteredReports.map((item) => {
                                    const title = item.title?.[locale] || item.title?.ar || item.title?.en || '';
                                    const description = item.summary?.[locale] || item.summary?.ar || item.summary?.en || '';
                                    const categoryKey = normalizeReportCategory(item.category);
                                    const category = REPORT_CATEGORIES[categoryKey] || REPORT_CATEGORIES.other;
                                    const categoryLabel = t(`categories.${categoryKey}`, { defaultMessage: category.label });
                                    const author = locale === 'en'
                                        ? (item.authorNameEn || item.authorName)
                                        : (item.authorName || item.authorNameEn);
                                    const pdfUrl = (() => {
                                        if (locale === 'ar') return item.documentUrlAr || item.documentUrlEn || item.documentUrl || null;
                                        if (locale === 'en') return item.documentUrlEn || item.documentUrlAr || item.documentUrl || null;
                                        return item.documentUrlEn || item.documentUrlAr || item.documentUrl || null;
                                    })();

                                    return (
                                        <article
                                            key={item.id}
                                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group"
                                        >
                                            {/* Image */}
                                            <a href={`/${locale}/reports/${item.id}`} className="block relative h-64 bg-gray-200 overflow-hidden cursor-pointer">
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                                                {item.imageUrl ? (
                                                    <>
                                                        {/* Use native img for dynamic uploads to avoid Next Image 400s */}
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={title}
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500 w-full h-full"
                                                            loading="lazy"
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                                                        <IconChart />
                                                    </div>
                                                )}
                                            </a>

                                            {/* Content */}
                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="text-sm text-[#1E8C4E] font-bold mb-4 flex items-center gap-2 bg-green-50 w-fit px-3 py-1 rounded-full">
                                                    <IconCalendar />
                                                    {formatDate(item.publishedAt || item.createdAt)}
                                                </div>
                                                {author && (
                                                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                                        <span>✍️</span>
                                                        <span>{author}</span>
                                                    </div>
                                                )}

                                                <a href={`/${locale}/reports/${item.id}`} className="block">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#1E8C4E] transition-colors line-clamp-2">
                                                        {title}
                                                    </h3>
                                                </a>

                                                <p className="text-gray-600 text-base leading-relaxed mb-6 flex-1 line-clamp-3">
                                                    {description}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <IconFolder className="w-4 h-4" />
                                                        <span>{categoryLabel}</span>
                                                    </div>

                                                    {pdfUrl && (
                                                        <a
                                                            href={pdfUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-[#1E8C4E] font-semibold text-sm hover:gap-3 transition-all"
                                                        >
                                                            <IconDownload />
                                                            <span>{t('download')}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
