'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '../../../components/AppHeader';
import ResultsDisplay from '../../../components/ResultsDisplay';
import { Suspense } from 'react';

import { useTranslations } from 'next-intl';

function MonitoringContent() {
    const t = useTranslations('monitoring');
    const searchParams = useSearchParams();
    const resultData = searchParams.get('result');

    let result = null;
    let isError = false;
    let errorMessage = '';

    if (resultData) {
        const tryParsers = [
            () => JSON.parse(resultData),
            () => JSON.parse(decodeURIComponent(resultData)),
        ];
        let parsed: any = null;
        for (const fn of tryParsers) {
            try {
                parsed = fn();
                break;
            } catch {
                parsed = null;
            }
        }

        if (parsed) {
            if (parsed.error) {
                isError = true;
                errorMessage = parsed.error;
            } else {
                const classification = parsed.classification || parsed.label || parsed.category;
                const violation_type = parsed.violation_type || parsed.violationType;
                const risk_level =
                    parsed.risk_level || parsed.riskLevel || parsed.risk || violation_type;
                const reasoning_ar = parsed.reasoning_ar || parsed.reasoning || parsed.rationale || parsed.rationale_arabic || 'لم يقدم النموذج تفسيراً.';
                const normalized = {
                    ...parsed, // keep raw fields for debugging if needed
                    classification,
                    risk_level,
                    violation_type,
                    speech_type: parsed.speech_type,
                    target_group: parsed.target_group,
                    detected_markers: parsed.detected_markers || parsed.markers || [],
                    reasoning_ar,
                    image_description: parsed.image_description || '',
                    severity_score: parsed.severity_score ?? parsed.severityScore ?? parsed.score,
                    text: parsed.text || parsed.inputText || parsed.input || parsed.originalText || '',
                };
                if (!normalized.classification || !normalized.risk_level) {
                    isError = true;
                    errorMessage = 'لم يتم استلام نتيجة صحيحة من النموذج';
                } else {
                    result = normalized;
                }
            }
        } else {
            isError = true;
            errorMessage = 'خطأ في تحليل البيانات';
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AppHeader />
            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                        {t('title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {isError ? (
                    /* Error State */
                    <div className="text-center py-20">
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 max-w-2xl mx-auto">
                            <svg className="w-24 h-24 mx-auto text-red-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-red-700 mb-4">⚠️ خطأ في النموذج</h2>
                            <p className="text-red-600 mb-6 text-lg">هنالك خطأ في النموذج، يرجى المحاولة لاحقاً</p>
                            <p className="text-gray-600 mb-8">
                                قد يكون هذا بسبب ضغط على الخدمة. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.
                            </p>
                            <Link href="/analyze" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <span>🔄</span>
                                <span>إعادة المحاولة</span>
                            </Link>
                        </div>
                    </div>
                ) : result ? (
                    <ResultsDisplay result={result} />
                ) : (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('noResultsTitle')}</h2>
                        <p className="text-gray-500 mb-6">{t('noResultsDesc')}</p>
                        <Link href="/" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <span>🔍</span>
                            <span>{t('analyzeButton')}</span>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function MonitoringPage() {
    return (
        <Suspense fallback={<div>جاري التحميل...</div>}>
            <MonitoringContent />
        </Suspense>
    );
}
