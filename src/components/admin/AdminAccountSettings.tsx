'use client';

import { useEffect, useState } from 'react';
import { toastSuccess } from './toast';

type AdminInfo = {
    id: string;
    email: string;
    name: string | null;
    updatedAt?: string;
};

export function AdminAccountSettings() {
    const [info, setInfo] = useState<AdminInfo | null>(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/account');
                if (!res.ok) throw new Error('failed');
                const data = await res.json();
                setInfo(data);
                setEmail(data.email || '');
                setName(data.name || '');
            } catch {
                setError('تعذر تحميل بيانات الحساب');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

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
                    email: email || undefined,
                    name: name || undefined,
                    password: password || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'تعذر الحفظ');
                setSaving(false);
                return;
            }
            setInfo(data);
            setMessage('تم تحديث الحساب بنجاح');
            void toastSuccess('تم تحديث الحساب بنجاح');
            if (password) setPassword('');
        } catch {
            setError('خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Admin account</h3>
                    <p className="text-xs text-gray-500">Update the email and password used to sign in</p>
                </div>
                {info?.updatedAt && (
                    <span className="text-xs text-gray-400">
                        Last update: {new Date(info.updatedAt).toLocaleString('en-US')}
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Loading account...</p>
            ) : (
                <form className="space-y-3" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Admin name (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="admin@admin.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Leave blank to keep current password"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {message && <p className="text-sm text-emerald-600">{message}</p>}

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            )}
        </div>
    );
}
