'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
import type { RadarDescriptionKey, RadarDescriptionLocale } from '@/lib/radar-descriptions';
import type { RadarDashboardData, RadarPublicationMeta } from '@/lib/radar-dashboard';
import { getTargetGroupKeyFromValue } from '@/lib/target-groups';

type BalaghRadarDashboardProps = {
    locale: string;
    data: RadarDashboardData | null;
    publication: RadarPublicationMeta | null;
    showInternal: boolean;
};

type CurrentIntensityLevel = 'calm' | 'elevated' | 'critical';

const CLASSIFICATION_COLORS: Record<string, string> = {
    explicit: '#A32D2D',
    implicit: '#C97A11',
    incitement: '#D35400',
    none: '#8A8A8A',
};

const KEYWORD_CLOUD_COLORS = ['#1A6B3A', '#27500A', '#A32D2D', '#C97A11', '#0F766E', '#7C3AED'];
const CURRENT_INTENSITY_PANEL_STYLES: Record<CurrentIntensityLevel, string> = {
    calm: 'border-[#97C459] bg-[linear-gradient(135deg,#f8fdf9_0%,#eef8f1_48%,#e8f5ee_100%)]',
    elevated: 'border-[#FAC775] bg-[linear-gradient(135deg,#fffaf2_0%,#fdf4e2_48%,#faeeda_100%)]',
    critical: 'border-[#F09595] bg-[linear-gradient(135deg,#fff7f7_0%,#fdeeee_48%,#fcebeb_100%)]',
};
const CURRENT_INTENSITY_CARD_STYLES: Record<CurrentIntensityLevel, string> = {
    calm: 'border-[#97C459] bg-white/75 text-[#27500A]',
    elevated: 'border-[#FAC775] bg-white/75 text-[#633806]',
    critical: 'border-[#F09595] bg-white/75 text-[#791F1F]',
};

function formatDateTime(locale: string, value: string) {
    const normalizedValue = value.length === 10 ? `${value}T00:00:00.000Z` : value;
    return new Intl.DateTimeFormat(locale === 'ku' ? 'en' : locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(normalizedValue));
}

function formatRadarRangeLabel(
    locale: string,
    selectedRange: RadarDashboardData['selectedRange'],
    latestAvailableLabel: string
) {
    if (!selectedRange?.startDate || !selectedRange?.endDate) {
        return latestAvailableLabel;
    }

    const formatter = new Intl.DateTimeFormat(locale === 'ku' ? 'en' : locale, {
        year: 'numeric',
        month: 'long',
    });
    const start = new Date(`${selectedRange.startDate}T00:00:00.000Z`);
    const end = new Date(`${selectedRange.endDate}T00:00:00.000Z`);
    const startLabel = formatter.format(start);
    const endLabel = formatter.format(end);

    if (
        start.getUTCFullYear() === end.getUTCFullYear()
        && start.getUTCMonth() === end.getUTCMonth()
    ) {
        return startLabel;
    }

    return `${startLabel} — ${endLabel}`;
}

function cardClassName() {
    return 'rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_22px_70px_-40px_rgba(15,23,42,0.3)] md:p-6';
}

function normalizeTooltipValue(value: unknown): string | number {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'number' || typeof value === 'string') {
        return value;
    }

    return value == null ? '—' : String(value);
}

function keywordFontSize(count: number, maxCount: number) {
    if (maxCount <= 0) {
        return 14;
    }

    const minSize = 14;
    const maxSize = 30;
    const ratio = count / maxCount;
    return Math.round(minSize + (maxSize - minSize) * ratio);
}

function getCurrentIntensityLevel(
    classificationBreakdown: RadarDashboardData['classificationBreakdown']
): CurrentIntensityLevel {
    const highestCount = Math.max(...classificationBreakdown.map((item) => item.count), 0);

    if (highestCount <= 0) {
        return 'calm';
    }

    const highestKeys = classificationBreakdown
        .filter((item) => item.count === highestCount)
        .map((item) => item.key);

    if (highestKeys.some((key) => key === 'implicit' || key === 'incitement')) {
        return 'critical';
    }

    if (highestKeys.includes('explicit')) {
        return 'elevated';
    }

    return 'calm';
}

function CustomTargetGroupYAxisTick({
    x = 0,
    y = 0,
    payload,
}: {
    x?: number | string;
    y?: number | string;
    payload?: { value?: string | number };
}) {
    const tickX = Number(x);
    const tickY = Number(y);

    return (
        <text
            x={tickX}
            y={tickY}
            dy={4}
            textAnchor="end"
            direction="rtl"
            style={{
                fontSize: 13,
                fontWeight: 700,
                fill: '#44403C',
            }}
        >
            {String(payload?.value || '')}
        </text>
    );
}

