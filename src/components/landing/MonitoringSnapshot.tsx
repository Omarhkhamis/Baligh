'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { RadarDashboardData, RadarPublicationMeta } from '@/lib/radar-dashboard';
import { getTargetGroupKeyFromValue } from '@/lib/target-groups';

type MonitoringSnapshotProps = {
    data: RadarDashboardData | null;
    publication: RadarPublicationMeta | null;
};

type SnapshotCardProps = {
    eyebrow: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeClassName: string;
    titleClassName?: string;
    isRtl: boolean;
};

function localeTag(locale: string) {
    return locale === 'ku' ? 'en' : locale;
}

function formatNumber(locale: string, value: number) {
    return new Intl.NumberFormat(localeTag(locale), {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatMonthLabel(locale: string, monthKey: string | null | undefined, currentMonthLabel: string, fallback: string) {
    if (!monthKey) {
        return fallback;
    }

    const [year, month] = monthKey.split('-').map(Number);
    if (!year || !month) {
        return fallback;
    }

    const now = new Date();
    if (now.getUTCFullYear() === year && now.getUTCMonth() + 1 === month) {
        return currentMonthLabel;
    }

    return new Intl.DateTimeFormat(localeTag(locale), {
        month: 'long',
        year: 'numeric',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getTargetBadgeKey(percentage: number) {
    if (percentage >= 35) {
        return 'high';
    }

    if (percentage >= 20) {
        return 'medium';
    }

    return 'watch';
}

function getMonthChangeBadgeClass(change: number | null) {
    if (change === null) {
        return 'bg-stone-100 text-stone-600';
    }

    if (change > 0) {
        return 'bg-amber-100 text-amber-700';
    }

    if (change < 0) {
        return 'bg-rose-100 text-rose-700';
    }

    return 'bg-stone-100 text-stone-600';
}

function getClassificationBadgeClass(key: string) {
    switch (key) {
        case 'incitement':
            return 'bg-rose-100 text-rose-700';
        case 'implicit':
            return 'bg-amber-100 text-amber-700';
        case 'explicit':
            return 'bg-sky-100 text-sky-700';
        default:
            return 'bg-stone-100 text-stone-600';
    }
}

function SnapshotCard({
    eyebrow,
    title,
    subtitle,
    badge,
    badgeClassName,
    titleClassName,
    isRtl,
}: SnapshotCardProps) {
    return (
        <article className="flex-1 rounded-[26px] border border-stone-200 bg-white px-5 py-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)] md:px-6 md:py-6">
            <div className={`flex min-h-[190px] w-full flex-col ${isRtl ? 'items-start text-right' : 'items-start text-left'}`}>
                <p className="text-base font-bold text-stone-400 md:text-lg">
                    {eyebrow}
                </p>
                <h3 className={`mt-5 font-black tracking-tight text-stone-950 ${titleClassName || 'text-3xl md:text-4xl'} leading-[1.2]`}>
                    {title}
                </h3>
                <p className="mt-2 text-base font-semibold text-stone-400 md:text-lg">
                    {subtitle}
                </p>
                <span className={`mt-auto inline-flex rounded-2xl px-3.5 py-1.5 text-sm font-bold md:text-base ${badgeClassName}`}>
                    {badge}
                </span>
            </div>
        </article>
    );
}

export default function MonitoringSnapshot({ data, publication }: MonitoringSnapshotProps) {
    const locale = useLocale();
    const t = useTranslations('landing.observatory');
    const tTargetGroups = useTranslations('reportFlow.form.targetGroups');
    const isRtl = locale === 'ar';

    const hasData = Boolean(publication && data && data.summary.totalReports > 0);
    const monthlyCounts = new Map<string, number>();

    for (const point of data?.intensityTimeline || []) {
        const monthKey = point.weekStart.slice(0, 7);
        monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + point.totalReports);
    }

    const monthKeys = Array.from(monthlyCounts.keys()).sort();
    const latestMonthKey = monthKeys.at(-1) || null;
    const previousMonthKey = monthKeys.at(-2) || null;
    const latestMonthCount = latestMonthKey ? monthlyCounts.get(latestMonthKey) || 0 : 0;
    const previousMonthCount = previousMonthKey ? monthlyCounts.get(previousMonthKey) || 0 : 0;
    const monthChange = previousMonthCount > 0
        ? Math.round(((latestMonthCount - previousMonthCount) / previousMonthCount) * 100)
        : null;

    const topTargetGroup = data?.targetGroupBreakdown[0] || null;
    const topTargetGroupKey = getTargetGroupKeyFromValue(topTargetGroup?.key || '');
    const topTargetGroupLabel = topTargetGroupKey ? tTargetGroups(topTargetGroupKey) : (topTargetGroup?.key || '—');
    const topTargetBadgeKey = getTargetBadgeKey(topTargetGroup?.percentage || 0);

    const topClassification = data?.classificationBreakdown
        ? [...data.classificationBreakdown].sort((left, right) => right.count - left.count)[0] || null
        : null;

    const monthBadgeText = monthChange === null
        ? t('noComparison')
        : `${monthChange > 0 ? '+' : monthChange < 0 ? '-' : ''}${formatNumber(locale, Math.abs(monthChange))}% ${t('vsLastMonth')}`;

    const sectionLink = `/${locale}/monitoring`;

    return (
        <section
            id="services"
            dir={isRtl ? 'rtl' : 'ltr'}
            className="relative overflow-hidden border-t border-emerald-100 bg-[#f6f1e6] py-10 md:py-14"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-emerald-100" />
            <div className="absolute bottom-6 left-4 h-24 w-24 rounded-full bg-white/30 blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full border border-white/20" aria-hidden="true" />

            <div className={`mx-auto flex max-w-5xl flex-col px-4 ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
                <div className="w-full">
                    <p className="text-base font-black text-stone-400 md:text-lg">
                        {t('eyebrow')}
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 md:text-5xl">
                        {t('title')}
                    </h2>
                    <p className="mt-3 max-w-2xl text-base text-stone-400 md:text-xl">
                        {t('subtitle')}
                    </p>
                </div>

                {hasData ? (
                    <>
                        <div className="mt-8 flex w-full flex-col gap-4 lg:flex-row">
                            <SnapshotCard
                                eyebrow={formatMonthLabel(locale, latestMonthKey, t('thisMonth'), t('latestMonth'))}
                                title={`${latestMonthCount > 0 ? '+' : ''}${formatNumber(locale, latestMonthCount)}`}
                                subtitle={t('documentedCases')}
                                badge={monthBadgeText}
                                badgeClassName={getMonthChangeBadgeClass(monthChange)}
                                titleClassName="text-4xl md:text-5xl"
                                isRtl={isRtl}
                            />

                            <SnapshotCard
                                eyebrow={t('topTargetedGroup')}
                                title={topTargetGroupLabel}
                                subtitle={t('ofCases', {
                                    value: formatNumber(locale, Math.round(topTargetGroup?.percentage || 0)),
                                })}
                                badge={t(`targetBadges.${topTargetBadgeKey}`)}
                                badgeClassName={
                                    topTargetBadgeKey === 'high'
                                        ? 'bg-rose-100 text-rose-700'
                                        : topTargetBadgeKey === 'medium'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                }
                                titleClassName="text-2xl md:text-4xl"
                                isRtl={isRtl}
                            />

                            <SnapshotCard
                                eyebrow={t('dominantType')}
                                title={topClassification ? t(`classificationLabels.${topClassification.key}`) : '—'}
                                subtitle={t('ofClassifications', {
                                    value: formatNumber(locale, Math.round(topClassification?.percentage || 0)),
                                })}
                                badge={topClassification ? t(`classificationBadges.${topClassification.key}`) : t('noComparison')}
                                badgeClassName={getClassificationBadgeClass(topClassification?.key || 'none')}
                                titleClassName="text-2xl md:text-4xl"
                                isRtl={isRtl}
                            />
                        </div>

                        <div className={`mt-6 flex w-full ${isRtl ? 'items-end justify-end text-right' : 'items-start justify-start text-left'}`}>
                            <Link
                                href={sectionLink}
                                className="group inline-flex items-center gap-2 text-base font-black text-emerald-700 transition-colors hover:text-emerald-800 md:text-xl"
                            >
                                <span>{t('cta')}</span>
                                <svg className={`h-4 w-4 transition-transform md:h-5 md:w-5 ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRtl ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
                                </svg>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="mt-8 w-full rounded-[26px] border border-stone-200 bg-white px-5 py-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)] md:px-6 md:py-7">
                        <div className={`flex flex-col ${isRtl ? 'items-end text-right' : 'items-start text-left'}`}>
                            <h3 className="text-2xl font-black text-stone-950 md:text-3xl">
                                {t('emptyTitle')}
                            </h3>
                            <p className="mt-3 max-w-3xl text-base leading-7 text-stone-500 md:text-lg">
                                {t('emptyBody')}
                            </p>
                            <Link
                                href={sectionLink}
                                className="mt-5 inline-flex items-center gap-2 text-base font-bold text-emerald-700 transition-colors hover:text-emerald-800 md:text-lg"
                            >
                                <span>{t('cta')}</span>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRtl ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
