'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

type LegalItem = {
    id: string;
    title: string;
    details: string;
    createdAt: string;
    analysisLog: {
        id: string;
        inputText: string;
        classification: string;
        riskLevel: string;
        aiScores: any;
        detectedKeywords: string[];
        createdAt: string;
    };
};

const riskColors: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    HIGH: 'bg-red-50 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-50 text-green-700 border-green-200',
};

export function AdminLegalReportsManager() {
    const [items, setItems] = useState<LegalItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<LegalItem | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/admin/legal-reports', { credentials: 'include' });
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
    }, []);

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

    const formatDate = (value: string) => new Date(value).toLocaleString();

    const renderMeta = (item: LegalItem) => {
        const scores = item.analysisLog.aiScores || {};
        return (
            <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Post link</p>
                    <p className="text-sm text-gray-900 break-all">{scores.postLink || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Reporter country</p>
                    <p className="text-sm text-gray-900">{scores.reporterCountry || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Target group</p>
                    <p className="text-sm text-gray-900">{scores.targetGroup || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Image description</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{scores.imageDescription || '—'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Legal Reports</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500">No legal reports yet.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                        {items.map((item) => (
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
                                <p className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</p>
                                <p className="text-xs text-gray-600 line-clamp-2">{item.details}</p>
                            </div>
                        ))}
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

                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500">Classification</p>
                                <p className="font-bold text-gray-900">{selected.analysisLog.classification}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500">Risk level</p>
                                <p className="font-bold text-gray-900">{selected.analysisLog.riskLevel}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500">Detected markers</p>
                                <p className="font-bold text-gray-900">{selected.analysisLog.detectedKeywords.join(', ') || '—'}</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-1">Report link</p>
                            <p className="text-gray-900 leading-relaxed break-all whitespace-pre-wrap">
                                {selected.analysisLog.aiScores?.postLink || selected.analysisLog.inputText || '—'}
                            </p>
                        </div>
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
