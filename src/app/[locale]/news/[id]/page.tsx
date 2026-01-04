'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '../../../../components/AppHeader';
import AppFooter from '../../../../components/AppFooter';
import ShareButtons from '../../../../components/ShareButtons';
import { useLocale, useTranslations } from 'next-intl';
import { NEWS_CATEGORIES, type NewsCategoryKey } from '@/data/newsCategories';

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

const YT_REGEX = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)[^\s]+)/i;

function extractYouTubeId(rawUrl: string): string | null {
    try {
        const normalized = rawUrl.trim().startsWith('http') ? rawUrl.trim() : `https://${rawUrl.trim()}`;
        const u = new URL(normalized);
        if (u.hostname.includes('youtu.be')) {
            const id = u.pathname.split('/').filter(Boolean)[0];
            return id || null;
        }
        if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/live/')) {
            const [, , id] = u.pathname.split('/');
            return id || null;
        }
        if (u.searchParams.get('v')) {
            return u.searchParams.get('v');
        }
        const parts = u.pathname.split('/');
        const embedIndex = parts.findIndex((p) => p === 'embed' || p === 'v');
        if (embedIndex !== -1 && parts[embedIndex + 1]) {
            return parts[embedIndex + 1];
        }
        return null;
    } catch {
        return null;
    }
}

function toYouTubeEmbed(url?: string | null): string | null {
    if (!url) return null;
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestBranding=1` : null;
}

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale() as 'ar' | 'en' | 'ku';
    const t = useTranslations('news');
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/news/${params.id}`);
                if (!res.ok) {
                    setNewsItem(null);
                } else {
                    const data = await res.json();
                    setNewsItem(data);
                }
            } catch (e) {
                console.error(e);
                setNewsItem(null);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader />
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <p className="text-gray-500 text-xl font-medium">{t('loading')}</p>
                </div>
                <AppFooter />
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader />
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('noNews')}</h1>
                    <button
                        onClick={() => router.push(`/${locale}/news`)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                        {t('title')}
                    </button>
                </div>
                <AppFooter />
            </div>
        );
    }

    const categoryKey = (newsItem.category || '').toLowerCase() as NewsCategoryKey;
    const safeCategoryKey = NEWS_CATEGORIES[categoryKey] ? categoryKey : 'other';
    const category = NEWS_CATEGORIES[safeCategoryKey] || NEWS_CATEGORIES.other;
    const categoryLabel = t(`categories.${safeCategoryKey}`, { defaultMessage: category.label });
    const title = newsItem.title?.[locale] || newsItem.title?.ar || newsItem.title?.en || '';
    const body = newsItem.body?.[locale] || newsItem.body?.ar || newsItem.body?.en || '';

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString(t('dateFormat'), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />

            {/* Hero Image */}
            {newsItem.imageUrl && (
                <div className="relative h-96 bg-gray-900 overflow-hidden">
                    <img
                        src={newsItem.imageUrl}
                        alt={title}
                        className="object-cover opacity-90 w-full h-full"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            )}

            {/* Content */}
            <article className="max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push(`/${locale}/news`)}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
                >
                    <span>←</span>
                    <span>{t('title')}</span>
                </button>

                {/* Category Badge */}
                <div className="mb-4">
                    {(() => {
                        const colorMap: Record<string, string> = {
                            blue: 'bg-blue-100 text-blue-700',
                            purple: 'bg-purple-100 text-purple-700',
                            green: 'bg-green-100 text-green-700',
                            orange: 'bg-orange-100 text-orange-700',
                            yellow: 'bg-yellow-100 text-yellow-700',
                            gray: 'bg-gray-100 text-gray-700',
                        };
                        const colorClass = colorMap[category.color] || 'bg-gray-100 text-gray-700';

                        return (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${colorClass}`}>
                                <span className="text-lg">{category.icon}</span>
                                <span>{categoryLabel}</span>
                            </span>
                        );
                    })()}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    {title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(newsItem.publishedAt || newsItem.createdAt || '')}</span>
                    </div>
                    {(() => {
                        const name = locale === 'en' ? (newsItem.authorNameEn || newsItem.authorName) : (newsItem.authorName || newsItem.authorNameEn);
                        if (!name) return null;
                        return (
                        <div className="flex items-center gap-2">
                            <span>✍️</span>
                            <span className="font-semibold text-gray-700">{name}</span>
                        </div>
                        );
                    })()}
                </div>

                {/* Video Section */}
                {newsItem.videoUrl && (
                    <div className="mb-8">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={toYouTubeEmbed(newsItem.videoUrl) || newsItem.videoUrl}
                                title={title}
                                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                        {body}
                    </div>
                </div>

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('share')}</h3>
                    <ShareButtons title={title} />
                </div>

                {/* Back to News Button */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push(`/${locale}/news`)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
                    >
                        {t('title')}
                    </button>
                </div>
            </article>

            <AppFooter />
        </div>
    );
}
