'use client';

import { useEffect, useRef, useState } from 'react';

type UploadEntry = {
    name: string;
    url: string;
    size?: number;
    modified?: string;
};

type Props = {
    label: string;
    value?: string | null;
    onChange: (url: string) => void;
    placeholder?: string;
};

export function ImagePicker({ label, value, onChange, placeholder }: Props) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<UploadEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadImages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/uploads');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load uploads', e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!window.confirm('حذف هذه الصورة نهائياً؟')) return;
        setDeleting(name);
        try {
            const deletedUrl = items.find((item) => item.name === name)?.url || `/uploads/${name}`;
            const res = await fetch(`/api/uploads?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setItems((prev) => prev.filter((i) => i.name !== name));
            if (isPdf(name)) {
                window.dispatchEvent(new CustomEvent('upload:pdf-deleted', { detail: { url: deletedUrl, name } }));
            }
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        if (open) {
            loadImages();
        }
    }, [open]);

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
                setItems((prev) => [{ name: data.name, url: data.url }, ...prev]);
                setOpen(false);
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={value || ''}
                    placeholder={placeholder || 'Image URL'}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Library
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">Image Library</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={loadImages}
                                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    onClick={triggerUpload}
                                    className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload image'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        {loading ? (
                            <p className="text-sm text-gray-500">Loading...</p>
                        ) : items.length === 0 ? (
                            <p className="text-sm text-gray-500">No images uploaded yet.</p>
                        ) : (
                            <div className="max-h-96 overflow-y-auto space-y-5">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Images</p>
                                    {items.filter((item) => !isPdf(item.name)).length === 0 ? (
                                        <p className="text-sm text-gray-500">No images uploaded yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {items.filter((item) => !isPdf(item.name)).map((item) => (
                                                <div
                                                    key={item.url}
                                                    className="relative border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onChange(item.url);
                                                            setOpen(false);
                                                        }}
                                                        className="w-full text-left"
                                                    >
                                                        <div
                                                            className="h-28 w-full bg-gray-100 bg-cover bg-center"
                                                            style={{ backgroundImage: `url(${item.url})` }}
                                                        ></div>
                                                        <div className="px-2 py-1">
                                                            <p className="text-xs text-gray-700 line-clamp-1">{item.name}</p>
                                                        </div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.name);
                                                        }}
                                                        className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/90 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs shadow-sm"
                                                        disabled={deleting === item.name}
                                                        title="حذف الصورة"
                                                    >
                                                        {deleting === item.name ? '…' : '×'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">PDF Files</p>
                                    {items.filter((item) => isPdf(item.name)).length === 0 ? (
                                        <p className="text-sm text-gray-500">No PDF files uploaded yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {items.filter((item) => isPdf(item.name)).map((item) => (
                                                <div
                                                    key={item.url}
                                                    className="relative flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 hover:border-emerald-300"
                                                >
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-700"
                                                    >
                                                        <span className="text-base">📄</span>
                                                        <span className="line-clamp-1">{item.name}</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.name)}
                                                        className="h-7 w-7 rounded-full bg-white/90 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs shadow-sm"
                                                        disabled={deleting === item.name}
                                                        title="حذف الملف"
                                                    >
                                                        {deleting === item.name ? '…' : '×'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
