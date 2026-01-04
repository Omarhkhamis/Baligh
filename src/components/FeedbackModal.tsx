'use client';

import React, { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalText: string;
    aiClassification: string;
    aiRiskLevel: string;
    severityScore: number;
}

export default function FeedbackModal({
    isOpen,
    onClose,
    originalText,
    aiClassification,
    aiRiskLevel,
    severityScore
}: FeedbackModalProps) {
    const [userCorrection, setUserCorrection] = useState<string>('');
    const [userReasoning, setUserReasoning] = useState<string>('');
    const [additionalContext, setAdditionalContext] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'Hate Speech': return 'خطاب كراهية';
            case 'Incitement to Violence': return 'تحريض على العنف';
            case 'Harassment': return 'تحرش';
            case 'Not Hate Speech': return 'ليس خطاب كراهية';
            default: return 'ليس خطاب كراهية';
        }
    };
    const feedbackOptions = [
        {
            value: 'Hate Speech',
            label: 'خطاب كراهية',
            activeClass: 'border-red-500 bg-red-50',
            idleClass: 'border-gray-300 hover:border-red-300'
        },
        {
            value: 'Incitement to Violence',
            label: 'تحريض على العنف',
            activeClass: 'border-orange-500 bg-orange-50',
            idleClass: 'border-gray-300 hover:border-orange-300'
        },
        {
            value: 'Harassment',
            label: 'تحرش',
            activeClass: 'border-amber-500 bg-amber-50',
            idleClass: 'border-gray-300 hover:border-amber-300'
        },
        {
            value: 'Not Hate Speech',
            label: 'ليس خطاب كراهية',
            activeClass: 'border-green-500 bg-green-50',
            idleClass: 'border-gray-300 hover:border-green-300'
        }
    ];

    const handleSubmit = async () => {
        // Validation
        if (!userCorrection) {
            setError('الرجاء اختيار التصنيف الصحيح');
            return;
        }
        if (!userReasoning.trim()) {
            setError('الرجاء شرح سبب اختيارك');
            return;
        }
        if (userReasoning.trim().length < 10) {
            setError('الرجاء كتابة شرح أكثر تفصيلاً (10 أحرف على الأقل)');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/user-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText,
                    aiClassification,
                    aiRiskLevel,
                    severityScore,
                    userCorrection,
                    userReasoning: userReasoning.trim(),
                    additionalContext: additionalContext.trim() || undefined,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('شكراً لك! تم إرسال ملاحظتك بنجاح. ستساعدنا في تحسين دقة النظام.');
                // Reset form
                setUserCorrection('');
                setUserReasoning('');
                setAdditionalContext('');
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'حدث خطأ أثناء إرسال الملاحظة');
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" dir="rtl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold">ساعدنا في التحسين</h3>
                            <p className="text-blue-100 text-sm mt-1">ملاحظاتك تساهم في تطوير النظام</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                            disabled={isSubmitting}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* User Correction Form */}
                    <div>
                        <label className="block text-base font-bold text-gray-900 mb-3">
                            ما هو التصنيف الصحيح برأيك؟ *
                        </label>
                        <div className="space-y-3">
                            {feedbackOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${userCorrection === option.value
                                        ? option.activeClass
                                        : option.idleClass
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="correction"
                                        value={option.value}
                                        checked={userCorrection === option.value}
                                        onChange={(e) => setUserCorrection(e.target.value)}
                                        className="w-5 h-5 text-gray-700"
                                        disabled={isSubmitting}
                                    />
                                    <span className="mr-3 font-medium text-gray-900">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* User Reasoning */}
                    <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                            لماذا تعتقد أن هذا التصنيف صحيح؟ *
                        </label>
                        <textarea
                            value={userReasoning}
                            onChange={(e) => setUserReasoning(e.target.value)}
                            placeholder="مثال: النص يحتوي على تهديد مباشر وليس مجرد انتقاد عام..."
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px] resize-y"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            الرجاء تقديم شرح مفصل ليساعدنا في فهم وجهة نظرك (10 أحرف على الأقل)
                        </p>
                    </div>

                    {/* Additional Context (Optional) */}
                    <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                            هل هناك سياق إضافي؟ (اختياري)
                        </label>
                        <textarea
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            placeholder="أي معلومات إضافية قد تساعد في فهم السياق بشكل أفضل..."
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[80px] resize-y"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري الإرسال...
                                </span>
                            ) : (
                                'إرسال الملاحظة ✓'
                            )}
                        </button>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-900">
                                <p className="font-bold mb-1">ملاحظة حول الخصوصية:</p>
                                <p>جميع الملاحظات مجهولة تماماً ولا يتم تخزين أي معلومات شخصية. نستخدم ملاحظاتك فقط لتحسين دقة النظام.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
