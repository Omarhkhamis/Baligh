'use client';

import { useEffect, useState } from 'react';
import { type AdminRole } from '@/lib/permissions';
import { useAdminI18n } from './AdminI18n';
import { toastSuccess } from './toast';

type AdminInfo = {
    id: string;
    email: string;
    name: string | null;
    role: AdminRole;
    createdAt?: string;
    updatedAt?: string;
};

type AccountResponse = AdminInfo & {
    adminUsers?: AdminInfo[];
};

const roleOptions: AdminRole[] = ['SUPER_ADMIN', 'ANALYST', 'EDITOR', 'VIEWER'];

export function AdminAccountSettings() {
    const { t, formatRole, formatDateTime, formatDate, translateApiError } = useAdminI18n();
    const [info, setInfo] = useState<AdminInfo | null>(null);
    const [adminUsers, setAdminUsers] = useState<AdminInfo[]>([]);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createRole, setCreateRole] = useState<AdminRole>('EDITOR');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [createMessage, setCreateMessage] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/account');
                if (!res.ok) throw new Error('failed');
                const data: AccountResponse = await res.json();
                setInfo(data);
                setEmail(data.email || '');
                setName(data.name || '');
                setAdminUsers(data.adminUsers || []);
            } catch {
                setError(t('errors.loadAccount'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [t]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    password: password || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(translateApiError(data.error || t('errors.saveFailed')));
                setSaving(false);
                return;
            }
            setInfo(data);
            setAdminUsers((currentUsers) =>
                currentUsers.map((user) => (user.id === data.id ? { ...user, ...data } : user))
            );
            setMessage(t('account.updated'));
            void toastSuccess(t('account.updated'));
            if (password) setPassword('');
        } catch {
            setError(t('common.unexpectedError'));
        } finally {
            setSaving(false);
        }
    };

    const onCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);
        setCreateMessage(null);

        try {
            const res = await fetch('/api/admin/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: createName,
                    email: createEmail,
                    password: createPassword,
                    role: createRole,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setCreateError(translateApiError(data.error || t('errors.createFailed')));
                return;
            }

            setAdminUsers(data.adminUsers || []);
            setCreateName('');
            setCreateEmail('');
            setCreatePassword('');
            setCreateRole('EDITOR');
            setCreateMessage(t('account.createSuccess'));
            void toastSuccess(t('account.createSuccess'));
        } catch {
            setCreateError(t('common.unexpectedError'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('account.title')}</h3>
                        <p className="text-xs text-gray-500">{t('account.subtitle')}</p>
                        {info?.role && (
                            <p className="text-xs text-emerald-700 mt-1">{t('account.role')}: {formatRole(info.role)}</p>
                        )}
                    </div>
                    {info?.updatedAt && (
                        <span className="text-xs text-gray-400">
                            {t('account.lastUpdate')}: {formatDateTime(info.updatedAt)}
                        </span>
                    )}
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">{t('account.loading')}</p>
                ) : (
                    <form className="space-y-3" onSubmit={onSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.name')}</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={t('account.namePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="admin@admin.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={t('account.passwordPlaceholder')}
                            />
                            <p className="text-xs text-gray-400 mt-1">{t('account.passwordHint')}</p>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {message && <p className="text-sm text-emerald-600">{message}</p>}

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                            {saving ? t('common.saving') : t('common.saveChanges')}
                        </button>
                    </form>
                )}
            </div>

            {info?.role === 'SUPER_ADMIN' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('account.adminUsersTitle')}</h3>
                        <p className="text-xs text-gray-500">{t('account.adminUsersSubtitle')}</p>
                    </div>

                    <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreateSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.name')}</label>
                            <input
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={t('common.optional')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.createRole')}</label>
                            <select
                                value={createRole}
                                onChange={(e) => setCreateRole(e.target.value as AdminRole)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {roleOptions.map((role) => (
                                    <option key={role} value={role}>
                                        {formatRole(role)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.email')}</label>
                            <input
                                type="email"
                                value={createEmail}
                                onChange={(e) => setCreateEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={t('account.createEmailPlaceholder')}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('account.password')}</label>
                            <input
                                type="password"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={t('account.createPasswordPlaceholder')}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            {createError && <p className="text-sm text-red-600">{createError}</p>}
                            {createMessage && <p className="text-sm text-emerald-600">{createMessage}</p>}

                            <button
                                type="submit"
                                disabled={creating}
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                            >
                                {creating ? t('common.creating') : t('account.createUser')}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">{t('account.currentAdmins')}</h4>
                            <span className="text-xs text-gray-500">{t('account.usersCount', { count: adminUsers.length })}</span>
                        </div>

                        <div className="space-y-2">
                            {adminUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user.name || t('common.unnamedAdmin')}
                                            </p>
                                            {info.id === user.id && (
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                    {t('common.you')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                    </div>

                                    <div className="text-right">
                                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            {formatRole(user.role)}
                                        </span>
                                        {user.createdAt && (
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {t('account.createdOn', { date: formatDate(user.createdAt) })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
