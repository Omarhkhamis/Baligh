'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { RadarDashboardData } from '@/lib/radar-dashboard';

type BalaghRadarDashboardProps = {
    locale: string;
    data: RadarDashboardData;
    showInternal: boolean;
};

const CLASSIFICATION_COLORS: Record<string, string> = {
    explicit: '#A32D2D',
    implicit: '#C97A11',
    incitement: '#D35400',
    none: '#8A8A8A',
};

const SERIES_COLORS = ['#0F766E', '#CA8A04', '#B91C1C', '#2563EB', '#7C3AED', '#0891B2'];

const TARGET_GROUP_KEY_BY_LABEL: Record<string, string> = {
    Druze: 'druze',
    'Sunni Muslims': 'sunniMuslims',
    Alawites: 'alawites',
    Kurds: 'kurds',
    Arabs: 'arabs',
    Christians: 'christians',
    'Women/Children': 'womenChildren',
    'Other Minorities': 'otherGroupsMinorities',
    Unspecified: 'unspecified',
};

function severityColor(value: number) {
    if (value >= 4) return '#E24B4A';
    if (value >= 3) return '#EF9F27';
    return '#639922';
}

function formatDateTime(locale: string, value: string) {
    return new Intl.DateTimeFormat(locale === 'ku' ? 'en' : locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

function cardClassName() {
    return 'rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_22px_70px_-40px_rgba(15,23,42,0.35)] md:p-6';
}

function metricCardClassName() {
    return 'rounded-[24px] border border-stone-200 bg-white p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.28)]';
}

function normalizeTooltipValue(value: unknown): string | number {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'number' || typeof value === 'string') {
        return value;
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    return value == null ? '—' : String(value);
}

export function BalaghRadarDashboard({
    locale,
    data,
    showInternal,
}: BalaghRadarDashboardProps) {
    const t = useTranslations('monitoring');
    const tPlatforms = useTranslations('reportFlow.form.platforms');
    const tTargetGroups = useTranslations('reportFlow.form.targetGroups');

    const classificationLabel = (value: string) => t(`labels.classifications.${value}`);
    const platformLabel = (value: string) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other'].includes(normalized)) {
            return tPlatforms(normalized);
        }
        return value;
    };
    const emotionLabel = (value: string) => t(`labels.emotions.${value}`);
    const dehumanizationLabel = (value: string) => t(`labels.dehumanization.${value}`);
    const accountTypeLabel = (value: string) => t(`labels.accountTypes.${value}`);
    const conflictContextLabel = (value: string | null) => (value ? t(`labels.conflictContexts.${value}`) : t('peakNoContext'));
    const targetGroupLabel = (value: string) => {
        const key = TARGET_GROUP_KEY_BY_LABEL[value];
        return key ? tTargetGroups(key) : value;
    };

    const topTargetGroupKeys = data.targetGroupTrend[0]
        ? Object.keys(data.targetGroupTrend[0]).filter((key) => key !== 'weekStart' && key !== 'label')
        : [];
    const topPlatformKeys = data.platformTrend[0]
        ? Object.keys(data.platformTrend[0]).filter((key) => key !== 'weekStart' && key !== 'label')
        : [];
    const numericTooltipFormatter = (value: unknown, name: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        String(name || ''),
    ];
    const classificationTooltipFormatter = (value: unknown, name: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        classificationLabel(String(name || 'none')),
    ];
    const platformTooltipFormatter = (value: unknown, name: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        platformLabel(String(name || 'other')),
    ];
    const targetGroupTooltipFormatter = (value: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        t('sections.targetGroups.countLabel'),
    ];
    const targetGroupLabelFormatter = (value: unknown) => targetGroupLabel(String(value || ''));
    const dehumanizationTooltipFormatter = (value: unknown, name: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        dehumanizationLabel(String(name || 'none')),
    ];
    const accountTypeTooltipFormatter = (value: unknown, name: unknown): [string | number, string] => [
        normalizeTooltipValue(value),
        accountTypeLabel(String(name || 'anonymous')),
    ];

    if (data.summary.totalReports === 0) {
        return (
            <section className={cardClassName()}>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-stone-500">{t('eyebrow')}</p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
                    {t('pageTitle')}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
                    {t('emptyState')}
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-[34px] border border-stone-200 bg-[linear-gradient(135deg,#fffdf7_0%,#f7f0df_44%,#eef6ea_100%)] p-6 shadow-[0_30px_90px_-42px_rgba(15,23,42,0.35)] md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-4xl space-y-4">
                        <span className="inline-flex rounded-full bg-stone-900 px-4 py-1.5 text-xs font-black uppercase tracking-[0.26em] text-white">
                            {t('eyebrow')}
                        </span>
                        <h1 className="text-4xl font-black tracking-tight text-stone-900 md:text-6xl">
                            {t('pageTitle')}
                        </h1>
                        <p className="max-w-3xl text-base leading-8 text-stone-600 md:text-xl">
                            {t('pageSubtitle')}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[22px] border border-stone-200 bg-white/90 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('generatedAt')}</p>
                            <p className="mt-2 text-sm font-bold text-stone-900">{formatDateTime(locale, data.generatedAt)}</p>
                        </div>
                        <div className="rounded-[22px] border border-stone-200 bg-white/90 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('weeksWindow')}</p>
                            <p className="mt-2 text-sm font-bold text-stone-900">{data.weeksWindow}</p>
                        </div>
                    </div>
                </div>
            </section>

            {data.escalationAlert.active ? (
                <section className="rounded-[26px] border border-[#F09595] bg-[#FCEBEB] px-5 py-4 shadow-[0_16px_40px_-28px_rgba(163,45,45,0.42)]">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#A32D2D]">{t('alerts.eyebrow')}</p>
                            <p className="mt-1 text-lg font-black text-[#791F1F]">{t('alerts.escalation', { count: data.escalationAlert.count })}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#791F1F]">{t('alerts.note')}</p>
                    </div>
                </section>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className={metricCardClassName()}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.totalReports')}</p>
                    <p className="mt-3 text-4xl font-black text-stone-900">{data.summary.totalReports}</p>
                </div>
                <div className={metricCardClassName()}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.averageSeverity')}</p>
                    <p className="mt-3 text-4xl font-black text-stone-900">{data.summary.averageSeverity}</p>
                </div>
                <div className={metricCardClassName()}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.escalatedReports')}</p>
                    <p className="mt-3 text-4xl font-black text-[#A32D2D]">{data.summary.escalatedReports}</p>
                </div>
                <div className={metricCardClassName()}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.activePlatforms')}</p>
                    <p className="mt-3 text-4xl font-black text-stone-900">{data.summary.activePlatforms}</p>
                </div>
                <div className={metricCardClassName()}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.targetedGroups')}</p>
                    <p className="mt-3 text-4xl font-black text-stone-900">{data.summary.targetedGroups}</p>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.classification.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.classification.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.classification.subtitle')}</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.classificationBreakdown}
                                    dataKey="count"
                                    nameKey="key"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={62}
                                    outerRadius={94}
                                    paddingAngle={3}
                                >
                                    {data.classificationBreakdown.map((item) => (
                                        <Cell key={item.key} fill={CLASSIFICATION_COLORS[item.key] || '#78716C'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={classificationTooltipFormatter} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid gap-2">
                        {data.classificationBreakdown.map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CLASSIFICATION_COLORS[item.key] || '#78716C' }} />
                                    <span className="text-sm font-semibold text-stone-800">{classificationLabel(item.key)}</span>
                                </div>
                                <span className="text-sm font-black text-stone-900">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cardClassName()}>
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.intensity.eyebrow')}</p>
                            <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.intensity.title')}</h2>
                            <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.intensity.subtitle')}</p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                            <span className="font-bold">{t('sections.intensity.weightedNoteTitle')}</span>{' '}
                            {t('sections.intensity.weightedNote')}
                        </div>
                    </div>
                    <div className="h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.intensityTimeline}>
                                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis yAxisId="left" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="weightedIntensity" name={t('sections.intensity.weightedSeries')}>
                                    {data.intensityTimeline.map((point) => (
                                        <Cell key={point.weekStart} fill={severityColor(point.avgSeverity)} />
                                    ))}
                                </Bar>
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="avgSeverity"
                                    name={t('sections.intensity.severitySeries')}
                                    stroke="#1F2937"
                                    strokeWidth={2.5}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {data.peakAnnotations.map((peak) => (
                            <div key={peak.weekStart} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{peak.label}</p>
                                <p className="mt-2 text-sm font-black text-stone-900">{t('peakIntensity', { value: peak.weightedIntensity })}</p>
                                <p className="mt-1 text-sm text-stone-600">{conflictContextLabel(peak.context)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.targetGroups.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.targetGroups.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.targetGroups.subtitle')}</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.targetGroupBreakdown} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    width={140}
                                    tickFormatter={targetGroupLabel}
                                    tick={{ fill: '#57534E', fontSize: 11 }}
                                />
                                <Tooltip formatter={targetGroupTooltipFormatter} labelFormatter={targetGroupLabelFormatter} />
                                <Bar dataKey="count" fill="#1A6B3A" radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.targetGroups.trendEyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.targetGroups.trendTitle')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.targetGroups.trendSubtitle')}</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.targetGroupTrend}>
                                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#57534E', fontSize: 11 }} />
                                <Tooltip />
                                <Legend formatter={(value: string) => targetGroupLabel(value)} />
                                {topTargetGroupKeys.map((key, index) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                                        strokeWidth={2.2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.platforms.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.platforms.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.platforms.subtitle')}</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.platformBreakdown}
                                    dataKey="count"
                                    nameKey="key"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={92}
                                    paddingAngle={2}
                                >
                                    {data.platformBreakdown.map((item, index) => (
                                        <Cell key={item.key} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={platformTooltipFormatter} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid gap-2">
                        {data.platformBreakdown.map((item, index) => (
                            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }} />
                                    <span className="text-sm font-semibold text-stone-800">{platformLabel(item.key)}</span>
                                </div>
                                <span className="text-sm font-black text-stone-900">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.platforms.trendEyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.platforms.trendTitle')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.platforms.trendSubtitle')}</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.platformTrend}>
                                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#57534E', fontSize: 11 }} />
                                <Tooltip />
                                <Legend formatter={(value: string) => platformLabel(value)} />
                                {topPlatformKeys.map((key, index) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                                        strokeWidth={2.2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.emotions.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.emotions.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.emotions.subtitle')}</p>
                    </div>
                    <div className="h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={data.emotions.map((item) => ({ emotion: emotionLabel(item.key), share: item.share }))}>
                                <PolarGrid stroke="#D6D3D1" />
                                <PolarAngleAxis dataKey="emotion" tick={{ fill: '#44403C', fontSize: 11 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#78716C', fontSize: 10 }} />
                                <Radar dataKey="share" stroke="#1A6B3A" fill="#1A6B3A" fillOpacity={0.3} />
                                <Tooltip formatter={numericTooltipFormatter} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.accountTypes.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.accountTypes.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.accountTypes.subtitle')}</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.accountTypeBreakdown}
                                    dataKey="count"
                                    nameKey="key"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={92}
                                    paddingAngle={2}
                                >
                                    {data.accountTypeBreakdown.map((item, index) => (
                                        <Cell key={item.key} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={accountTypeTooltipFormatter} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid gap-2">
                        {data.accountTypeBreakdown.map((item, index) => (
                            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }} />
                                    <span className="text-sm font-semibold text-stone-800">{accountTypeLabel(item.key)}</span>
                                </div>
                                <span className="text-sm font-black text-stone-900">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.dehumanization.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.dehumanization.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.dehumanization.subtitle')}</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dehumanizationTimeline}>
                                <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#57534E', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#57534E', fontSize: 11 }} />
                                <Tooltip formatter={dehumanizationTooltipFormatter} />
                                <Legend formatter={(value: string) => dehumanizationLabel(value)} />
                                <Bar stackId="dehumanization" dataKey="none" fill="#CBD5E1" radius={[0, 0, 0, 0]} />
                                <Bar stackId="dehumanization" dataKey="implicit" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                                <Bar stackId="dehumanization" dataKey="explicit" fill="#DC2626" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={cardClassName()}>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.actions.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.actions.title')}</h2>
                        <div className="mt-5 grid gap-3">
                            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">{t('sections.actions.incitementLabel')}</p>
                                <p className="mt-2 text-3xl font-black text-orange-900">{data.incitementToActionCount}</p>
                            </div>
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">{t('sections.actions.glorificationLabel')}</p>
                                <p className="mt-2 text-3xl font-black text-red-900">{data.glorificationTotal}</p>
                            </div>
                        </div>
                    </div>

                    <div className={cardClassName()}>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.location.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.location.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">
                            {t('sections.location.subtitle')} <span className="font-bold text-stone-900">{t('estimatedLabel')}</span>
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {data.locationHeatmap.map((item) => (
                                <div
                                    key={item.location}
                                    className="rounded-2xl border border-stone-200 px-4 py-3"
                                    style={{ backgroundColor: `rgba(26,107,58,${Math.max(0.12, item.intensity * 0.68)})` }}
                                >
                                    <p className="text-sm font-bold text-stone-900">{item.location}</p>
                                    <p className="mt-1 text-xs font-semibold text-stone-700">{t('locationCount', { count: item.count })}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {showInternal ? (
                <section className={cardClassName()}>
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.keywords.eyebrow')}</p>
                            <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.keywords.title')}</h2>
                            <p className="mt-2 text-sm leading-7 text-stone-600">{t('sections.keywords.subtitle')}</p>
                        </div>
                        <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                            {t('internalOnly')}
                        </span>
                    </div>

                    <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                        <div className="flex flex-wrap gap-3">
                            {data.keywordFrequencies.map((item) => (
                                <span
                                    key={item.keyword}
                                    className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 font-black text-stone-900"
                                    style={{ fontSize: `${Math.min(28, 12 + item.count * 2)}px` }}
                                >
                                    {item.keyword}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[24px] border border-stone-200">
                        <table className="min-w-full divide-y divide-stone-200 text-sm">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-stone-600">{t('sections.keywords.keywordColumn')}</th>
                                    <th className="px-4 py-3 text-right font-bold text-stone-600">{t('sections.keywords.countColumn')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 bg-white">
                                {data.keywordFrequencies.map((item) => (
                                    <tr key={item.keyword}>
                                        <td className="px-4 py-3 font-semibold text-stone-800">{item.keyword}</td>
                                        <td className="px-4 py-3 text-right font-black text-stone-900">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.26)] md:p-6">
                <h2 className="text-2xl font-black text-stone-900">{t('methodologyTitle')}</h2>
                <p className="mt-3 max-w-5xl text-sm leading-8 text-stone-600">{t('methodologyNote')}</p>
            </section>
        </div>
    );
}
