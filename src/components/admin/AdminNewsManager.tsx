"use client";

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { NEWS_CATEGORIES, type NewsCategoryKey } from '@/data/newsCategories';
import { ImagePicker } from './ImagePicker';
import { toastSuccess } from './toast';

type NewsItem = {
    id: string;
    title: Record<string, string>;
    summary: Record<string, string>;
    body: Record<string, string>;
    category: string;
    authorName?: string | null;
    authorNameEn?: string | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
    isPublished: boolean;
};

type FormState = {
    titleAr: string;
    titleEn: string;
    summaryAr: string;
    summaryEn: string;
    bodyAr: string;
    bodyEn: string;
    category: NewsCategoryKey;
    imageUrl: string;
    videoUrl: string;
    authorName: string;
    authorNameEn: string;
    publishedAt: string;
    publishNow: boolean;
};

const defaultForm: FormState = {
    titleAr: '',
    titleEn: '',
    summaryAr: '',
    summaryEn: '',
    bodyAr: '',
    bodyEn: '',
    category: 'training',
    imageUrl: '',
    videoUrl: '',
    authorName: '',
    authorNameEn: '',
    publishedAt: '',
    publishNow: true,
};

export function AdminNewsManager() {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const categoryOptions = useMemo(() => Object.entries(NEWS_CATEGORIES), []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/news');
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    setError(data?.error || 'Failed to load news articles');
                    setItems([]);
                } else {
                    setItems(data);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load news articles');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleChange = (key: keyof FormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
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
            const res = await fetch('/api/admin/news', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId || undefined,
                    titleAr: form.titleAr,
                    titleEn: form.titleEn || form.titleAr,
                    summaryAr: form.summaryAr,
                    summaryEn: form.summaryEn || form.summaryAr,
                bodyAr: form.bodyAr || form.summaryAr,
                bodyEn: form.bodyEn || form.bodyAr,
                category: form.category,
                imageUrl: form.imageUrl || null,
                videoUrl: form.videoUrl || null,
                authorName: form.authorName || null,
                authorNameEn: form.authorNameEn || null,
                publishedAt: form.publishedAt || null,
                publishNow: form.publishNow,
            }),
        });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save article');
                setSaving(false);
                return;
            }
            if (editingId) {
                setItems((prev) => prev.map((i) => (i.id === editingId ? data : i)));
                setMessage('Article updated');
                void toastSuccess('تم تحديث الخبر بنجاح');
            } else {
                setItems((prev) => [data, ...prev]);
                setMessage('Article created');
                void toastSuccess('تم إنشاء الخبر بنجاح');
            }
            resetForm();
            setShowModal(false);
        } catch (e) {
            console.error(e);
            setError('Unexpected error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">News Articles</h3>
                    <p className="text-xs text-gray-500">{items.length} articles</p>
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
                    <span>Add article</span>
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : items.length === 0 ? (
                    <div className="text-center text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6">
                        No news articles yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-3 hover:border-emerald-200">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg uppercase">
                                    {item.category?.slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {new Date(item.publishedAt || item.createdAt || '').toLocaleDateString('en-US')}
                                        {item.authorName ? ` · ${item.authorName}` : ''}
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
                                                category: (item.category.toLowerCase() as NewsCategoryKey) || 'training',
                                                imageUrl: item.imageUrl || '',
                                                videoUrl: item.videoUrl || '',
                                                authorName: item.authorName || '',
                                                authorNameEn: item.authorNameEn || '',
                                                publishedAt: item.publishedAt ? item.publishedAt.substring(0, 10) : '',
                                                publishNow: item.isPublished,
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
                                                title: 'Delete this article?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#3085d6',
                                                confirmButtonText: 'Yes, delete',
                                            });
                                            if (!result.isConfirmed) return;
                                            const res = await fetch(`/api/admin/news?id=${item.id}`, { method: 'DELETE' });
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
                            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit News Article' : 'Add News Article'}</h3>
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
                                    label="Image"
                                    value={form.imageUrl}
                                    onChange={(url) => handleChange('imageUrl', url)}
                                    placeholder="Image URL"
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL (optional)</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Video URL (optional)"
                                        value={form.videoUrl}
                                        onChange={(e) => handleChange('videoUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Author name</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Author name"
                                        value={form.authorName}
                                        onChange={(e) => handleChange('authorName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Author name (English)</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Author name (English)"
                                        value={form.authorNameEn}
                                        onChange={(e) => handleChange('authorNameEn', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Publish date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={form.publishedAt}
                                        onChange={(e) => handleChange('publishedAt', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.category}
                                    onChange={(e) => handleChange('category', e.target.value as NewsCategoryKey)}
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
                                    id="publishNow"
                                    type="checkbox"
                                    checked={form.publishNow}
                                    onChange={(e) => handleChange('publishNow', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="publishNow" className="text-sm text-gray-700">
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
                                    {saving ? 'Saving...' : editingId ? 'Update article' : 'Save article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
