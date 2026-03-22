'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSeverityScoreOutOfFive } from '@/lib/analysis-utils';
import { canonicalizeTargetGroupValues } from '@/lib/target-groups';
import Swal from 'sweetalert2';
import { RequirePermission, usePermissions } from './AdminPermissions';
import { useAdminI18n } from './AdminI18n';

type AnalysisScores = {
    platformLabel?: string;
    platform_label?: string;
    platform?: string;
    postLink?: string;
    post_link?: string;
    imageUrls?: string[];
    image_urls?: string[];
    reportImageUrl?: string;
    report_image_url?: string;
    reportImageUrls?: string[];
    report_image_urls?: string[];
    reportFileUrl?: string;
    report_file_url?: string;
    reportFileUrls?: string[];
    report_file_urls?: string[];
    reportFileNames?: string[];
    report_file_names?: string[];
    reportFileKinds?: string[];
    report_file_kinds?: string[];
    immediateDangerLabel?: string;
    immediateDanger?: string;
    targetGroup?: string;
    targetGroups?: string[];
    target_group?: string;
    target_groups?: string[];
    target_group_label?: string;
    imageDescription?: string;
    image_description?: string;
    rationale?: string;
    reasoning_ar?: string;
    reasoning?: string;
    text?: string;
    postText?: string;
    post_text?: string;
    content_text?: string;
    speech_type?: string;
    severity_score?: number | string;
    detected_markers?: string[];
    immediate_danger?: string;
    immediate_danger_label?: string;
    imageContextDescription?: string;
    image_context_description?: string;
};

type LegalItem = {
    id: string;
    reportNumber?: string | null;
    title: string;
    details: string;
    escalationFlag?: boolean;
    humanReviewStatus: string;
    reviewComment?: string | null;
    postUrl?: string | null;
    imageUrls?: string[];
    createdAt: string;
    analysisLog: {
        id: string;
        inputText: string;
        classification: string;
        riskLevel: string;
        confidenceScore?: number | string;
        aiScores: any;
        detectedKeywords: string[];
        createdAt: string;
    };
};

type FilterState = {
    reportNumber: string;
    dateFrom: string;
    dateTo: string;
    severity: string;
};

type ReportAttachment = {
    url: string;
    kind: 'image' | 'pdf';
    name: string | null;
};

const riskColors: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    HIGH: 'bg-red-50 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-50 text-green-700 border-green-200',
};

const emptyFilters: FilterState = {
    reportNumber: '',
    dateFrom: '',
    dateTo: '',
    severity: '',
};

const reviewStatusOptions = ['pending', 'reviewed', 'escalated', 'closed'] as const;

function getAnalysisScores(item: LegalItem): AnalysisScores {
    return ((item.analysisLog.aiScores as AnalysisScores | null) || {}) as AnalysisScores;
}

