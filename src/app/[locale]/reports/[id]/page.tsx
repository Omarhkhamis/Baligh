"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AppHeader from '../../../../components/AppHeader';
import AppFooter from '../../../../components/AppFooter';
import ShareButtons from '../../../../components/ShareButtons';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeReportCategory, REPORT_CATEGORIES } from '@/data/reportCategories';

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

const YT_REGEX = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)[^\s]+)/gi;

function extractYouTubeId(rawUrl: string): string | null {
    try {
        // Ensure protocol
        const normalized = rawUrl.trim().startsWith('http') ? rawUrl.trim() : `https://${rawUrl.trim()}`;
        const u = new URL(normalized);
        // strip trailing punctuation
        u.pathname = u.pathname.replace(/[.,)]+$/, '');
        if (u.hostname.includes('youtu.be')) {
            const id = u.pathname.split('/').filter(Boolean)[0];
            return id || null;
        }
        if (u.pathname.startsWith('/shorts/')) {
            const [, , id] = u.pathname.split('/');
            return id || null;
        }
        if (u.pathname.startsWith('/live/')) {
            const [, , id] = u.pathname.split('/');
            return id || null;
        }
        if (u.searchParams.get('v')) {
            return u.searchParams.get('v');
        }
        const parts = u.pathname.split('/');
        const embedIndex = parts.findIndex((p) => p === 'embed');
        if (embedIndex !== -1 && parts[embedIndex + 1]) {
            return parts[embedIndex + 1];
        }
        return null;
    } catch {
        return null;
    }
}

function youtubeToEmbed(url: string): string | null {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestBranding=1` : null;
}

function renderBodyWithEmbeds(body: string) {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let idx = 0;
    YT_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushText = (text: string, key: string) => {
        if (text && text.trim().length > 0) {
            elements.push(
                <p key={key} className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                    {text}
                </p>
            );
        }
    };

    while ((match = YT_REGEX.exec(body)) !== null) {
        const before = body.slice(lastIndex, match.index);
        pushText(before, `text-${idx}`);
        const embedUrl = youtubeToEmbed(match[0]);
        if (embedUrl) {
            elements.push(
                <div key={`yt-${idx}`} className="my-6 rounded-2xl overflow-hidden bg-black aspect-video">
                    <iframe
                        src={embedUrl}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            );
        } else {
            pushText(match[0], `text-link-${idx}`);
        }
        lastIndex = YT_REGEX.lastIndex;
        idx += 1;
    }

    const tail = body.slice(lastIndex);
    pushText(tail, `text-tail`);

    return elements;
}

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale() as 'ar' | 'en' | 'ku';
    const t = useTranslations('reports');
    const [report, setReport] = useState<ReportItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/reports/${params.id}`);
                if (!res.ok) {
                    setReport(null);
                } else {
                    const data = await res.json();
                    setReport(data);
                }
            } catch (e) {
                console.error(e);
                setReport(null);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(t('dateFormat'), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

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

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader />
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('noReports')}</h1>
                    <button
                        onClick={() => router.push(`/${locale}/reports`)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                        {t('title')}
                    </button>
                </div>
                <AppFooter />
            </div>
        );
    }

    const categoryKey = normalizeReportCategory(report.category);
    const category = REPORT_CATEGORIES[categoryKey] || REPORT_CATEGORIES.other;
    const categoryLabel = t(`categories.${categoryKey}`, { defaultMessage: category.label });
    const title = report.title?.[locale] || report.title?.ar || report.title?.en || '';
    const body = report.body?.[locale] || report.body?.ar || report.body?.en || '';
    const author = locale === 'en'
        ? (report.authorNameEn || report.authorName)
        : (report.authorName || report.authorNameEn);
    const pdfUrl = (() => {
        if (locale === 'ar') return report.documentUrlAr || report.documentUrlEn || report.documentUrl || null;
        if (locale === 'en') return report.documentUrlEn || report.documentUrlAr || report.documentUrl || null;
        return report.documentUrlEn || report.documentUrlAr || report.documentUrl || null; // ku defaults to English
    })();
    const contentNodes = renderBodyWithEmbeds(body);

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />

            {/* Hero Image */}
            {report.imageUrl && (
                <div className="relative h-96 bg-gray-900 overflow-hidden">
                    {/* Use native img for dynamic uploads to avoid Image Optimization 400s */}
                    <img
                        src={report.imageUrl}
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
                    onClick={() => router.push(`/${locale}/reports`)}
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
                            teal: 'bg-teal-100 text-teal-700',
                            gray: 'bg-gray-100 text-gray-700',
                        };
                        const colorClass = colorMap[category.color] || colorMap.gray;

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
                        <IconCalendar />
                        <span>{formatDate(report.publishedAt || report.createdAt)}</span>
                    </div>
                    {author && (
                        <div className="flex items-center gap-2">
                            <span>✍️</span>
                            <span>{author}</span>
                        </div>
                    )}
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

                {/* Content */}
                <div className="prose prose-lg max-w-none space-y-4">
                    {contentNodes}
                </div>

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('share')}</h3>
                    <ShareButtons title={title} />
                </div>

                {/* Back to Reports Button */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push(`/${locale}/reports`)}
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
