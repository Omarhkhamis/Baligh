'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import PageHero from '../../../components/PageHero';
import { useTranslations, useLocale } from 'next-intl';
import { NEWS_CATEGORIES, type NewsCategoryKey } from '@/data/newsCategories';

// Icons
const IconCalendar = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconArrowRight = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const IconArrowLeft = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const IconPlay = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

type NewsItem = {
    id: string;
    title: Record<string, string>;
    summary?: Record<string, string>;
    body?: Record<string, string>;
    category: string;
    authorName?: string | null;
    authorNameEn?: string | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
};

export default function NewsPage() {
    const router = useRouter();
    const t = useTranslations('news');
    const locale = useLocale() as 'ar' | 'en' | 'ku';
    const [selectedCategory, setSelectedCategory] = useState<NewsCategoryKey | null>(null);
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const qs = selectedCategory ? `?category=${selectedCategory}` : '';
                const res = await fetch(`/api/news${qs}`);
                if (!res.ok) {
                    console.warn(`Failed to load news: ${res.status}`);
                    setItems([]);
                } else {
                    const data = await res.json();
                    setItems(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Error loading news', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [selectedCategory]);

    const filteredNews = useMemo(() => items, [items]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString(locale === 'ar' ? 'ar-SY' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />

            <PageHero
                icon="📰"
                title={t('title')}
                subtitle={t('subtitle')}
            />

            {/* Category Filter */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${selectedCategory === null
                                ? 'bg-[#1E8C4E] text-white shadow-lg shadow-green-200 transform scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                        >
                            <span>📋</span>
                            <span>{t('categories.all')}</span>
                        </button>
                        {Object.entries(NEWS_CATEGORIES).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key as NewsCategoryKey)}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${selectedCategory === key
                                    ? 'bg-[#1E8C4E] text-white shadow-lg shadow-green-200 transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{t(`categories.${key}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* News Grid */}
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500 text-xl font-medium">{t('loading')}</p>
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">📰</span>
                            </div>
                            <p className="text-gray-500 text-xl font-medium">{t('noNews')}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredNews.map((item) => {
                                const categoryKey = (item.category || '').toLowerCase() as NewsCategoryKey;
                                const safeCategoryKey = NEWS_CATEGORIES[categoryKey] ? categoryKey : 'other';
                                const category = NEWS_CATEGORIES[safeCategoryKey] || NEWS_CATEGORIES.other;
                                const categoryLabel = t(`categories.${safeCategoryKey}`, { defaultMessage: category.label });
                                const title = item.title?.[locale] || item.title?.ar || item.title?.en || '';
                                const description = item.summary?.[locale] || item.summary?.ar || item.summary?.en || '';
                                const tags: string[] = [];

                                return (
                                    <article
                                        key={item.id}
                                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full"
                                    >
                                        {/* Image */}
                                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                                            {item.imageUrl ? (
                                                <>
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                                    />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-5xl">
                                                    📰
                                                </div>
                                            )}

                                            {/* Video Badge */}
                                            {item.videoUrl && (
                                                <div className="absolute top-4 right-4 z-20 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm bg-opacity-90">
                                                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                        <IconPlay />
                                                    </div>
                                                    <span>{t('videoBadge')}</span>
                                                </div>
                                            )}

                                            {/* Category Badge */}
                                            <div className="absolute bottom-4 left-4 z-20">
                                                {(() => {
                                                    const colorMap: Record<string, string> = {
                                                        blue: 'bg-blue-100 text-blue-800 border-blue-200',
                                                        purple: 'bg-purple-100 text-purple-800 border-purple-200',
                                                        green: 'bg-green-100 text-green-800 border-green-200',
                                                        orange: 'bg-orange-100 text-orange-800 border-orange-200',
                                                        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                        red: 'bg-red-100 text-red-800 border-red-200',
                                                    };
                                                    const colorClass = colorMap[category.color] || 'bg-gray-100 text-gray-800 border-gray-200';

                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${colorClass}`}>
                                                            <span>{category.icon}</span>
                                                            <span>{categoryLabel}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="text-xs text-gray-500 font-medium mb-3 flex items-center gap-1.5">
                                                <IconCalendar />
                                                <span>{item.publishedAt || item.createdAt ? formatDate(item.publishedAt || item.createdAt || '') : '—'}</span>
                                                {(() => {
                                                    const name = locale === 'en' ? (item.authorNameEn || item.authorName) : (item.authorName || item.authorNameEn);
                                                    return name ? (
                                                    <>
                                                        <span className="mx-1">·</span>
                                                        <span className="font-semibold text-gray-700">{name}</span>
                                                    </>
                                                    ) : null;
                                                })()}
                                            </div>

                                            <Link href={`/${locale}/news/${item.id}`} className="block">
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1E8C4E] transition-colors leading-snug">
                                                    {title}
                                                </h3>
                                            </Link>

                                            <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                                {description}
                                            </p>

                                            {/* Tags */}
                                            {tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {tags.slice(0, 3).map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-100 font-medium"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Read More Button */}
                                            <button
                                                onClick={() => router.push(`/${locale}/news/${item.id}`)}
                                                className="w-full group/btn bg-white border border-gray-200 hover:border-[#1E8C4E] hover:bg-[#1E8C4E] text-gray-700 hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2"
                                            >
                                                <span>{t('readMore')}</span>
                                                {locale === 'ar' || locale === 'ku' ? <IconArrowLeft /> : <IconArrowRight />}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
