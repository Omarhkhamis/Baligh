'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface AnalysisFormProps {
    onAnalyze: (data: { text: string; image: string | null }) => void;
    isAnalyzing: boolean;
}

export default function AnalysisForm({ onAnalyze, isAnalyzing }: AnalysisFormProps) {
    const t = useTranslations('home');
    const [text, setText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle clipboard paste for images
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                    }
                    break;
                }
            }
        };

        // Add listener to the document so paste works from anywhere on the page
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() || image) {
            onAnalyze({ text, image });
        }
    };

    return (
        <div className="min-h-[70vh] md:min-h-[85vh] flex items-center justify-center px-4">
            <div className="w-full max-w-3xl mx-auto">
                {/* Hero Section - Ultra Clean & Centered */}
                <div className="text-center mb-8 md:mb-16">
                    {/* Main Heading - Maximum prominence with green accent */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                            {t('hero.title')}
                        </h1>
                        {/* Green accent line */}
                        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto rounded-full"></div>
                    </div>

                    {/* Subtitle - Enhanced readability */}
                    <p className="text-base md:text-xl lg:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>

                {/* Analysis Form - Floating with subtle shadow */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={t('form.placeholder')}
                            className={`w-full h-48 md:h-72 p-4 md:p-8 text-base md:text-lg border-2 rounded-2xl resize-none bg-white text-gray-900 placeholder-gray-400 transition-all duration-300 ease-out ${isFocused
                                ? 'border-green-500 shadow-2xl shadow-green-100 scale-[1.01]'
                                : 'border-gray-200 shadow-xl hover:border-gray-300 hover:shadow-2xl'
                                }`}
                            dir="rtl"
                            style={{
                                boxShadow: isFocused
                                    ? '0 20px 60px -15px rgba(34, 197, 94, 0.2), 0 0 0 4px rgba(34, 197, 94, 0.05)'
                                    : '0 10px 40px -10px rgba(0, 0, 0, 0.1)'
                            }}
                        />

                        {/* Image Preview */}
                        {image && (
                            <div className="absolute top-4 left-4 z-10">
                                <div className="relative group">
                                    <Image
                                        src={image}
                                        alt="Uploaded"
                                        width={80}
                                        height={80}
                                        className="h-20 w-20 object-cover rounded-lg border-2 border-green-500 shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Image Upload Button */}
                        <div className="absolute bottom-6 left-6 flex items-center gap-4">
                            <label className="cursor-pointer group flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-green-50 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium hidden md:inline-block">{t('form.uploadImage')}</span>
                            </label>
                            <div className="text-sm text-gray-400 font-medium border-l border-gray-200 pl-4">
                                {t('form.charCount', { count: text.length })}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || (!text.trim() && !image)}
                        className={`w-full py-6 text-white text-xl font-bold rounded-2xl transition-all duration-300 ${(text.trim() || image) && !isAnalyzing
                            ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('form.analyzingButton')}
                            </span>
                        ) : (
                            t('form.submitButton')
                        )}
                    </button>
                </form>

                {/* Trust Indicators - Elegant inline badges */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-3 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            {t('trustIndicators.ai')}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            {t('trustIndicators.review')}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('trustIndicators.methodology')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
