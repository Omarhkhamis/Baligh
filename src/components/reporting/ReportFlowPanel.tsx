'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ResultsDisplay from '@/components/ResultsDisplay';
import { normalizeReportPostLink } from '@/lib/report-post-link';
import type { AnalysisResult } from '@/lib/report-generator';
import { getCanonicalTargetGroupLabelsFromKeys, TARGET_GROUP_KEYS, type TargetGroupKey } from '@/lib/target-groups';

type FlowVariant = 'modal' | 'page';

type ReportFlowPanelProps = {
    variant?: FlowVariant;
    onClose?: () => void;
};

type SubmissionState = {
    result: AnalysisResult;
    reportNumber: string;
};

const targetGroupOptions = TARGET_GROUP_KEYS;

type FormState = {
    platform: string;
    postLink: string;
    postText: string;
    targetGroups: TargetGroupKey[];
    immediateDanger: string;
};

const initialFormState: FormState = {
    platform: '',
    postLink: '',
    postText: '',
    targetGroups: [],
    immediateDanger: '',
};

const dangerOptions = ['yes', 'no', 'unknown'] as const;
const platformOptions = ['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other'] as const;
const MAX_ATTACHED_FILES = 3;
const MAX_ATTACHED_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT = 'image/*,.pdf';
const IMAGE_FILE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);
const PDF_FILE_EXTENSION = '.pdf';
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']);
const PDF_MIME_TYPES = new Set(['application/pdf']);

function getFileExtension(fileName: string) {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
}

function isImageEvidenceFile(file: File) {
    return file.type.startsWith('image/') || IMAGE_MIME_TYPES.has(file.type) || IMAGE_FILE_EXTENSIONS.has(getFileExtension(file.name));
}

function isPdfEvidenceFile(file: File) {
    return PDF_MIME_TYPES.has(file.type) || getFileExtension(file.name) === PDF_FILE_EXTENSION;
}

function isSupportedEvidenceFile(file: File) {
    return isImageEvidenceFile(file) || isPdfEvidenceFile(file);
}

function formatFileSize(sizeInBytes: number) {
    if (sizeInBytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
    }

    const sizeInMb = sizeInBytes / (1024 * 1024);
    return `${sizeInMb >= 10 ? sizeInMb.toFixed(0) : sizeInMb.toFixed(1)} MB`;
}