function getPostLink(item: LegalItem, scores: AnalysisScores) {
    const value = item.postUrl || scores.postLink || scores.post_link || '';
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function getPostText(item: LegalItem, scores: AnalysisScores) {
    const postLink = getPostLink(item, scores);
    const candidates = [
        item.analysisLog.inputText,
        scores.content_text,
        scores.text,
        scores.postText,
        scores.post_text,
    ];

    for (const candidate of candidates) {
        const normalized = typeof candidate === 'string' ? candidate.trim() : '';
        if (!normalized) {
            continue;
        }

        if (postLink && (normalized === postLink || normalized === `Report link: ${postLink}` || normalized === `Post link: ${postLink}`)) {
            continue;
        }

        return normalized;
    }

    return '';
}

function getTargetGroup(scores: AnalysisScores) {
    const targetGroupList = canonicalizeTargetGroupValues([
        ...(Array.isArray(scores.targetGroups) ? scores.targetGroups : []),
        ...(Array.isArray(scores.target_groups) ? scores.target_groups : []),
        scores.target_group_label,
        scores.target_group,
        scores.targetGroup,
    ]);

    if (targetGroupList.length > 0) {
        return targetGroupList.join(', ');
    }

    return scores.target_group_label || scores.target_group || scores.targetGroup || '—';
}

function getReportAttachments(item: LegalItem, scores: AnalysisScores): ReportAttachment[] {
    const urls = [
        ...(Array.isArray(item.imageUrls) ? item.imageUrls : []),
        ...(Array.isArray(scores.imageUrls) ? scores.imageUrls : []),
        ...(Array.isArray(scores.image_urls) ? scores.image_urls : []),
        ...(Array.isArray(scores.reportFileUrls) ? scores.reportFileUrls : []),
        ...(Array.isArray(scores.report_file_urls) ? scores.report_file_urls : []),
        ...(Array.isArray(scores.reportImageUrls) ? scores.reportImageUrls : []),
        ...(Array.isArray(scores.report_image_urls) ? scores.report_image_urls : []),
        ...(scores.reportFileUrl ? [scores.reportFileUrl] : []),
        ...(scores.report_file_url ? [scores.report_file_url] : []),
        ...(scores.reportImageUrl ? [scores.reportImageUrl] : []),
        ...(scores.report_image_url ? [scores.report_image_url] : []),
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    const uniqueUrls = Array.from(new Set(urls));
    const fileNames = [
        ...(Array.isArray(scores.reportFileNames) ? scores.reportFileNames : []),
        ...(Array.isArray(scores.report_file_names) ? scores.report_file_names : []),
    ];
    const fileKinds = [
        ...(Array.isArray(scores.reportFileKinds) ? scores.reportFileKinds : []),
        ...(Array.isArray(scores.report_file_kinds) ? scores.report_file_kinds : []),
    ];

    return uniqueUrls.map((url, index) => ({
        url,
        name: fileNames[index] || null,
        kind: fileKinds[index] === 'pdf' || url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
    }));
}

function getImageAttachments(item: LegalItem, scores: AnalysisScores) {
    return getReportAttachments(item, scores).filter((attachment) => attachment.kind === 'image');
}

function getSpeechType(item: LegalItem, scores: AnalysisScores) {
    return scores.speech_type || item.analysisLog.classification;
}

function getSeverity(item: LegalItem, scores: AnalysisScores) {
    const rawScore = Number(scores.severity_score ?? item.analysisLog.confidenceScore ?? 0);
    return `${getSeverityScoreOutOfFive(rawScore)} / 5`;
}

function getSeverityValue(item: LegalItem, scores: AnalysisScores) {
    const rawScore = Number(scores.severity_score ?? item.analysisLog.confidenceScore ?? 0);
    return getSeverityScoreOutOfFive(rawScore);
}

function getHatefulWords(item: LegalItem, scores: AnalysisScores) {
    const markers = Array.isArray(scores.detected_markers)
        ? scores.detected_markers.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];
    const fallback = Array.isArray(item.analysisLog.detectedKeywords)
        ? item.analysisLog.detectedKeywords.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [];
    const targetValues = [
        scores.target_group_label,
        scores.target_group,
        scores.targetGroup,
        ...(Array.isArray(scores.targetGroups) ? scores.targetGroups : []),
        ...(Array.isArray(scores.target_groups) ? scores.target_groups : []),
    ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim());
    const targetSet = new Set(targetValues);
    const source = markers.length > 0 ? markers : fallback;
    const filtered = source.filter((value) => !targetSet.has(value.trim()));
    return filtered.length > 0 ? filtered : source;
}

function getReasoning(scores: AnalysisScores) {
    return scores.rationale || scores.reasoning_ar || scores.reasoning || '—';
}

function getDisplayReasoning(scores: AnalysisScores, locale: 'ar' | 'en') {
    if (locale === 'ar') {
        return scores.reasoning_ar || scores.rationale || scores.reasoning || '—';
    }

    return scores.reasoning || scores.rationale || scores.reasoning_ar || '—';
}

function getImageDescription(scores: AnalysisScores) {
    return scores.imageDescription || scores.image_description || scores.imageContextDescription || scores.image_context_description || '—';
}

function getReviewStatusTone(value: string) {
    if (value === 'resolved') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (value === 'closed') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (value === 'escalated') {
        return 'border-red-200 bg-red-50 text-red-700';
    }
    if (value === 'reviewed' || value === 'in_review') {
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }
    return 'border-gray-200 bg-gray-50 text-gray-700';
}

function escapeCsvValue(value: unknown) {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

export function AdminLegalReportsManager() {
    const { can } = usePermissions();
    const {
        t,
        locale,
        formatDate,
        translateApiError,
        formatPlatform,
        formatImmediateDanger,
        formatClassification,
        formatRiskLevel,
        formatSpeechType,
        formatReviewStatus,
        formatTargetGroup,
    } = useAdminI18n();
    const [items, setItems] = useState<LegalItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<LegalItem | null>(null);
    const [filters, setFilters] = useState<FilterState>(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(emptyFilters);
    const [reviewStatus, setReviewStatus] = useState('pending');
    const [reviewComment, setReviewComment] = useState('');
    const [savingReview, setSavingReview] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (appliedFilters.reportNumber.trim()) {
                    params.set('reportNumber', appliedFilters.reportNumber.trim());
                }
                if (appliedFilters.dateFrom) {
                    params.set('dateFrom', appliedFilters.dateFrom);
                }
                if (appliedFilters.dateTo) {
                    params.set('dateTo', appliedFilters.dateTo);
                }
                if (appliedFilters.severity) {
                    params.set('severity', appliedFilters.severity);
                }

                const query = params.toString();
                const res = await fetch(`/api/admin/legal-reports${query ? `?${query}` : ''}`, {
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    setError(translateApiError(data?.error || t('errors.loadLegalReports')));
                    setItems([]);
                } else {
                    setItems(data);
                }
            } catch (e) {
                console.error(e);
                setError(t('errors.loadLegalReports'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [appliedFilters, t, translateApiError]);

    useEffect(() => {
        if (selected && !items.some((item) => item.id === selected.id)) {
            setSelected(null);
        }
    }, [items, selected]);

    useEffect(() => {
        if (!selected) {
            setReviewStatus('pending');
            setReviewComment('');
            return;
        }

        setReviewStatus(selected.humanReviewStatus || 'pending');
        setReviewComment(selected.reviewComment || '');
    }, [selected]);

    const handleDelete = async (id: string) => {
        const confirm = await Swal.fire({
            title: t('legal.deleteConfirm'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('common.yesDelete'),
            cancelButtonText: t('common.cancel'),
            reverseButtons: locale === 'ar',
        });
        if (!confirm.isConfirmed) return;
        const res = await fetch(`/api/admin/legal-reports?id=${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
            setItems((prev) => prev.filter((r) => r.id !== id));
            if (selected?.id === id) setSelected(null);
        } else {
            const data = await res.json().catch(() => null);
            setError(translateApiError(data?.error));
        }
    };

    const handleReviewUpdate = async () => {
        if (!selected || !can('reports', 'PATCH') || savingReview) {
            return;
        }

        setSavingReview(true);
        try {
            const response = await fetch('/api/admin/legal-reports', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: selected.id,
                    humanReviewStatus: reviewStatus,
                    reviewComment,
                }),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok || !data) {
                setError(translateApiError(data?.error || t('errors.updateReview')));
                return;
            }

            setError(null);
            setItems((current) => current.map((item) => (item.id === data.id ? (data as LegalItem) : item)));
            setSelected(data as LegalItem);

            await Swal.fire({
                icon: 'success',
                title: t('legal.reviewSavedTitle'),
                text: t('legal.reviewSavedBody'),
                timer: 1600,
                showConfirmButton: false,
            });
        } catch (updateError) {
            console.error(updateError);
            setError(t('errors.updateReview'));
        } finally {
            setSavingReview(false);
        }
    };

    const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
            setError(t('legal.startDateAfterEnd'));
            return;
        }

        setError(null);
        setAppliedFilters({
            reportNumber: filters.reportNumber.trim(),
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            severity: filters.severity,
        });
    };

    const handleResetFilters = () => {
        setError(null);
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    const exportCsv = () => {
        if (items.length === 0) {
            return;
        }

        const headers = [
            'report_number',
            'report_title',
            'report_created_at',
            'analysis_created_at',
            'classification',
            'risk_level',
            'severity',
            'speech_type',
            'target_group',
            'hateful_words',
            'platform',
            'post_link',
            'immediate_danger',
            'reasoning',
            'image_description',
            'attached_images',
            'input_text',
        ];

        const rows = items.map((item) => {
            const scores = getAnalysisScores(item);
            return [
                item.reportNumber || '',
                item.title,
                item.createdAt,
                item.analysisLog.createdAt,
                item.analysisLog.classification,
                item.analysisLog.riskLevel,
                getSeverityValue(item, scores),
                getSpeechType(item, scores),
                getTargetGroup(scores),
                getHatefulWords(item, scores).join(' | '),
                scores.platformLabel || scores.platform_label || scores.platform || '',
                getPostLink(item, scores),
                scores.immediateDangerLabel || scores.immediateDanger || scores.immediate_danger_label || scores.immediate_danger || '',
                getReasoning(scores),
                getImageDescription(scores),
                getReportAttachments(item, scores).map((attachment) => attachment.url).join(' | '),
                getPostText(item, scores),
            ].map(escapeCsvValue);
        });

        const csvContent = [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.join(','))].join('\r\n');
        const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filenameParts = ['legal-reports'];
        if (appliedFilters.dateFrom) {
            filenameParts.push(appliedFilters.dateFrom);
        }
        if (appliedFilters.dateTo) {
            filenameParts.push(appliedFilters.dateTo);
        }
        link.href = downloadUrl;
        link.download = `${filenameParts.join('-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
    };

    const renderMeta = (item: LegalItem) => {
        const scores = getAnalysisScores(item);
        const postLink = getPostLink(item, scores);
        return (
            <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">{t('legal.platform')}</p>
                    <p className="text-sm text-gray-900">{formatPlatform(scores.platformLabel || scores.platform_label || scores.platform || '')}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">{t('legal.postLink')}</p>
                    <p className="text-sm text-gray-900 break-all">{postLink || t('common.none')}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">{t('legal.immediateDanger')}</p>
                    <p className="text-sm text-gray-900">{formatImmediateDanger(scores.immediateDangerLabel || scores.immediateDanger || scores.immediate_danger_label || scores.immediate_danger || '')}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">{t('legal.targetGroup')}</p>
                    <p className="text-sm text-gray-900">{getTargetGroup(scores).split(', ').map((value) => formatTargetGroup(value)).join(', ')}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">{t('legal.imageDescription')}</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{scores.imageDescription || scores.image_description || t('common.none')}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{t('legal.title')}</h2>
            {!can('reports', 'PATCH') && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    {t('legal.readOnly')}
                </p>
            )}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={handleApplyFilters}>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">{t('legal.reportNumber')}</label>
                        <input
                            type="text"
                            value={filters.reportNumber}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, reportNumber: event.target.value }))
                            }
                            placeholder={t('legal.searchByReport')}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">{t('legal.fromDate')}</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, dateFrom: event.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">{t('legal.toDate')}</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, dateTo: event.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">{t('legal.severity')}</label>
                        <select
                            value={filters.severity}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, severity: event.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">{t('legal.allSeverities')}</option>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                    {value} / 5
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                {t('legal.applyFilters')}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                {t('legal.reset')}
                            </button>
                            <button
                                type="button"
                                onClick={exportCsv}
                                disabled={loading || items.length === 0}
                                className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('legal.exportCsv')}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            {loading ? t('legal.loadingFiltered') : t('legal.reportsFound', { count: items.length })}
                        </p>
                    </div>
                </form>

                {loading ? (
                    <p className="text-sm text-gray-500">{t('legal.loading')}</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('legal.empty')}</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                        {items.map((item) => {
                            const scores = getAnalysisScores(item);
                            const targetGroup = getTargetGroup(scores);
                            const speechType = getSpeechType(item, scores);
                            const severity = getSeverity(item, scores);
                            const hatefulWords = getHatefulWords(item, scores);
                            const postText = getPostText(item, scores);
                            const imageAttachments = getImageAttachments(item, scores);

                            return (
                                <div
                                    key={item.id}
                                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-gray-50"
                                    onClick={() => setSelected(item)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${riskColors[item.analysisLog.riskLevel] || riskColors.LOW}`}>
                                            {formatRiskLevel(item.analysisLog.riskLevel)}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        {item.reportNumber && (
                                            <p className="text-xs font-semibold text-emerald-700">{item.reportNumber}</p>
                                        )}
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getReviewStatusTone(item.humanReviewStatus)}`}
                                        >
                                            {formatReviewStatus(item.humanReviewStatus)}
                                        </span>
                                        {item.escalationFlag ? (
                                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                                                {t('legal.escalated')}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.reportNumber || t('legal.reportSummary')}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {t('legal.classification')}: {formatClassification(item.analysisLog.classification)} · {t('legal.severity')}: {severity}
                                    </p>

                                    {(postText || imageAttachments.length > 0) && (
                                        <div className="mt-3 space-y-2">
                                            {postText && (
                                                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <p className="text-[11px] text-gray-500">{t('legal.postText')}</p>
                                                    <p className="mt-1 text-xs leading-5 text-gray-800 line-clamp-3 whitespace-pre-wrap break-words">
                                                        {postText}
                                                    </p>
                                                </div>
                                            )}
                                            {imageAttachments.length > 0 && (
                                                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <p className="text-[11px] text-gray-500">{t('legal.postImages')}</p>
                                                        <span className="text-[11px] font-semibold text-emerald-700">
                                                            {imageAttachments.length}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {imageAttachments.slice(0, 3).map((attachment, index) => (
                                                            <div
                                                                key={`${item.id}-${attachment.url}-${index}`}
                                                                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                                                            >
                                                                <Image
                                                                    src={attachment.url}
                                                                    alt={`Post image preview ${index + 1}`}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-cover"
                                                                    sizes="160px"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                            <p className="text-[11px] text-gray-500">{t('legal.targetGroup')}</p>
                                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">{targetGroup.split(', ').map((value) => formatTargetGroup(value)).join(', ')}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                            <p className="text-[11px] text-gray-500">{t('legal.severity')}</p>
                                            <p className="text-xs font-semibold text-gray-900">{severity}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 col-span-2">
                                            <p className="text-[11px] text-gray-500">{t('legal.speechType')}</p>
                                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">{formatSpeechType(speechType)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-[11px] text-gray-500 mb-1">{t('legal.hatefulWords')}</p>
                                        {hatefulWords.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {hatefulWords.slice(0, 4).map((word) => (
                                                    <span
                                                        key={`${item.id}-${word}`}
                                                        className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                                {hatefulWords.length > 4 && (
                                                    <span className="inline-flex rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                                                        +{hatefulWords.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">{t('common.none')}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-500">{formatDate(selected.createdAt)}</p>
                                <h3 className="text-xl font-bold text-gray-900">{t('legal.reportDetail')}</h3>
                            </div>
                            <div className="flex gap-2">
                                <RequirePermission resource="reports" action="DELETE">
                                    <button
                                        onClick={() => handleDelete(selected.id)}
                                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </RequirePermission>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>

                        {(() => {
                            const scores = getAnalysisScores(selected);
                            const targetGroup = getTargetGroup(scores);
                            const speechType = getSpeechType(selected, scores);
                            const severity = getSeverity(selected, scores);
                            const hatefulWords = getHatefulWords(selected, scores);
                            const postText = getPostText(selected, scores);
                            const postLink = getPostLink(selected, scores);
                            const reportAttachments = getReportAttachments(selected, scores);
                            const imageAttachments = reportAttachments.filter((attachment) => attachment.kind === 'image');

                            return (
                                <>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.reportNumber')}</p>
                                            <p className="font-bold text-gray-900">{selected.reportNumber || t('common.none')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.humanReview')}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getReviewStatusTone(selected.humanReviewStatus)}`}>
                                                    {formatReviewStatus(selected.humanReviewStatus)}
                                                </span>
                                                {selected.escalationFlag ? (
                                                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                        {t('legal.escalated')}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.classification')}</p>
                                            <p className="font-bold text-gray-900">{formatClassification(selected.analysisLog.classification)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.severity')}</p>
                                            <p className="font-bold text-gray-900">{severity}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.riskLevel')}</p>
                                            <p className="font-bold text-gray-900">{formatRiskLevel(selected.analysisLog.riskLevel)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.targetGroup')}</p>
                                            <p className="font-bold text-gray-900">{targetGroup.split(', ').map((value) => formatTargetGroup(value)).join(', ')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">{t('legal.speechType')}</p>
                                            <p className="font-bold text-gray-900">{formatSpeechType(speechType)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 md:col-span-2">
                                            <p className="text-xs text-gray-500">{t('legal.hatefulWords')}</p>
                                            {hatefulWords.length > 0 ? (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {hatefulWords.map((word) => (
                                                        <span
                                                            key={`${selected.id}-${word}`}
                                                            className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                                                        >
                                                            {word}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="font-bold text-gray-900">{t('common.none')}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                                        <div className="rounded-xl border border-gray-100 bg-white p-4">
                                            <p className="text-xs text-gray-500 mb-2">{t('legal.postText')}</p>
                                            {postText ? (
                                                <p className="text-gray-900 leading-7 whitespace-pre-wrap break-words">
                                                    {postText}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    {t('legal.noPostText')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{t('legal.postLink')}</p>
                                                <p className="text-sm text-gray-900 break-all">
                                                    {postLink || t('common.none')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{t('legal.imageDescription')}</p>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                    {getImageDescription(scores)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">{t('legal.storedImages')}</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {imageAttachments.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {reportAttachments.length > 0 && (
                                        <div className="rounded-xl border border-gray-100 bg-white p-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <p className="text-xs text-gray-500">
                                                    {t('legal.postImagesAndAttachments')} ({reportAttachments.length})
                                                </p>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {reportAttachments.map((attachment, index) => (
                                                    <div
                                                        key={`${selected.id}-${attachment.url}-${index}`}
                                                        className="rounded-lg border border-stone-200 bg-stone-50 p-2"
                                                    >
                                                        <div className="mb-2 flex items-center justify-between gap-3">
                                                            <p className="text-xs font-semibold text-stone-500">
                                                                {attachment.kind === 'pdf' ? `${t('legal.attachment')} PDF ${index + 1}` : `${t('legal.image')} ${index + 1}`}
                                                            </p>
                                                            <a
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                            >
                                                                {t('legal.openFile')}
                                                            </a>
                                                        </div>
                                                        {attachment.kind === 'pdf' ? (
                                                            <div className="flex min-h-[220px] items-center justify-center rounded-lg bg-white p-6 text-center">
                                                                <div>
                                                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                                                        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 3v5h5" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 15h6M9 12h3" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className="mt-3 text-sm font-semibold text-stone-900">
                                                                        {attachment.name || `${t('legal.attachment')} ${index + 1}`}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-stone-500">
                                                                        {t('legal.pdfDocument')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white">
                                                                <Image
                                                                    src={attachment.url}
                                                                    alt={`Attached report evidence ${index + 1}`}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-contain"
                                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reportAttachments.length === 0 && getImageDescription(scores) !== '—' && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <p className="text-sm font-semibold text-amber-900">{t('legal.noOriginalImageTitle')}</p>
                                            <p className="mt-1 text-sm text-amber-800">
                                                {t('legal.noOriginalImageBody')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{t('legal.reviewWorkflow')}</p>
                                                <p className="text-xs text-gray-500">
                                                    {t('legal.reviewWorkflowSubtitle')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                                    {t('legal.reviewStatus')}
                                                </label>
                                                <select
                                                    value={reviewStatus}
                                                    onChange={(event) => setReviewStatus(event.target.value)}
                                                    disabled={!can('reports', 'PATCH') || savingReview}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                                >
                                                    {reviewStatusOptions.map((option) => (
                                                        <option key={option} value={option}>
                                                            {formatReviewStatus(option)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                                                <p className="text-xs text-gray-500">{t('legal.currentInternalState')}</p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {formatReviewStatus(reviewStatus)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                                                {t('legal.internalReviewNote')}
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(event) => setReviewComment(event.target.value)}
                                                disabled={!can('reports', 'PATCH') || savingReview}
                                                rows={4}
                                                placeholder={t('legal.internalReviewPlaceholder')}
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-gray-500">
                                                {t('legal.internalOnlyNote')}
                                            </p>
                                            <RequirePermission resource="reports" action="PATCH">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleReviewUpdate()}
                                                    disabled={savingReview}
                                                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {savingReview ? t('common.saving') : t('legal.saveReviewUpdate')}
                                                </button>
                                            </RequirePermission>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">{t('legal.reasoning')}</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {getDisplayReasoning(selected.analysisLog.aiScores || {}, locale)}
                            </p>
                        </div>

                        {renderMeta(selected)}
                    </div>
                </div>
            )}
        </div>
    );
}
