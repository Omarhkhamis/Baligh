'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSeverityScoreOutOfFive } from '@/lib/analysis-utils';
import Swal from 'sweetalert2';
import { RequirePermission, usePermissions } from './AdminPermissions';

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

const reviewStatusOptions = [
    { value: 'pending', label: 'Pending review' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'closed', label: 'Closed' },
] as const;

const classifyLabel = (value: string) => {
    const normalized = (value || '').toUpperCase();
    if (normalized === 'CATEGORY A') return 'Direct incitement';
    if (normalized === 'CATEGORY B') return 'Harassment / threat';
    if (normalized === 'CATEGORY C') return 'Dehumanization';
    if (normalized === 'CATEGORY D') return 'Low-level hate';
    if (normalized === 'SAFE' || normalized === 'NONE') return 'Safe content';
    return value || '—';
};

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
    const targetGroupList = [
        ...(Array.isArray(scores.targetGroups) ? scores.targetGroups : []),
        ...(Array.isArray(scores.target_groups) ? scores.target_groups : []),
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (targetGroupList.length > 0) {
        return Array.from(new Set(targetGroupList)).join(', ');
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
    return scores.speech_type || classifyLabel(item.analysisLog.classification);
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

function getImageDescription(scores: AnalysisScores) {
    return scores.imageDescription || scores.image_description || scores.imageContextDescription || scores.image_context_description || '—';
}

function getReviewStatusLabel(value: string) {
    const match = reviewStatusOptions.find((option) => option.value === value);
    return match?.label || value || '—';
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
                    setError(data?.error || 'Failed to load legal reports');
                    setItems([]);
                } else {
                    setItems(data);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load legal reports');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [appliedFilters]);

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
            title: 'Delete this legal report?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
        });
        if (!confirm.isConfirmed) return;
        const res = await fetch(`/api/admin/legal-reports?id=${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
            setItems((prev) => prev.filter((r) => r.id !== id));
            if (selected?.id === id) setSelected(null);
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
                setError(data?.error || 'Failed to update review status');
                return;
            }

            setError(null);
            setItems((current) => current.map((item) => (item.id === data.id ? (data as LegalItem) : item)));
            setSelected(data as LegalItem);

            await Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Review status updated successfully.',
                timer: 1600,
                showConfirmButton: false,
            });
        } catch (updateError) {
            console.error(updateError);
            setError('Failed to update review status');
        } finally {
            setSavingReview(false);
        }
    };

    const formatDate = (value: string) => new Date(value).toLocaleDateString();

    const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
            setError('Start date cannot be later than end date.');
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
                    <p className="text-xs text-gray-500">Platform</p>
                    <p className="text-sm text-gray-900">{scores.platformLabel || scores.platform_label || scores.platform || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Post link</p>
                    <p className="text-sm text-gray-900 break-all">{postLink || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Immediate danger</p>
                    <p className="text-sm text-gray-900">
                        {scores.immediateDangerLabel || scores.immediateDanger || scores.immediate_danger_label || scores.immediate_danger || '—'}
                    </p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Target group</p>
                    <p className="text-sm text-gray-900">{getTargetGroup(scores)}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Image description</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{scores.imageDescription || scores.image_description || '—'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Legal Reports</h2>
            {!can('reports', 'PATCH') && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Reports are read-only for your current role.
                </p>
            )}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={handleApplyFilters}>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Report number</label>
                        <input
                            type="text"
                            value={filters.reportNumber}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, reportNumber: event.target.value }))
                            }
                            placeholder="Search by report number only"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">From date</label>
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
                        <label className="mb-1 block text-xs font-semibold text-gray-600">To date</label>
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
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Severity</label>
                        <select
                            value={filters.severity}
                            onChange={(event) =>
                                setFilters((current) => ({ ...current, severity: event.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All severities</option>
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
                                Apply filters
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={exportCsv}
                                disabled={loading || items.length === 0}
                                className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Export CSV
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            {loading ? 'Loading filtered results...' : `${items.length} reports found`}
                        </p>
                    </div>
                </form>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">No legal reports yet.</p>
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
                                            {item.analysisLog.riskLevel}
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
                                            {getReviewStatusLabel(item.humanReviewStatus)}
                                        </span>
                                        {item.escalationFlag ? (
                                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                                                Escalated
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{item.details}</p>

                                    {(postText || imageAttachments.length > 0) && (
                                        <div className="mt-3 space-y-2">
                                            {postText && (
                                                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <p className="text-[11px] text-gray-500">Post text</p>
                                                    <p className="mt-1 text-xs leading-5 text-gray-800 line-clamp-3 whitespace-pre-wrap break-words">
                                                        {postText}
                                                    </p>
                                                </div>
                                            )}
                                            {imageAttachments.length > 0 && (
                                                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <p className="text-[11px] text-gray-500">Post images</p>
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
                                            <p className="text-[11px] text-gray-500">Target group</p>
                                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">{targetGroup}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                                            <p className="text-[11px] text-gray-500">Severity</p>
                                            <p className="text-xs font-semibold text-gray-900">{severity}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 col-span-2">
                                            <p className="text-[11px] text-gray-500">Speech type</p>
                                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">{speechType}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-[11px] text-gray-500 mb-1">Hateful words</p>
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
                                            <p className="text-xs text-gray-500">—</p>
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
                                <h3 className="text-xl font-bold text-gray-900">Legal report detail</h3>
                            </div>
                            <div className="flex gap-2">
                                <RequirePermission resource="reports" action="DELETE">
                                    <button
                                        onClick={() => handleDelete(selected.id)}
                                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                    >
                                        Delete
                                    </button>
                                </RequirePermission>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm"
                                >
                                    Close
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
                                            <p className="text-xs text-gray-500">Report number</p>
                                            <p className="font-bold text-gray-900">{selected.reportNumber || '—'}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Human review</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getReviewStatusTone(selected.humanReviewStatus)}`}>
                                                    {getReviewStatusLabel(selected.humanReviewStatus)}
                                                </span>
                                                {selected.escalationFlag ? (
                                                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                        Escalated alert
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Classification</p>
                                            <p className="font-bold text-gray-900">{selected.analysisLog.classification}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Severity</p>
                                            <p className="font-bold text-gray-900">{severity}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Risk level</p>
                                            <p className="font-bold text-gray-900">{selected.analysisLog.riskLevel}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Target group</p>
                                            <p className="font-bold text-gray-900">{targetGroup}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <p className="text-xs text-gray-500">Speech type</p>
                                            <p className="font-bold text-gray-900">{speechType}</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 md:col-span-2">
                                            <p className="text-xs text-gray-500">Hateful words</p>
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
                                                <p className="font-bold text-gray-900">—</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                                        <div className="rounded-xl border border-gray-100 bg-white p-4">
                                            <p className="text-xs text-gray-500 mb-2">Post text</p>
                                            {postText ? (
                                                <p className="text-gray-900 leading-7 whitespace-pre-wrap break-words">
                                                    {postText}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No original post text was stored for this report.
                                                </p>
                                            )}
                                        </div>
                                        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Post link</p>
                                                <p className="text-sm text-gray-900 break-all">
                                                    {postLink || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Image description</p>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                    {getImageDescription(scores)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Stored images</p>
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
                                                    Post images and attachments ({reportAttachments.length})
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
                                                                {attachment.kind === 'pdf' ? `PDF ${index + 1}` : `Image ${index + 1}`}
                                                            </p>
                                                            <a
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                                            >
                                                                Open file
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
                                                                        {attachment.name || `Attachment ${index + 1}`}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-stone-500">
                                                                        PDF document
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
                                            <p className="text-sm font-semibold text-amber-900">No original image file is stored</p>
                                            <p className="mt-1 text-sm text-amber-800">
                                                This report only has an image description in the analysis data. The dashboard can show the actual image only when the original upload URL was saved with the report.
                                            </p>
                                        </div>
                                    )}

                                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Human review workflow</p>
                                                <p className="text-xs text-gray-500">
                                                    Analysts can update status and add an internal note without deleting the report.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                                    Review status
                                                </label>
                                                <select
                                                    value={reviewStatus}
                                                    onChange={(event) => setReviewStatus(event.target.value)}
                                                    disabled={!can('reports', 'PATCH') || savingReview}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                                >
                                                    {reviewStatusOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                                                <p className="text-xs text-gray-500">Current internal state</p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {getReviewStatusLabel(reviewStatus)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                                                Internal review note
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(event) => setReviewComment(event.target.value)}
                                                disabled={!can('reports', 'PATCH') || savingReview}
                                                rows={4}
                                                placeholder="Add analyst note or follow-up summary"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-gray-500">
                                                Reporter is not notified from this panel. Updates remain internal only.
                                            </p>
                                            <RequirePermission resource="reports" action="PATCH">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleReviewUpdate()}
                                                    disabled={savingReview}
                                                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {savingReview ? 'Saving...' : 'Save review update'}
                                                </button>
                                            </RequirePermission>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">Reasoning</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {selected.analysisLog.aiScores?.rationale || selected.analysisLog.aiScores?.reasoning_ar || selected.analysisLog.aiScores?.reasoning || '—'}
                            </p>
                        </div>

                        {renderMeta(selected)}
                    </div>
                </div>
            )}
        </div>
    );
}
