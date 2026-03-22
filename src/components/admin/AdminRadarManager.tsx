'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDefaultRadarDescriptions, type RadarDescriptionKey, type RadarDescriptions } from '@/lib/radar-descriptions';
import type { RadarPublicationMeta, RadarSelectedRange } from '@/lib/radar-dashboard';
import { useAdminI18n } from './AdminI18n';

type RadarSummary = {
    totalReports: number;
    averageSeverity: number;
    escalatedReports: number;
    activePlatforms: number;
    targetedGroups: number;
};

type RadarAdminResponse = {
    current: RadarPublicationMeta | null;
    history: RadarPublicationMeta[];
    descriptions: RadarDescriptions;
    selectedRange: RadarSelectedRange;
};

const RADAR_DESCRIPTION_FIELDS: Array<{ key: RadarDescriptionKey; labelKey: string }> = [
    { key: 'pageSubtitle', labelKey: 'radar.pageSubtitleLabel' },
    { key: 'classificationSubtitle', labelKey: 'radar.classificationSubtitleLabel' },
    { key: 'targetGroupsSubtitle', labelKey: 'radar.targetGroupsSubtitleLabel' },
    { key: 'emotionsSubtitle', labelKey: 'radar.emotionsSubtitleLabel' },
    { key: 'keywordsSubtitle', labelKey: 'radar.keywordsSubtitleLabel' },
];

