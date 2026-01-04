'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { ImagePicker } from './ImagePicker';

type TeamMember = {
    id: string;
    name: Record<string, string>;
    role: Record<string, string>;
    bio: string | null;
    imageUrl: string | null;
    sortOrder: number;
};

type FormState = {
    nameAr: string;
    nameEn: string;
    roleAr: string;
    roleEn: string;
    bio: string;
    imageUrl: string;
    sortOrder: number;
};

const defaultForm: FormState = {
    nameAr: '',
    nameEn: '',
    roleAr: '',
    roleEn: '',
    bio: '',
    imageUrl: '',
    sortOrder: 0,
};

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (key: keyof FormState, value: string | number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setSaving(true);

        try {
            const res = await fetch('/api/admin/team', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, id: editingId }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'تعذر حفظ البيانات');
                setSaving(false);
                return;
            }

            if (editingId) {
                setMembers((prev) => prev.map((m) => (m.id === editingId ? data : m)).sort((a, b) => a.sortOrder - b.sortOrder));
                setMessage('Updated successfully');
            } else {
                setMembers((prev) => [...prev, data].sort((a, b) => a.sortOrder - b.sortOrder));
                setMessage('Created successfully');
            }
            setEditingId(null);
            setForm(defaultForm);
            setShowModal(false);
        } catch (err) {
            console.error(err);
            setError('Unexpected error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                    <p className="text-xs text-gray-500">{members.length} members</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingId(null);
                        setForm(defaultForm);
                        setMessage(null);
                        setError(null);
                        setShowModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700"
                >
                    <span className="text-lg">＋</span>
                    <span>Add member</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-3">
                                <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg">
                                    {member.name?.ar?.slice(0, 2) || '??'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">{member.name?.ar || 'بدون اسم'}</p>
                                    <span className="text-xs text-gray-400">#{member.sortOrder}</span>
                                </div>
                                    <p className="text-sm text-gray-600">{member.role?.ar || ''}</p>
                                    {member.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(member.id);
                                    setForm({
                                        nameAr: (member.name as any)?.ar || '',
                                        nameEn: (member.name as any)?.en || '',
                                        roleAr: (member.role as any)?.ar || '',
                                        roleEn: (member.role as any)?.en || '',
                                        bio: member.bio || '',
                                        imageUrl: member.imageUrl || '',
                                        sortOrder: member.sortOrder || 0,
                                    });
                                    setMessage(null);
                                    setError(null);
                                    setShowModal(true);
                                }}
                                        className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Delete this member?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#3085d6',
                                                confirmButtonText: 'Yes, delete',
                                            });
                                            if (!result.isConfirmed) return;
                                            const res = await fetch(`/api/admin/team?id=${member.id}`, { method: 'DELETE' });
                                            if (res.ok) {
                                                setMembers((prev) => prev.filter((m) => m.id !== member.id));
                                            }
                                        }}
                                        className="w-9 h-9 rounded-full bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 flex items-center justify-center font-bold"
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    {members.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-6">
                            No members yet. Add the first member to show on the About page.
                        </div>
                    )}
                </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
                    <div className="mt-[10vh] mb-[10vh] w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                    setForm(defaultForm);
                                    setMessage(null);
                                    setError(null);
                                }}
                                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <form className="p-6 space-y-3" onSubmit={handleSubmit}>
                            <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Name (Arabic) *"
                                value={form.nameAr}
                                onChange={(e) => handleChange('nameAr', e.target.value)}
                                required
                            />
                            <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Name (English)"
                                value={form.nameEn}
                                onChange={(e) => handleChange('nameEn', e.target.value)}
                            />
                            <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Role (Arabic) *"
                                value={form.roleAr}
                                onChange={(e) => handleChange('roleAr', e.target.value)}
                                required
                            />
                            <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Role (English)"
                                value={form.roleEn}
                                onChange={(e) => handleChange('roleEn', e.target.value)}
                            />
                            <ImagePicker
                                label="Image"
                                value={form.imageUrl}
                                onChange={(url) => handleChange('imageUrl', url)}
                                placeholder="Image URL"
                            />
                            <textarea
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Short bio"
                                rows={3}
                                value={form.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                            />
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Sort order (smaller shows first)"
                                value={form.sortOrder}
                                onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
                            />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {message && <p className="text-sm text-emerald-600">{message}</p>}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                        setForm(defaultForm);
                                        setMessage(null);
                                        setError(null);
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
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