export function ReportFlowPanel({ variant = 'modal', onClose }: ReportFlowPanelProps) {
    const locale = useLocale();
    const tHeader = useTranslations('header.brand');
    const t = useTranslations('reportFlow');
    const [form, setForm] = useState<FormState>(initialFormState);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedFilePreviewUrls, setAttachedFilePreviewUrls] = useState<Array<string | null>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submission, setSubmission] = useState<SubmissionState | null>(null);
    const isModal = variant === 'modal';
    const contentDir = locale === 'ar' ? 'rtl' : 'ltr';

    const isResultStep = Boolean(submission);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    useEffect(() => {
        if (attachedFiles.length === 0) {
            setAttachedFilePreviewUrls([]);
            return;
        }

        const objectUrls = attachedFiles.map((file) => (
            isImageEvidenceFile(file) ? URL.createObjectURL(file) : null
        ));
        setAttachedFilePreviewUrls(objectUrls);

        return () => {
            objectUrls.forEach((objectUrl) => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                }
            });
        };
    }, [attachedFiles]);

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';

        if (files.length === 0) {
            return;
        }

        if (attachedFiles.length + files.length > MAX_ATTACHED_FILES) {
            setError(t('form.imageLimitExceeded', { count: MAX_ATTACHED_FILES }));
            return;
        }

        if (files.some((file) => !isSupportedEvidenceFile(file))) {
            setError(t('form.imageInvalid'));
            return;
        }

        if (files.some((file) => file.size > MAX_ATTACHED_FILE_SIZE_BYTES)) {
            setError(t('form.imageTooLarge', { size: 5 }));
            return;
        }

        setError(null);
        setAttachedFiles((current) => [...current, ...files]);
    };

    const removeAttachedFile = (index: number) => {
        setAttachedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    };

    const resetFlow = () => {
        setForm(initialFormState);
        setAttachedFiles([]);
        setError(null);
        setSubmission(null);
    };

    const validateForm = () => {
        if (!form.platform) {
            return t('form.validationPlatform');
        }

        if (!form.postLink.trim()) {
            return t('form.validationPostUrl');
        }

        if (!normalizeReportPostLink(form.postLink)) {
            return t('form.validationPostUrlInvalid');
        }

        if (!form.postText.trim()) {
            return t('form.validationPostText');
        }

        if (!form.immediateDanger) {
            return t('form.validationRisk');
        }

        return null;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = new FormData();
            const trimmedPostLink = normalizeReportPostLink(form.postLink);
            const trimmedPostText = form.postText.trim();
            const selectedTargetGroupKeys = form.targetGroups;
            const selectedTargetGroupLabels = getCanonicalTargetGroupLabelsFromKeys(selectedTargetGroupKeys);

            payload.append('locale', locale);
            payload.append('platform', form.platform);
            payload.append('platform_label', t(`form.platforms.${form.platform}`));
            payload.append('post_link', trimmedPostLink);
            if (trimmedPostText) {
                payload.append('text', trimmedPostText);
            }
            if (selectedTargetGroupLabels[0]) {
                payload.append('target_group', selectedTargetGroupLabels[0]);
            }
            if (selectedTargetGroupKeys.length > 0) {
                payload.append('target_groups', JSON.stringify(selectedTargetGroupKeys));
                payload.append('target_group_labels', JSON.stringify(selectedTargetGroupLabels));
            }
            payload.append('immediate_danger', form.immediateDanger);
            payload.append('immediate_danger_label', t(`form.dangerOptions.${form.immediateDanger}`));
            attachedFiles.forEach((attachedFile) => {
                payload.append('images', attachedFile);
            });

            const response = await fetch('/api/reports/submit', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();

            if (!response.ok || !data?.success || !data?.result || !data?.reportNumber) {
                throw new Error(data?.error || t('form.submitError'));
            }

            setSubmission({
                result: data.result as AnalysisResult,
                reportNumber: data.reportNumber as string,
            });
        } catch (submissionError) {
            console.error('Report submission failed:', submissionError);
            setError(
                submissionError instanceof Error
                    ? submissionError.message
                    : t('form.submitError')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerClassName = variant === 'modal'
        ? 'relative mx-auto w-full max-w-[481px]'
        : 'w-full max-w-[860px] mx-auto';

    return (
        <div className={containerClassName}>
            <div className={`overflow-hidden rounded-[34px] border border-stone-200 bg-[#fcfbf7] shadow-[0_40px_120px_-50px_rgba(15,23,42,0.45)] ${isModal ? 'max-h-[90vh] flex flex-col' : ''}`}>
                <div className={`bg-[#1f7a43] ${isModal ? 'px-3.5 py-2.5 md:px-4 md:py-3' : 'px-6 py-6 md:px-8'}`}>
                    <div className="flex items-start justify-start">
                        <div className="text-right text-white">
                            <div className={`font-black leading-none ${isModal ? 'text-[1.35rem] md:text-[1.75rem]' : 'text-4xl md:text-6xl'}`}>
                                {tHeader('title')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-stone-200 bg-white">
                    <div className="grid grid-cols-2">
                        <StepTab
                            label={t('steps.form')}
                            number={1}
                            isActive={!isResultStep}
                            isComplete={isResultStep}
                            compact={isModal}
                        />
                        <StepTab
                            label={t('steps.results')}
                            number={2}
                            isActive={isResultStep}
                            isComplete={false}
                            compact={isModal}
                        />
                    </div>
                </div>

                <div
                    dir={isModal ? 'ltr' : undefined}
                    className={isModal ? 'balagh-form-scroll flex-1 overflow-y-auto bg-[#fcfbf7]' : ''}
                >
                    {!isResultStep && (
                        <div
                            dir={contentDir}
                            className={`${isModal ? 'sticky top-0 z-30' : ''} border-y border-[#97C459] bg-[#E8F5EE]`}
                        >
                            <div className={isModal ? 'px-3 py-2 md:px-3.5' : 'px-6 py-3 md:px-8'}>
                                <div className="flex items-start gap-2 text-[#27500A]">
                                    <svg
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.2}
                                            d="M12 11V7a4 4 0 1 0-8 0v4m8 0h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h7Z"
                                        />
                                    </svg>
                                    <p className="text-[12px] font-medium leading-[1.45]">
                                        {t('form.notice')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div dir={contentDir} className={isModal ? 'p-3 md:p-3.5' : 'p-6 md:p-8'}>
                        {!isResultStep ? (
                            <form className={isModal ? 'space-y-3' : 'space-y-6'} onSubmit={handleSubmit}>
                                {error && (
                                    <div className={`rounded-2xl border border-red-200 bg-red-50 font-bold text-red-700 ${isModal ? 'px-3 py-2 text-[11px]' : 'px-5 py-4 text-base'}`}>
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className={`block font-black text-stone-900 ${isModal ? 'mb-1 text-sm' : 'mb-3 text-2xl'}`}>
                                        {t('form.platformLabel')}
                                    </label>
                                    <PlatformSelect
                                        value={form.platform}
                                        onChange={(value) => updateField('platform', value)}
                                        options={platformOptions}
                                        getLabel={(option) => t(`form.platforms.${option}`)}
                                        placeholder={t('form.platformPlaceholder')}
                                        compact={isModal}
                                        dir={contentDir}
                                    />
                                </div>

                                <div>
                                    <label className={`block font-black text-stone-900 ${isModal ? 'mb-1 text-sm' : 'mb-3 text-2xl'}`}>
                                        {t('form.postLinkLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.postLink}
                                        onChange={(event) => updateField('postLink', event.target.value)}
                                        onBlur={(event) => {
                                            const normalized = normalizeReportPostLink(event.target.value);
                                            if (normalized) {
                                                updateField('postLink', normalized);
                                            }
                                        }}
                                        placeholder={t('form.postLinkPlaceholder')}
                                        className={`w-full border border-stone-300 bg-[#f7f5ef] font-medium text-stone-800 outline-none transition placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${isModal ? 'h-10 rounded-2xl px-3 text-[11px]' : 'h-20 rounded-[22px] px-6 text-xl'}`}
                                        inputMode="url"
                                        autoComplete="url"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className={`block font-black text-stone-900 ${isModal ? 'mb-1 text-sm' : 'mb-3 text-2xl'}`}>
                                        {t('form.postTextLabel')}
                                    </label>
                                    <textarea
                                        value={form.postText}
                                        onChange={(event) => updateField('postText', event.target.value)}
                                        placeholder={t('form.postTextPlaceholder')}
                                        className={`w-full border border-stone-300 bg-[#f7f5ef] text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${isModal ? 'min-h-21 rounded-2xl px-3 py-2.5 text-[11px] leading-5' : 'min-h-42.5 rounded-[22px] px-6 py-5 text-xl leading-9'}`}
                                        dir="auto"
                                    />
                                    <p className={`mt-1.5 text-stone-500 ${isModal ? 'text-[10px] leading-4' : 'text-sm leading-6'}`}>
                                        {t('form.postTextHint')}
                                    </p>
                                    <div className="mt-2">
                                        <label className={`inline-flex w-fit cursor-pointer items-center justify-center rounded-lg border border-stone-300 bg-white font-bold text-stone-700 transition hover:border-emerald-300 hover:text-emerald-700 ${isModal ? 'h-9 px-3 text-xs' : 'h-11 px-4 text-sm'}`}>
                                            <input
                                                type="file"
                                                accept={ATTACHMENT_ACCEPT}
                                                multiple
                                                onChange={handleAttachmentChange}
                                                className="hidden"
                                            />
                                            {t('form.uploadImage')}
                                        </label>
                                        <p className={`mt-1.5 text-stone-500 ${isModal ? 'text-[10px] leading-4' : 'text-sm leading-6'}`}>
                                            {t('form.imageHint', { size: 5 })}
                                        </p>
                                        {attachedFiles.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {attachedFiles.map((attachedFile, index) => {
                                                    const previewUrl = attachedFilePreviewUrls[index];
                                                    const isImageFile = isImageEvidenceFile(attachedFile);

                                                    return (
                                                        <div
                                                            key={`${attachedFile.name}-${attachedFile.lastModified}-${index}`}
                                                            className="relative h-15 w-15 overflow-hidden rounded-lg border border-stone-200 bg-white"
                                                            title={`${attachedFile.name} • ${formatFileSize(attachedFile.size)}`}
                                                        >
                                                            {isImageFile && previewUrl ? (
                                                                <Image
                                                                    src={previewUrl}
                                                                    alt={`${t('form.imagePreviewAlt')} ${index + 1}`}
                                                                    fill
                                                                    unoptimized
                                                                    sizes="60px"
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-red-50 text-red-600">
                                                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 3v5h5" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 15h6M9 12h3" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachedFile(index)}
                                                                className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                                                                aria-label={t('form.removeImage')}
                                                            >
                                                                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={`block font-black text-stone-900 ${isModal ? 'mb-1.5 text-sm' : 'mb-4 text-2xl'}`}>
                                        {t('form.targetGroupLabel')}
                                    </label>
                                    <TargetGroupMultiSelect
                                        values={form.targetGroups}
                                        onChange={(value) => updateField('targetGroups', value)}
                                        options={targetGroupOptions}
                                        getLabel={(option) => t(`form.targetGroups.${option}`)}
                                        placeholder={t('form.targetGroups.unspecified')}
                                        compact={isModal}
                                        dir={contentDir}
                                    />
                                </div>

                                <div>
                                    <label className={`block font-black text-stone-900 ${isModal ? 'mb-1.5 text-sm' : 'mb-4 text-2xl'}`}>
                                        {t('form.immediateDangerLabel')}
                                    </label>
                                    <div role="radiogroup" className={isModal ? 'flex flex-wrap gap-2' : 'flex flex-wrap gap-3'}>
                                        {dangerOptions.map((option) => {
                                            const isActive = form.immediateDanger === option;

                                            return (
                                                <label
                                                    key={option}
                                                    className={`inline-flex cursor-pointer items-center justify-center rounded-[18px] border font-bold transition ${
                                                        isActive
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                            : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-300 hover:text-emerald-700'
                                                    } ${isModal ? 'min-w-15.5 px-2.5 py-1 text-[11px]' : 'min-w-28 px-6 py-3 text-xl'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="immediateDanger"
                                                        value={option}
                                                        checked={isActive}
                                                        onChange={() => updateField('immediateDanger', option)}
                                                        className="sr-only"
                                                    />
                                                    <span>
                                                        {t(`form.dangerOptions.${option}`)}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A6B3A] font-black text-white transition hover:bg-[#15582f] disabled:cursor-not-allowed disabled:bg-[#1A6B3A]/70 ${isModal ? 'h-11 text-xs' : 'h-11 text-base'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3A7 7 0 0 0 12 5V2Z" />
                                            </svg>
                                            <span>{t('form.submitting')}</span>
                                        </>
                                    ) : (
                                        t('form.submit')
                                    )}
                                </button>
                            </form>
                        ) : submission ? (
                            <div className="space-y-5">
                                <ResultsDisplay
                                    result={submission.result}
                                    mode="report"
                                    reportNumber={submission.reportNumber}
                                    embedded
                                    compact={isModal}
                                />

                                <div className="flex flex-col gap-3 md:flex-row">
                                    <button
                                        type="button"
                                        onClick={resetFlow}
                                        className={`inline-flex items-center justify-center rounded-2xl border border-stone-200 px-4 font-bold text-stone-700 transition hover:bg-stone-50 ${isModal ? 'h-9 text-xs' : 'h-14 text-base'}`}
                                    >
                                        {t('actions.newReport')}
                                    </button>
                                    {onClose && (
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className={`inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 font-bold text-white transition hover:bg-emerald-700 ${isModal ? 'h-9 text-xs' : 'h-14 text-base'}`}
                                        >
                                            {t('actions.close')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlatformSelect({
    value,
    onChange,
    options,
    getLabel,
    placeholder,
    compact = false,
    dir = 'rtl',
}: {
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
    getLabel: (value: string) => string;
    placeholder?: string;
    compact?: boolean;
    dir?: 'rtl' | 'ltr';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const isRtl = dir === 'rtl';

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isOpen]);

    return (
        <div ref={wrapperRef} dir={dir} className={`relative ${isOpen ? 'z-20' : 'z-0'}`}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                className={`flex w-full items-center justify-between border border-stone-300 bg-[#f7f5ef] font-bold text-stone-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
                    compact ? 'h-10 rounded-2xl px-3 text-xs' : 'h-20 rounded-[22px] px-6 text-xl'
                } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
                <span className={`truncate ${value ? '' : 'text-stone-400'}`}>{value ? getLabel(value) : (placeholder || '')}</span>
                <svg
                    className={`shrink-0 text-stone-500 transition ${isOpen ? 'rotate-180' : ''} ${compact ? 'h-3.5 w-3.5' : 'h-6 w-6'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={`absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-[18px] border border-emerald-200 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] ${
                        compact ? 'max-h-52' : 'max-h-72'
                    }`}
                >
                    <div className="balagh-form-scroll overflow-y-auto py-1">
                        {options.map((option) => {
                            const isSelected = option === value;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between font-bold transition ${
                                        isSelected
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-stone-700 hover:bg-stone-100'
                                    } ${compact ? 'px-3 py-2 text-xs' : 'px-6 py-4 text-xl'} ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                >
                                    <span className="truncate">{getLabel(option)}</span>
                                    {isSelected ? (
                                        <svg
                                            className={`shrink-0 text-emerald-600 ${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m5 13 4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className={compact ? 'w-3.5' : 'w-5'} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function TargetGroupMultiSelect({
    values,
    onChange,
    options,
    getLabel,
    placeholder,
    compact = false,
    dir = 'rtl',
}: {
    values: TargetGroupKey[];
    onChange: (value: TargetGroupKey[]) => void;
    options: readonly TargetGroupKey[];
    getLabel: (value: TargetGroupKey) => string;
    placeholder: string;
    compact?: boolean;
    dir?: 'rtl' | 'ltr';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const isRtl = dir === 'rtl';
    const hasSpecificSelection = values.some((value) => value !== 'unspecified');
    const visibleOptions = hasSpecificSelection
        ? options.filter((option) => option !== 'unspecified')
        : options;
    const displayValues = hasSpecificSelection
        ? values.filter((value): value is Exclude<TargetGroupKey, 'unspecified'> => value !== 'unspecified')
        : values;
    const displayText = displayValues.length > 0
        ? displayValues.map((value) => getLabel(value)).join(isRtl ? '، ' : ', ')
        : placeholder;
    const isPlaceholderState = displayValues.length === 0;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isOpen]);

    const toggleValue = (option: TargetGroupKey) => {
        if (option === 'unspecified') {
            onChange(values.includes('unspecified') ? [] : ['unspecified']);
            setIsOpen(false);
            return;
        }

        const filteredValues = values.filter((value) => value !== 'unspecified');
        const nextValues = filteredValues.includes(option)
            ? filteredValues.filter((value) => value !== option)
            : [...filteredValues, option];

        onChange(nextValues);
        setIsOpen(false);
    };

    const removeValue = (option: TargetGroupKey) => {
        onChange(values.filter((value) => value !== option));
    };

    return (
        <div ref={wrapperRef} dir={dir} className={`relative ${isOpen ? 'z-20' : 'z-0'}`}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                className={`flex w-full items-center justify-between border border-stone-300 bg-[#f7f5ef] font-bold text-stone-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
                    compact ? 'min-h-10 rounded-2xl px-3 py-2 text-xs' : 'min-h-20 rounded-[22px] px-6 py-4 text-xl'
                } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
                <span className={`truncate ${isPlaceholderState ? 'text-stone-400' : ''}`}>{displayText}</span>
                <svg
                    className={`shrink-0 text-stone-500 transition ${isOpen ? 'rotate-180' : ''} ${compact ? 'h-3.5 w-3.5' : 'h-6 w-6'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {displayValues.length > 0 && (
                <div className={`mt-2 flex flex-wrap gap-2 ${isRtl ? 'justify-start' : ''}`}>
                    {displayValues.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => removeValue(value)}
                            className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 ${
                                compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-sm'
                            } ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                            <span>{getLabel(value)}</span>
                            <svg className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && (
                <div
                    className={`balagh-form-scroll absolute inset-x-0 top-full z-20 mt-1 overflow-y-auto overflow-x-hidden rounded-[18px] border border-emerald-200 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] ${
                        compact ? 'max-h-52' : 'max-h-72'
                    }`}
                >
                    <div className="py-1">
                        {visibleOptions.map((option) => {
                            const isSelected = values.includes(option);

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => toggleValue(option)}
                                    className={`flex w-full items-center justify-between font-bold transition ${
                                        isSelected
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-stone-700 hover:bg-stone-100'
                                    } ${compact ? 'px-3 py-2 text-xs' : 'px-6 py-4 text-xl'} ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                >
                                    <span className="truncate">{getLabel(option)}</span>
                                    {isSelected ? (
                                        <svg
                                            className={`shrink-0 text-emerald-600 ${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m5 13 4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className={compact ? 'w-3.5' : 'w-5'} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function StepTab({
    label,
    number,
    isActive,
    isComplete,
    compact = false,
}: {
    label: string;
    number: number;
    isActive: boolean;
    isComplete: boolean;
    compact?: boolean;
}) {
    const circleClassName = isComplete
        ? 'border border-emerald-600 bg-emerald-600 text-white'
        : isActive
            ? 'border border-emerald-600 bg-white text-emerald-700'
            : 'bg-white text-stone-500 border border-stone-300';

    return (
        <div className={`relative text-center ${compact ? 'px-2 py-2.5' : 'px-6 py-6'} ${isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
            <div className={`flex items-center justify-center gap-2 font-black ${compact ? 'text-[11px]' : 'text-2xl'}`}>
                <span>{label}</span>
                <span className={`inline-flex items-center justify-center rounded-full font-black ${circleClassName} ${compact ? 'h-5 w-5 text-[10px]' : 'h-12 w-12 text-xl'}`}>
                    {isComplete ? '✓' : number}
                </span>
            </div>
            <div className={`absolute inset-x-0 bottom-0 ${compact ? 'h-[2.5px]' : 'h-1'} ${isActive ? 'bg-emerald-700' : 'bg-transparent'}`} />
        </div>
    );
}