export function BalaghRadarDashboard({
    locale,
    data,
    publication,
    showInternal,
}: BalaghRadarDashboardProps) {
    const t = useTranslations('monitoring');
    const tTargetGroups = useTranslations('reportFlow.form.targetGroups');
    const isRtl = locale === 'ar';
    const descriptionLocale: RadarDescriptionLocale = locale === 'ar' || locale === 'ku' ? locale : 'en';

    const classificationLabel = (value: string) => t(`labels.classifications.${value}`);
    const emotionLabel = (value: string) => t(`labels.emotions.${value}`);
    const description = (key: RadarDescriptionKey) => data?.descriptions?.[descriptionLocale]?.[key] || '';
    const targetGroupLabel = (value: string) => {
        const key = getTargetGroupKeyFromValue(value);
        return key ? tTargetGroups(key) : value;
    };

    if (!publication || !data) {
        return (
            <section className={cardClassName()}>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-stone-500">{t('eyebrow')}</p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
                    {t('pageTitle')}
                </h1>
                <p className="mt-4 text-base font-bold text-stone-900 md:text-lg">
                    {t('unpublishedTitle')}
                </p>
                <p className="mt-3 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
                    {t('unpublishedNote')}
                </p>
            </section>
        );
    }

    const emotionChartData = data.emotions.map((item) => ({
        key: item.key,
        label: emotionLabel(item.key),
        share: item.share,
        count: item.count,
    }));
    const strongestEmotions = [...emotionChartData]
        .filter((item) => item.count > 0)
        .sort((left, right) => right.count - left.count)
        .slice(0, 4);
    const visibleKeywords = data.keywordFrequencies.slice(0, 14);
    const maxKeywordCount = Math.max(...visibleKeywords.map((item) => item.count), 0);
    const targetGroups = data.targetGroupBreakdown.map((item) => ({
        ...item,
        label: targetGroupLabel(item.key),
    }));
    const currentIntensityLevel = getCurrentIntensityLevel(data.classificationBreakdown);
    const displayedRangeLabel = formatRadarRangeLabel(locale, data.selectedRange, t('latestAvailable'));
    const targetGroupCount = Math.max(targetGroups.length, 1);
    const targetGroupBarSize = targetGroupCount >= 8 ? 28 : 32;
    const targetGroupChartRowGap = targetGroupCount >= 8 ? 8 : 10;
    const targetGroupLabelRowGap = 3.5;
    const targetGroupVerticalPadding = 8;
    const targetGroupLabelRowHeight = targetGroupBarSize + targetGroupChartRowGap - targetGroupLabelRowGap;
    const targetGroupLabelBottomPadding = Math.max(0, targetGroupVerticalPadding - (targetGroupChartRowGap - targetGroupLabelRowGap));
    const targetGroupChartHeight =
        targetGroupVerticalPadding * 2 + targetGroupBarSize * targetGroupCount + targetGroupChartRowGap * (targetGroupCount - 1);

    const classificationTooltipFormatter = (
        value: unknown,
        _name: unknown,
        item: { payload?: { key?: string } }
    ): [string | number, string] => [
        normalizeTooltipValue(value),
        classificationLabel(String(item?.payload?.key || 'none')),
    ];

    const targetGroupTooltipFormatter = (
        value: unknown,
        _name: unknown,
        item: { payload?: { key?: string } }
    ): [string | number, string] => [
        normalizeTooltipValue(value),
        targetGroupLabel(String(item?.payload?.key || '')),
    ];

    const emotionTooltipFormatter = (
        value: unknown,
        _name: unknown,
        item: { payload?: { key?: string } }
    ): [string | number, string] => [
        `${normalizeTooltipValue(value)}%`,
        emotionLabel(String(item?.payload?.key || 'other')),
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
        <div className="space-y-5">
            <section
                className={`rounded-[30px] border p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.32)] md:p-7 ${CURRENT_INTENSITY_PANEL_STYLES[currentIntensityLevel]}`}
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full bg-stone-900 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-white">
                            {t('eyebrow')}
                        </span>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
                            {t('pageTitle')}
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-stone-600 md:text-base">
                            {description('pageSubtitle')}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[22px] border border-stone-200 bg-white/90 px-4 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">{t('generatedAt')}</p>
                            <p className="mt-2 text-sm font-black text-stone-900">{formatDateTime(locale, publication.publishedAt)}</p>
                        </div>
                        <div className="rounded-[22px] border border-stone-200 bg-white/90 px-4 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">{t('displayedRange')}</p>
                            <p className="mt-2 text-sm font-black text-stone-900">{displayedRangeLabel}</p>
                        </div>
                        <div className="rounded-[22px] border border-stone-200 bg-white/90 px-4 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">{t('stats.totalReports')}</p>
                            <p className="mt-2 text-sm font-black text-stone-900">{data.summary.totalReports}</p>
                        </div>
                        <div className={`rounded-[22px] border px-4 py-3 ${CURRENT_INTENSITY_CARD_STYLES[currentIntensityLevel]}`}>
                            <p className="text-[11px] font-bold tracking-[0.12em] opacity-80">{t('currentIntensity')}</p>
                            <p className="mt-2 text-lg font-black md:text-xl">{t(`intensityLevels.${currentIntensityLevel}`)}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <section className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.classification.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.classification.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{description('classificationSubtitle')}</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                        <div className="min-w-0 h-[250px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={data.classificationBreakdown}
                                        dataKey="count"
                                        nameKey="key"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={58}
                                        outerRadius={90}
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

                        <div className="grid gap-2.5">
                            {data.classificationBreakdown.map((item) => (
                                <div key={item.key} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: CLASSIFICATION_COLORS[item.key] || '#78716C' }}
                                            />
                                            <span className="text-sm font-bold text-stone-800">{classificationLabel(item.key)}</span>
                                        </div>
                                        <span className="text-sm font-black text-stone-900">{item.count}</span>
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-stone-500">{item.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


{/*  Chart Omar  */}
<section className={cardClassName()}>
  <div className="mb-5">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
      {t('sections.targetGroups.eyebrow')}
    </p>
    <h2 className="mt-2 text-2xl font-black text-stone-900">
      {t('sections.targetGroups.title')}
    </h2>
    <p className="mt-2 text-sm leading-7 text-stone-600">
      {description('targetGroupsSubtitle')}
    </p>
  </div>

  <div style={{ height: `${targetGroups.length * 44}px` }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={targetGroups}
        layout="vertical"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <CartesianGrid
          stroke="#E7E5E4"
          strokeDasharray="3 3"
          horizontal={false}
        />

        <XAxis
          type="number"
          reversed={isRtl}
          allowDecimals={false}
          tick={{ fill: '#57534E', fontSize: 11 }}
        />

        {/* ✅ YAxis مع RTL مضبوط */}
        <YAxis
          type="category"
          dataKey="label"
          width={150} // 👈 مساحة للنص + فراغ عن الشارت
          tickLine={false}
          axisLine={false}
          orientation="right"
          tick={<CustomTargetGroupYAxisTick />}
        />

        <Tooltip formatter={targetGroupTooltipFormatter} />

        <Bar
          dataKey="count"
          fill="#1A6B3A"
          radius={[0, 14, 14, 0]} // يمين مسطح - يسار مدور
          barSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</section>


             

                <section className={cardClassName()}>
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.emotions.eyebrow')}</p>
                        <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.emotions.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{description('emotionsSubtitle')}</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                        <div className="min-w-0 h-[270px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <RadarChart data={emotionChartData}>
                                    <PolarGrid stroke="#D6D3D1" />
                                    <PolarAngleAxis dataKey="label" tick={{ fill: '#44403C', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#78716C', fontSize: 10 }} />
                                    <Radar dataKey="share" stroke="#1A6B3A" fill="#1A6B3A" fillOpacity={0.24} />
                                    <Tooltip formatter={emotionTooltipFormatter} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid gap-2.5">
                            {strongestEmotions.length > 0 ? strongestEmotions.map((item) => (
                                <div key={item.key} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-bold text-stone-800">{item.label}</span>
                                        <span className="text-sm font-black text-stone-900">{item.count}</span>
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-stone-500">{item.share}%</p>
                                </div>
                            )) : (
                                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm leading-7 text-stone-500">
                                    {t('emptyState')}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={cardClassName()}>
                    <div className="mb-5">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{t('sections.keywords.eyebrow')}</p>
                            <h2 className="mt-2 text-2xl font-black text-stone-900">{t('sections.keywords.title')}</h2>
                            <p className="mt-2 text-sm leading-7 text-stone-600">{description('keywordsSubtitle')}</p>
                        </div>
                    </div>

                    {showInternal ? (
                        visibleKeywords.length > 0 ? (
                            <div className="space-y-5">
                                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                                    <div className="flex flex-wrap gap-3">
                                        {visibleKeywords.map((item, index) => (
                                            <span
                                                key={item.keyword}
                                                className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 font-black"
                                                style={{
                                                    color: KEYWORD_CLOUD_COLORS[index % KEYWORD_CLOUD_COLORS.length],
                                                    fontSize: `${keywordFontSize(item.count, maxKeywordCount)}px`,
                                                }}
                                            >
                                                {item.keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {visibleKeywords.slice(0, 6).map((item) => (
                                        <div key={item.keyword} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-bold text-stone-800">{item.keyword}</span>
                                                <span className="text-sm font-black text-stone-900">{item.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-sm leading-7 text-stone-500">
                                {t('emptyState')}
                            </div>
                        )
                    ) : (
                        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
                            <svg
                                className="h-10 w-10 text-stone-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 11V7a4 4 0 1 0-8 0v4m8 0h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h7Z"
                                />
                            </svg>
                            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-500">{description('keywordsSubtitle')}</p>
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}
