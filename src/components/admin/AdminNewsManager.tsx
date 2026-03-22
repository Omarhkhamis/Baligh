"use client";

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { NEWS_CATEGORIES, type NewsCategoryKey } from '@/data/newsCategories';
import { RequirePermission, usePermissions } from './AdminPermissions';
import { useAdminI18n } from './AdminI18n';
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
    const { can } = usePermissions();
    const { t, locale, formatDate, pickLocalizedText, formatNewsCategory, translateApiError } = useAdminI18n();
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
                    setError(translateApiError(data?.error || t('errors.loadNews')));
                    setItems([]);
                } else {
                    setItems(data);
                }
            } catch (loadError) {
                console.error(loadError);
                setError(t('errors.loadNews'));
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [t, translateApiError]);

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
        const action = editingId ? 'PATCH' : 'POST';
        if (!can('news', action)) {
            setError(t('common.permissionDenied'));
            return;
        }

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
                    bodyEn: form.bodyEn || form.bodyAr || form.summaryAr,
                    category: form.category,
                    imageUrl: form.imageUrl || null,
                    videoUrl: form.videoUrl || null,
                    authorName: form.authorName || null,
                    authorNameEn: form.authorNameEn || null,
                    publishedAt: form.publishedAt || null,
                    publishNow: form.publishNow,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(translateApiError(data?.error || t('errors.saveNews')));
                setSaving(false);
                return;
            }

            if (editingId) {
                setItems((prev) => prev.map((item) => (item.id === editingId ? data : item)));
                setMessage(t('news.updated'));
                void toastSuccess(t('news.updated'));
            } else {
                setItems((prev) => [data, ...prev]);
                setMessage(t('news.created'));
                void toastSuccess(t('news.created'));
            }

            resetForm();
            setShowModal(false);
        } catch (submitError) {
            console.error(submitError);
            setError(t('common.unexpectedError'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('news.title')}</h3>
                    <p className="text-xs text-gray-500">{t('news.count', { count: items.length })}</p>
                </div>
                <RequirePermission resource="news" action="POST">
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                        <span className="text-lg">＋</span>
                        <span>{t('news.add')}</span>
                    </button>
                </RequirePermission>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">{t('news.loading')}</p>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                        {t('news.empty')}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => {
                            const authorName = locale === 'ar'
                                ? item.authorName || item.authorNameEn
                                : item.authorNameEn || item.authorName;

                            return (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-emerald-200"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-lg font-bold uppercase text-emerald-700">
                                    {item.category?.slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="mb-1 text-sm text-gray-500">
                                        {formatDate(item.publishedAt || item.createdAt || '')}
                                        {authorName ? ` · ${authorName}` : ''}
                                    </p>
                                    <h4 className="text-base font-semibold text-gray-900">
                                        {pickLocalizedText(item.title) || t('common.untitled')}
                                    </h4>
                                    <p className="line-clamp-2 text-xs text-gray-600">
                                        {pickLocalizedText(item.summary) || ''}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <span className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-0.5">
                                            {formatNewsCategory(item.category)}
                                        </span>
                                        <span
                                            className={`rounded-lg border px-2 py-0.5 ${
                                                item.isPublished
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            {item.isPublished ? t('common.published') : t('common.draft')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <RequirePermission resource="news" action="PATCH">
                                        <button
                                            type="button"
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            title={t('common.edit')}
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
                                    </RequirePermission>
                                    <RequirePermission resource="news" action="DELETE">
                                        <button
                                            type="button"
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 font-bold text-red-700 hover:bg-red-100"
                                            title={t('common.delete')}
                                            onClick={async () => {
                                                const result = await Swal.fire({
                                                    title: t('news.deleteConfirm'),
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    cancelButtonColor: '#3085d6',
                                                    confirmButtonText: t('common.yesDelete'),
                                                    cancelButtonText: t('common.cancel'),
                                                    reverseButtons: locale === 'ar',
                                                });
                                                if (!result.isConfirmed) return;
                                                const res = await fetch(`/api/admin/news?id=${item.id}`, { method: 'DELETE' });
                                                const data = await res.json().catch(() => null);
                                                if (res.ok) {
                                                    setItems((prev) => prev.filter((current) => current.id !== item.id));
                                                } else {
                                                    setError(translateApiError(data?.error || t('news.deleteError')));
                                                }
                                            }}
                                        >
                                            ×
                                        </button>
                                    </RequirePermission>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
                    <div className="mt-[10vh] mb-[10vh] max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingId ? t('news.editTitle') : t('news.addTitle')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                aria-label={t('common.close')}
                            >
                                ×
                            </button>
                        </div>
                        <form className="space-y-3 p-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.titleAr')}
                                    value={form.titleAr}
                                    onChange={(e) => handleChange('titleAr', e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.titleEn')}
                                    value={form.titleEn}
                                    onChange={(e) => handleChange('titleEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.summaryAr')}
                                    rows={2}
                                    value={form.summaryAr}
                                    onChange={(e) => handleChange('summaryAr', e.target.value)}
                                    required
                                />
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.summaryEn')}
                                    rows={2}
                                    value={form.summaryEn}
                                    onChange={(e) => handleChange('summaryEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.bodyAr')}
                                    rows={3}
                                    value={form.bodyAr}
                                    onChange={(e) => handleChange('bodyAr', e.target.value)}
                                />
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder={t('news.bodyEn')}
                                    rows={3}
                                    value={form.bodyEn}
                                    onChange={(e) => handleChange('bodyEn', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <ImagePicker
                                    label={t('news.image')}
                                    value={form.imageUrl}
                                    onChange={(url) => handleChange('imageUrl', url)}
                                    placeholder={t('news.imageUrl')}
                                />
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                                        {t('news.videoUrl')} ({t('common.optional')})
                                    </label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder={`${t('news.videoUrl')} (${t('common.optional')})`}
                                        value={form.videoUrl}
                                        onChange={(e) => handleChange('videoUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">{t('news.authorName')}</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder={t('news.authorName')}
                                        value={form.authorName}
                                        onChange={(e) => handleChange('authorName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">{t('news.authorNameEn')}</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder={t('news.authorNameEn')}
                                        value={form.authorNameEn}
                                        onChange={(e) => handleChange('authorNameEn', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">{t('news.publishDate')}</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={form.publishedAt}
                                        onChange={(e) => handleChange('publishedAt', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">{t('news.category')}</label>
                                <select
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.category}
                                    onChange={(e) => handleChange('category', e.target.value as NewsCategoryKey)}
                                >
                                    {categoryOptions.map(([key, category]) => (
                                        <option key={key} value={key}>
                                            {category.icon} {formatNewsCategory(key)}
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
                                    {t('news.publishNow')}
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
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {saving ? t('common.saving') : editingId ? t('news.update') : t('news.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
