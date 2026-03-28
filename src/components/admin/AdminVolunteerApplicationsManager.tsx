'use client';

import { useEffect, useState } from 'react';
import { useAdminI18n } from './AdminI18n';
import { RequirePermission, usePermissions } from './AdminPermissions';

type VolunteerApplicationItem = {
    id: string;
    locale?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    volunteerArea: string;
    background: string;
    weeklyHours: string;
    motivation: string;
    createdAt: string;
    updatedAt: string;
};

export function AdminVolunteerApplicationsManager() {
    const { can } = usePermissions();
    const { t, formatDateTime, translateApiError, formatVolunteerArea, formatVolunteerHours } = useAdminI18n();
    const [items, setItems] = useState<VolunteerApplicationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<VolunteerApplicationItem | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/admin/volunteer', { credentials: 'include' });
                const data = await response.json().catch(() => null);

                if (!response.ok || !Array.isArray(data)) {
                    setItems([]);
                    setError(translateApiError(data?.error || t('errors.loadVolunteerForms')));
                    return;
                }

                setItems(data as VolunteerApplicationItem[]);
            } catch (loadError) {
                console.error(loadError);
                setError(t('errors.loadVolunteerForms'));
            } finally {
                setLoading(false);
            }
        }

        if (can('volunteer', 'GET')) {
            void load();
        }
    }, [can, t, translateApiError]);

    useEffect(() => {
        if (selected && !items.some((item) => item.id === selected.id)) {
            setSelected(null);
        }
    }, [items, selected]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('volunteerForms.title')}</h3>
                    <p className="text-xs text-gray-500">{t('volunteerForms.count', { count: items.length })}</p>
                </div>
                <RequirePermission resource="volunteer" action="GET">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {t('volunteerForms.detailsSubtitle')}
                    </span>
                </RequirePermission>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                {loading ? (
                    <p className="text-sm text-gray-500">{t('volunteerForms.loading')}</p>
                ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                        {t('volunteerForms.empty')}
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelected(item)}
                                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-start transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="text-base font-bold text-gray-900">{item.name}</h4>
                                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                        {formatDateTime(item.createdAt)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{item.email}</p>
                                <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                                        <p>{t('volunteerForms.volunteerArea')}</p>
                                        <p className="mt-1 font-semibold text-gray-900">{formatVolunteerArea(item.volunteerArea)}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                                        <p>{t('volunteerForms.weeklyHours')}</p>
                                        <p className="mt-1 font-semibold text-gray-900">{formatVolunteerHours(item.weeklyHours)}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        {t('volunteerForms.openDetails')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        className="absolute inset-0"
                        onClick={() => setSelected(null)}
                    />
                    <div className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{t('volunteerForms.detailsTitle')}</h3>
                                <p className="text-sm text-gray-500">{t('volunteerForms.detailsSubtitle')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                aria-label={t('common.close')}
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="grid gap-3 md:grid-cols-2">
                                <FieldCard label={t('volunteerForms.applicantName')} value={selected.name} />
                                <FieldCard label={t('volunteerForms.submittedAt')} value={formatDateTime(selected.createdAt)} />
                                <FieldCard label={t('volunteerForms.applicantEmail')} value={selected.email} />
                                <FieldCard label={t('volunteerForms.applicantPhone')} value={selected.phone || t('volunteerForms.noPhone')} />
                                <FieldCard label={t('volunteerForms.volunteerArea')} value={formatVolunteerArea(selected.volunteerArea)} />
                                <FieldCard label={t('volunteerForms.weeklyHours')} value={formatVolunteerHours(selected.weeklyHours)} />
                            </div>

                            <LargeFieldCard label={t('volunteerForms.background')} value={selected.background} />
                            <LargeFieldCard label={t('volunteerForms.motivation')} value={selected.motivation} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</p>
        </div>
    );
}

function LargeFieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-900">{value}</p>
        </div>
    );
}