export function AdminRadarManager() {
    const { t, locale, formatDate, formatDateTime, translateApiError } = useAdminI18n();
    const [rangeStartDate, setRangeStartDate] = useState('');
    const [rangeEndDate, setRangeEndDate] = useState('');
    const [current, setCurrent] = useState<RadarPublicationMeta | null>(null);
    const [history, setHistory] = useState<RadarPublicationMeta[]>([]);
    const [descriptions, setDescriptions] = useState<RadarDescriptions>(getDefaultRadarDescriptions());
    const [selectedRange, setSelectedRange] = useState<RadarSelectedRange>({ startDate: null, endDate: null });
    const [summary, setSummary] = useState<RadarSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDescriptions, setIsSavingDescriptions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadRadarState = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/radar');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || t('errors.loadRadar'));
            }

            const payload = data as RadarAdminResponse;
            setCurrent(payload.current);
            setHistory(payload.history || []);
            setDescriptions(payload.descriptions || getDefaultRadarDescriptions());
            setSelectedRange(payload.selectedRange || { startDate: null, endDate: null });
        } catch (requestError) {
            setError(translateApiError(requestError instanceof Error ? requestError.message : t('errors.loadRadar')));
        } finally {
            setIsLoading(false);
        }
    }, [t, translateApiError]);

    useEffect(() => {
        void loadRadarState();
    }, [loadRadarState]);

    const handlePublish = async () => {
        setIsPublishing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/admin/radar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: rangeStartDate || null,
                    endDate: rangeEndDate || null,
                    descriptions,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || t('errors.publishRadar'));
            }

            setCurrent(data.current as RadarPublicationMeta);
            setHistory((data.history as RadarPublicationMeta[]) || []);
            setDescriptions((data.descriptions as RadarDescriptions) || descriptions);
            setSelectedRange((data.selectedRange as RadarSelectedRange) || { startDate: null, endDate: null });
            setSummary((data.summary as RadarSummary) || null);
            setSuccessMessage(t('radar.success'));
        } catch (requestError) {
            setError(translateApiError(requestError instanceof Error ? requestError.message : t('errors.publishRadar')));
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSaveDescriptions = async () => {
        if (!current) {
            setError(t('radar.saveDescriptionsUnavailable'));
            setSuccessMessage(null);
            return;
        }

        setIsSavingDescriptions(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/admin/radar', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descriptions,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || t('errors.saveRadarDescriptions'));
            }

            setCurrent(data.current as RadarPublicationMeta);
            setHistory((data.history as RadarPublicationMeta[]) || []);
            setDescriptions((data.descriptions as RadarDescriptions) || descriptions);
            setSelectedRange((data.selectedRange as RadarSelectedRange) || selectedRange);
            setSummary((data.summary as RadarSummary) || null);
            setSuccessMessage(t('radar.saveDescriptionsSuccess'));
        } catch (requestError) {
            setError(translateApiError(requestError instanceof Error ? requestError.message : t('errors.saveRadarDescriptions')));
        } finally {
            setIsSavingDescriptions(false);
        }
    };

    const updateDescription = (locale: keyof RadarDescriptions, key: RadarDescriptionKey, value: string) => {
        setDescriptions((currentDescriptions) => ({
            ...currentDescriptions,
            [locale]: {
                ...currentDescriptions[locale],
                [key]: value,
            },
        }));
    };

    const formatRangeLabel = (range: RadarSelectedRange) => {
        if (!range.startDate || !range.endDate) {
            return t('radar.latestAvailableData');
        }

        const formatter = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
        });

        const start = new Date(`${range.startDate}T00:00:00.000Z`);
        const end = new Date(`${range.endDate}T00:00:00.000Z`);
        const startLabel = formatter.format(start);
        const endLabel = formatter.format(end);

        if (
            start.getUTCFullYear() === end.getUTCFullYear()
            && start.getUTCMonth() === end.getUTCMonth()
        ) {
            return startLabel;
        }

        return `${startLabel} — ${endLabel}`;
    };

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <h2 className="text-xl font-semibold text-gray-900">{t('radar.title')}</h2>
                        <p className="mt-2 text-sm leading-7 text-gray-600">
                            {t('radar.description')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSaveDescriptions}
                            disabled={isLoading || isPublishing || isSavingDescriptions || !current}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                            {isSavingDescriptions ? t('radar.savingDescriptions') : t('radar.saveDescriptions')}
                        </button>

                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isLoading || isPublishing || isSavingDescriptions}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                        >
                            {isPublishing ? t('radar.updatingRadar') : t('radar.updateRadar')}
                        </button>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="radar-range-start" className="block text-sm font-medium text-gray-900">
                                {t('radar.rangeStart')}
                            </label>
                            <input
                                id="radar-range-start"
                                type="date"
                                value={rangeStartDate}
                                onChange={(event) => setRangeStartDate(event.target.value)}
                                className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="radar-range-end" className="block text-sm font-medium text-gray-900">
                                {t('radar.rangeEnd')}
                            </label>
                            <input
                                id="radar-range-end"
                                type="date"
                                value={rangeEndDate}
                                onChange={(event) => setRangeEndDate(event.target.value)}
                                className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        <p className="text-xs leading-6 text-gray-500">
                            {t('radar.rangeHelp')}
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{t('radar.currentSnapshot')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {current ? formatDateTime(current.publishedAt) : t('radar.notPublishedYet')}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{t('radar.displayRange')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {current ? formatRangeLabel(selectedRange) : t('common.none')}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{t('radar.publishedBy')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {current?.publishedByName || current?.publishedByEmail || t('common.none')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">{t('radar.descriptionsTitle')}</h3>
                        <p className="mt-1 text-sm leading-7 text-gray-600">{t('radar.descriptionsSubtitle')}</p>
                    </div>

                    <div className="mt-4 space-y-4">
                        {RADAR_DESCRIPTION_FIELDS.map((field) => (
                            <div key={field.key} className="rounded-xl border border-gray-200 bg-white p-4">
                                <p className="text-sm font-semibold text-gray-900">{t(field.labelKey)}</p>

                                <div className="mt-3 grid gap-3 xl:grid-cols-3">
                                    <label className="block">
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{t('common.arabic')}</span>
                                        <textarea
                                            rows={3}
                                            value={descriptions.ar[field.key]}
                                            onChange={(event) => updateDescription('ar', field.key, event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-7 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{t('common.english')}</span>
                                        <textarea
                                            rows={3}
                                            value={descriptions.en[field.key]}
                                            onChange={(event) => updateDescription('en', field.key, event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-7 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{t('common.kurdish')}</span>
                                        <textarea
                                            rows={3}
                                            value={descriptions.ku[field.key]}
                                            onChange={(event) => updateDescription('ku', field.key, event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-7 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {successMessage}
                    </div>
                )}

                {summary && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <MetricCard label={t('radar.reportsInSnapshot')} value={summary.totalReports} />
                        <MetricCard label={t('radar.averageSeverity')} value={summary.averageSeverity} />
                        <MetricCard label={t('radar.escalatedReports')} value={summary.escalatedReports} />
                        <MetricCard label={t('radar.activePlatforms')} value={summary.activePlatforms} />
                        <MetricCard label={t('radar.targetedGroups')} value={summary.targetedGroups} />
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('radar.publicationHistory')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('radar.publicationHistorySubtitle')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void loadRadarState()}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {t('common.refresh')}
                    </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('radar.publishedAt')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('radar.displayRange')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('radar.reports')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('radar.publishedBy')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {!isLoading && history.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                                        {t('radar.noHistory')}
                                    </td>
                                </tr>
                            ) : history.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{formatDateTime(item.publishedAt)}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {formatRangeLabel(item.selectedRange)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{item.totalReports}</td>
                                    <td className="px-4 py-3 text-gray-700">{item.publishedByName || item.publishedByEmail || t('common.none')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
