'use client';

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

type FeedbackItem = {
    id: string;
    inputText: string;
    classification: string;
    riskLevel: string;
    detectedKeywords: string[];
    aiScores: any;
    createdAt: string;
};

const riskColors: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    HIGH: 'bg-red-50 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-50 text-green-700 border-green-200',
};

const classifyLabel = (value: string) => {
    const normalized = (value || '').toUpperCase();
    if (normalized === 'CATEGORY A') return 'Category A – Direct incitement';
    if (normalized === 'CATEGORY B') return 'Category B – Harassment/Threat';
    if (normalized === 'CATEGORY C') return 'Category C – Dehumanization';
    if (normalized === 'CATEGORY D') return 'Category D – Low-level hate';
    if (normalized === 'SAFE' || normalized === 'NONE') return 'Safe';
    return value || '—';
};

export function AdminFeedbackManager() {
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<FeedbackItem | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/feedback', { credentials: 'include' });
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    setError(data?.error || 'Failed to load feedback');
                    setItems([]);
                } else {
                    const filtered = data.filter((item: any) => {
                        const scores = item.aiScores || {};
                        return !scores.postLink && !scores.reporterCountry && !scores.targetGroup;
                    });
                    setItems(filtered);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load feedback');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleDelete = async (id: string) => {
        const confirm = await Swal.fire({
            title: 'Delete this entry?',
            text: 'This will remove the analysis submission permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
        });
        if (!confirm.isConfirmed) return;
        const res = await fetch(`/api/admin/feedback?id=${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
            setItems((prev) => prev.filter((f) => f.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const formatDate = (value: string) => new Date(value).toLocaleString();

    const details = useMemo(() => {
        if (!selected) return null;
        const aiScores = selected.aiScores || {};
        const targetGroup = aiScores.target_group_label || aiScores.target_group || '—';
        return {
            speechType: aiScores.speech_type || '—',
            targetGroup,
            rationale: aiScores.rationale || '',
            classification: classifyLabel(selected.classification),
        };
    }, [selected]);

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">User Feedback</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">No feedback yet.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-gray-50"
                                onClick={() => setSelected(item)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${riskColors[item.riskLevel] || riskColors.LOW}`}>
                                        {item.riskLevel}
                                    </span>
                                    <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                                    {item.inputText}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    Classification: {classifyLabel(item.classification)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-500">{formatDate(selected.createdAt)}</p>
                                <h3 className="text-xl font-bold text-gray-900">Submission Detail</h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(selected.id)}
                                    className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 w-full">
                                <p className="text-xs text-gray-500">AI classification</p>
                                <p className="font-bold text-gray-900">{details?.classification}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 w-full">
                                <p className="text-xs text-gray-500">Risk level</p>
                                <p className="font-bold text-gray-900">{selected.riskLevel}</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">Target group</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{details?.targetGroup || '—'}</p>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">Rationale</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{details?.rationale || '—'}</p>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">Original text</p>
                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selected.inputText}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
