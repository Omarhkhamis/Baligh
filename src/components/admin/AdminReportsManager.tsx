"use client";

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { normalizeReportCategory, REPORT_CATEGORIES, type ReportCategoryKey } from '@/data/reportCategories';
import { ImagePicker } from './ImagePicker';
import { toastSuccess } from './toast';

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
    isPublished: boolean;
    publishedAt?: string | null;
    createdAt?: string | null;
};

type FormState = {
    titleAr: string;
    titleEn: string;
    summaryAr: string;
    summaryEn: string;
    bodyAr: string;
    bodyEn: string;
    category: ReportCategoryKey;
    authorName: string;
    authorNameEn: string;
    imageUrl: string;
    documentUrlAr: string;
    documentUrlEn: string;
    publishNow: boolean;
};

const defaultForm: FormState = {
    titleAr: '',
    titleEn: '',
    summaryAr: '',
    summaryEn: '',
    bodyAr: '',
    bodyEn: '',
    category: 'initiative',
    authorName: '',
    authorNameEn: '',
    imageUrl: '',
    documentUrlAr: '',
    documentUrlEn: '',
    publishNow: true,
};

export function AdminReportsManager() {
    const [items, setItems] = useState<ReportItem[]>([]);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadingPdfAr, setUploadingPdfAr] = useState(false);
    const [uploadingPdfEn, setUploadingPdfEn] = useState(false);

    const categoryOptions = useMemo(() => Object.entries(REPORT_CATEGORIES), []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/reports');
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    setError(data?.error || 'Failed to load reports');
                    setItems([]);
                } else {
                    setItems(data);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load reports');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        const handlePdfDeleted = (event: Event) => {
            const detail = (event as CustomEvent<{ url: string }>).detail;
            if (!detail?.url) return;
            setForm((prev) => ({
                ...prev,
                documentUrlAr: prev.documentUrlAr === detail.url ? '' : prev.documentUrlAr,
                documentUrlEn: prev.documentUrlEn === detail.url ? '' : prev.documentUrlEn,
            }));
        };

        window.addEventListener('upload:pdf-deleted', handlePdfDeleted);
        return () => {
            window.removeEventListener('upload:pdf-deleted', handlePdfDeleted);
        };
    }, []);

    const handleChange = (key: keyof FormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const uploadPdf = async (file: File, onSuccess: (url: string) => void, setUploading: (v: boolean) => void) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are allowed');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('Max file size is 20MB');
            return;
        }
        setUploading(true);
        setError(null);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload-report-doc', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || 'Upload failed');
                return;
            }
            onSuccess(data.url);
            setMessage('PDF uploaded');
        } catch (e) {
            console.error(e);
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUploadAr = (file: File | null) => {
        if (!file) return;
        uploadPdf(file, (url) => setForm((prev) => ({ ...prev, documentUrlAr: url })), setUploadingPdfAr);
    };

    const handlePdfUploadEn = (file: File | null) => {
        if (!file) return;
        uploadPdf(file, (url) => setForm((prev) => ({ ...prev, documentUrlEn: url })), setUploadingPdfEn);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(defaultForm);
        setMessage(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/reports', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId || undefined,
                    titleAr: form.titleAr,
                    titleEn: form.titleEn || form.titleAr,
                    summaryAr: form.summaryAr,
                    summaryEn: form.summaryEn || form.summaryAr,
                    bodyAr: form.bodyAr || form.summaryAr,
                    bodyEn: form.bodyEn || form.bodyAr || form.summaryAr,
                    category: form.category,
                    authorName: form.authorName || null,
                    authorNameEn: form.authorNameEn || null,
                    imageUrl: form.imageUrl || null,
                    documentUrl: null,
                    documentUrlAr: form.documentUrlAr || null,
                    documentUrlEn: form.documentUrlEn || null,
                    publishNow: form.publishNow,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save report');
                setSaving(false);
                return;
            }
            if (editingId) {
                setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
                setMessage('Report updated');
                void toastSuccess('تم تحديث التقرير بنجاح');
            } else {
                setItems((prev) => [data, ...prev]);
                setMessage('Report created');
                void toastSuccess('تم إنشاء التقرير بنجاح');
            }
            resetForm();
            setShowModal(false);
        } catch (e) {
            console.error(e);
            setError('Unexpected error');
            void Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'تعذر حفظ التقرير. حاول مجدداً.',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Reports & Studies</h3>
                    <p className="text-xs text-gray-500">{items.length} entries</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700"
                >
                    <span className="text-lg">＋</span>
                    <span>Add report</span>
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : items.length === 0 ? (
                    <div className="text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6">
                        No reports yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-3 hover:border-emerald-200">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-lg uppercase">
                                    {item.category?.slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {new Date(item.publishedAt || item.createdAt || '').toLocaleDateString('en-US')}
                                        {item.authorName || item.authorNameEn ? ` · ${item.authorName || item.authorNameEn}` : ''}
                                    </p>
                                    <h4 className="text-base font-semibold text-gray-900">
                                        {item.title?.en || item.title?.ar || 'Untitled'}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {item.summary?.en || item.summary?.ar || ''}
                                    </p>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-lg border border-gray-200">
                                            {item.category}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-lg border ${item.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {item.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center"
                                        title="Edit"
                                        onClick={() => {
                                            setEditingId(item.id);
                                            setForm({
                                                titleAr: item.title?.ar || '',
                                                titleEn: item.title?.en || '',
                                                summaryAr: item.summary?.ar || '',
                                                summaryEn: item.summary?.en || '',
                                                bodyAr: item.body?.ar || '',
                                                bodyEn: item.body?.en || '',
                                                category: normalizeReportCategory(item.category),
                                                authorName: item.authorName || '',
                                                authorNameEn: item.authorNameEn || '',
                                                imageUrl: item.imageUrl || '',
                                                documentUrlAr: (item as any).documentUrlAr || '',
                                                documentUrlEn: (item as any).documentUrlEn || '',
                                                publishNow: item.isPublished ?? true,
                                            });
                                            setMessage(null);
                                            setError(null);
                                            setShowModal(true);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        className="w-9 h-9 rounded-full bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 flex items-center justify-center font-bold"
                                        title="Delete"
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Delete this report?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#3085d6',
                                                confirmButtonText: 'Yes, delete',
                                            });
                                            if (!result.isConfirmed) return;
                                            const res = await fetch(`/api/admin/reports?id=${item.id}`, { method: 'DELETE' });
                                            if (res.ok) {
                                                setItems((prev) => prev.filter((i) => i.id !== item.id));
                                            }
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
                    <div className="mt-[10vh] mb-[10vh] w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Report/Study' : 'Add Report/Study'}</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <form className="p-6 space-y-3" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Title (Arabic)"
                                    value={form.titleAr}
                                    onChange={(e) => handleChange('titleAr', e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Title (English)"
                                    value={form.titleEn}
                                    onChange={(e) => handleChange('titleEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Author (Arabic or default)"
                                    value={form.authorName}
                                    onChange={(e) => handleChange('authorName', e.target.value)}
                                />
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Author (English, optional)"
                                    value={form.authorNameEn}
                                    onChange={(e) => handleChange('authorNameEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Summary (Arabic)"
                                    rows={2}
                                    value={form.summaryAr}
                                    onChange={(e) => handleChange('summaryAr', e.target.value)}
                                    required
                                />
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Summary (English)"
                                    rows={2}
                                    value={form.summaryEn}
                                    onChange={(e) => handleChange('summaryEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Body (Arabic)"
                                    rows={3}
                                    value={form.bodyAr}
                                    onChange={(e) => handleChange('bodyAr', e.target.value)}
                                />
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Body (English)"
                                    rows={3}
                                    value={form.bodyEn}
                                    onChange={(e) => handleChange('bodyEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ImagePicker
                                    label="Image (optional)"
                                    value={form.imageUrl}
                                    onChange={(url) => handleChange('imageUrl', url)}
                                    placeholder="Image URL (optional)"
                                />
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Document (Arabic PDF, max 20MB)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => handlePdfUploadAr(e.target.files?.[0] || null)}
                                                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('documentUrlAr', '')}
                                                className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Or paste Arabic PDF/link"
                                            value={form.documentUrlAr}
                                            onChange={(e) => handleChange('documentUrlAr', e.target.value)}
                                        />
                                        {form.documentUrlAr && (
                                            <p className="text-xs text-emerald-700">Attached (AR): {form.documentUrlAr}</p>
                                        )}
                                        {uploadingPdfAr && <p className="text-xs text-gray-500">Uploading Arabic PDF...</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Document (English PDF, max 20MB)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => handlePdfUploadEn(e.target.files?.[0] || null)}
                                                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('documentUrlEn', '')}
                                                className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Or paste English PDF/link"
                                            value={form.documentUrlEn}
                                            onChange={(e) => handleChange('documentUrlEn', e.target.value)}
                                        />
                                        {form.documentUrlEn && (
                                            <p className="text-xs text-emerald-700">Attached (EN): {form.documentUrlEn}</p>
                                        )}
                                        {uploadingPdfEn && <p className="text-xs text-gray-500">Uploading English PDF...</p>}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.category}
                                    onChange={(e) => handleChange('category', e.target.value as ReportCategoryKey)}
                                >
                                    {categoryOptions.map(([key, cat]) => (
                                        <option key={key} value={key}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="publishNowReports"
                                    type="checkbox"
                                    checked={form.publishNow}
                                    onChange={(e) => handleChange('publishNow', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="publishNowReports" className="text-sm text-gray-700">
                                    Publish now
                                </label>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {message && <p className="text-sm text-emerald-600">{message}</p>}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update report' : 'Save report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
