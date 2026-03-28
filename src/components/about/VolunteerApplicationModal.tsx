'use client';

import { useEffect, useMemo, useState } from 'react';

type VolunteerApplicationModalProps = {
    isOpen: boolean;
    locale: string;
    onClose: () => void;
};

type FormState = {
    name: string;
    email: string;
    phone: string;
    volunteerArea: string;
    background: string;
    weeklyHours: string;
    motivation: string;
};

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    phone: '',
    volunteerArea: '',
    background: '',
    weeklyHours: '',
    motivation: '',
};

const CONTENT = {
    ar: {
        title: 'طلب تطوع',
        subtitle: 'املأ النموذج التالي وسنراجع طلبك للتطوع في بلّغ.',
        fields: {
            name: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            phone: 'رقم الهاتف',
            volunteerArea: 'في أي مجال تريد التطوع؟',
            background: 'ما خلفيتك أو تخصصك؟',
            weeklyHours: 'كم ساعة أسبوعياً تستطيع تقديمها؟',
            motivation: 'لماذا تريد التطوع في بلّغ تحديداً؟',
        },
        placeholders: {
            name: 'الاسم الكامل',
            email: 'name@example.com',
            phone: 'اختياري',
            background: 'جملتان تكفيان.',
            motivation: 'أخبرنا بدافعك باختصار.',
        },
        areaOptions: [
            { value: 'research_analysis', label: 'البحث والتحليل' },
            { value: 'monitoring_documentation', label: 'الرصد والتوثيق' },
            { value: 'technology_programming', label: 'التقنية والبرمجة' },
            { value: 'communications_media', label: 'التواصل والإعلام' },
            { value: 'legal_support', label: 'الدعم القانوني' },
            { value: 'other', label: 'أخرى' },
        ],
        weeklyHoursOptions: [
            { value: 'under_3', label: 'أقل من 3 ساعات' },
            { value: 'between_3_7', label: '3 إلى 7 ساعات' },
            { value: 'over_7', label: 'أكثر من 7 ساعات' },
        ],
        requiredHint: 'الحقول المعلّمة بـ * إلزامية',
        submit: 'إرسال الطلب',
        cancel: 'إلغاء',
        success: 'تم إرسال طلب التطوع بنجاح.',
        errors: {
            name: 'الاسم مطلوب.',
            email: 'أدخل بريدًا إلكترونيًا صحيحًا.',
            volunteerArea: 'اختر مجال التطوع.',
            background: 'الخلفية أو التخصص مطلوب.',
            weeklyHours: 'حدد مستوى الالتزام الزمني.',
            motivation: 'اكتب سبب رغبتك في التطوع.',
            generic: 'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.',
        }
    },
    en: {
        title: 'Volunteer Application',
        subtitle: 'Complete the form below and we will review your application to volunteer with Baligh.',
        fields: {
            name: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number',
            volunteerArea: 'Which area would you like to volunteer in?',
            background: 'What is your background or specialization?',
            weeklyHours: 'How many hours per week can you commit?',
            motivation: 'Why do you want to volunteer with Baligh specifically?',
        },
        placeholders: {
            name: 'Full name',
            email: 'name@example.com',
            phone: 'Optional',
            background: 'Two short sentences are enough.',
            motivation: 'Tell us briefly what motivates you.',
        },
        areaOptions: [
            { value: 'research_analysis', label: 'Research and Analysis' },
            { value: 'monitoring_documentation', label: 'Monitoring and Documentation' },
            { value: 'technology_programming', label: 'Technology and Programming' },
            { value: 'communications_media', label: 'Communications and Media' },
            { value: 'legal_support', label: 'Legal Support' },
            { value: 'other', label: 'Other' },
        ],
        weeklyHoursOptions: [
            { value: 'under_3', label: 'Less than 3 hours' },
            { value: 'between_3_7', label: '3 to 7 hours' },
            { value: 'over_7', label: 'More than 7 hours' },
        ],
        requiredHint: 'Fields marked with * are required',
        submit: 'Submit Application',
        cancel: 'Cancel',
        success: 'Your volunteer application was sent successfully.',
        errors: {
            name: 'Name is required.',
            email: 'Enter a valid email address.',
            volunteerArea: 'Choose a volunteer area.',
            background: 'Background or specialization is required.',
            weeklyHours: 'Choose your weekly availability.',
            motivation: 'Tell us why you want to volunteer.',
            generic: 'Something went wrong while sending the application. Please try again.',
        }
    },
    ku: {
        title: 'Daxwaza Xebatkarî',
        subtitle: 'Vê formê tije bike û em ê daxwaza te ji bo xebatkarî li Baligh binirxînin.',
        fields: {
            name: 'Navê Te',
            email: 'Email',
            phone: 'Hejmara Telefonê',
            volunteerArea: 'Tu dixwazî di kîjan warê de xebatkarî bikî?',
            background: 'Piştîna te an pisporiya te çi ye?',
            weeklyHours: 'Di hefteyekê de çend saet dikarî pêşkêş bikî?',
            motivation: 'Çima dixwazî bi taybetî li Baligh xebatkarî bikî?',
        },
        placeholders: {
            name: 'Navê te yê temam',
            email: 'name@example.com',
            phone: 'Ne pêwîst',
            background: 'Du hevok bes in.',
            motivation: 'Bi kurtî hinceta xwe bibêje.',
        },
        areaOptions: [
            { value: 'research_analysis', label: 'Lêkolîn û Analîz' },
            { value: 'monitoring_documentation', label: 'Şopandin û Belgekirin' },
            { value: 'technology_programming', label: 'Teknolojî û Bernamekirin' },
            { value: 'communications_media', label: 'Têkilî û Medya' },
            { value: 'legal_support', label: 'Piştgiriya Yasayî' },
            { value: 'other', label: 'Yên din' },
        ],
        weeklyHoursOptions: [
            { value: 'under_3', label: 'Ji 3 saetan kêmtir' },
            { value: 'between_3_7', label: '3 heta 7 saet' },
            { value: 'over_7', label: 'Ji 7 saetan zêdetir' },
        ],
        requiredHint: 'Qadên ku bi * hatiye nîşandan pêwîstin',
        submit: 'Şandina Daxwazê',
        cancel: 'Betal bike',
        success: 'Daxwaza xebatkariya te bi serkeftî hate şandin.',
        errors: {
            name: 'Nav pêwîst e.',
            email: 'Emaila derbasdar binivîse.',
            volunteerArea: 'Qada xebatkariyê hilbijêre.',
            background: 'Piştîn an pisporî pêwîst e.',
            weeklyHours: 'Dema hefteyî hilbijêre.',
            motivation: 'Sedema xebatkariyê binivîse.',
            generic: 'Di şandina daxwazê de çewtiyek çêbû. Ji kerema xwe dîsa biceribîne.',
        }
    }
} as const;

export default function VolunteerApplicationModal({ isOpen, locale, onClose }: VolunteerApplicationModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const t = useMemo(() => CONTENT[locale as keyof typeof CONTENT] || CONTENT.ar, [locale]);
    const isRtl = locale === 'ar';

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setSuccessMessage('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const validate = () => {
        if (!form.name.trim()) return t.errors.name;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return t.errors.email;
        if (!form.volunteerArea) return t.errors.volunteerArea;
        if (!form.background.trim()) return t.errors.background;
        if (!form.weeklyHours) return t.errors.weeklyHours;
        if (!form.motivation.trim()) return t.errors.motivation;
        return '';
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setSuccessMessage('');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        const selectedArea = t.areaOptions.find((option) => option.value === form.volunteerArea)?.label || form.volunteerArea;

        try {
            const response = await fetch('/api/volunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locale,
                    ...form,
                    volunteerArea: form.volunteerArea,
                    weeklyHours: form.weeklyHours,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || t.errors.generic);
                return;
            }

            setSuccessMessage(t.success);
            setForm(INITIAL_FORM);
            window.setTimeout(() => {
                setSuccessMessage('');
                onClose();
            }, 1200);
        } catch (submitError) {
            console.error('Volunteer application submission failed', submitError);
            setError(t.errors.generic);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-stone-950/55 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_35px_100px_-40px_rgba(15,23,42,0.55)]">
                <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#1E8C4E] to-[#166639] px-6 py-5 text-white md:px-8">
                    <div>
                        <h3 className="text-2xl font-black leading-tight">{t.title}</h3>
                        <p className="mt-2 text-sm text-green-50 md:text-base">{t.subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-full p-2 text-white/85 transition hover:bg-white/10 hover:text-white"
                        aria-label={t.cancel}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[calc(90vh-6rem)] overflow-y-auto px-6 py-6 md:px-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <p className="text-sm font-medium text-stone-500">{t.requiredHint}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-stone-900">{t.fields.name} *</span>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) => updateField('name', event.target.value)}
                                    placeholder={t.placeholders.name}
                                    className="h-12 w-full rounded-2xl border border-stone-300 bg-[#f8f6f0] px-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                    disabled={isSubmitting}
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-stone-900">{t.fields.email} *</span>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    placeholder={t.placeholders.email}
                                    className="h-12 w-full rounded-2xl border border-stone-300 bg-[#f8f6f0] px-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                    disabled={isSubmitting}
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-bold text-stone-900">{t.fields.phone}</span>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(event) => updateField('phone', event.target.value)}
                                placeholder={t.placeholders.phone}
                                className="h-12 w-full rounded-2xl border border-stone-300 bg-[#f8f6f0] px-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                disabled={isSubmitting}
                            />
                        </label>

                        <div>
                            <span className="mb-3 block text-sm font-bold text-stone-900">{t.fields.volunteerArea} *</span>
                            <div className="grid gap-3 md:grid-cols-2">
                                {t.areaOptions.map((option) => {
                                    const isActive = form.volunteerArea === option.value;
                                    return (
                                        <label
                                            key={option.value}
                                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="volunteerArea"
                                                value={option.value}
                                                checked={isActive}
                                                onChange={(event) => updateField('volunteerArea', event.target.value)}
                                                className="h-4 w-4 text-emerald-600"
                                                disabled={isSubmitting}
                                            />
                                            <span className="font-medium">{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-bold text-stone-900">{t.fields.background} *</span>
                            <textarea
                                value={form.background}
                                onChange={(event) => updateField('background', event.target.value)}
                                placeholder={t.placeholders.background}
                                className="min-h-28 w-full rounded-2xl border border-stone-300 bg-[#f8f6f0] px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                disabled={isSubmitting}
                            />
                        </label>

                        <div>
                            <span className="mb-3 block text-sm font-bold text-stone-900">{t.fields.weeklyHours} *</span>
                            <div className="flex flex-wrap gap-3">
                                {t.weeklyHoursOptions.map((option) => {
                                    const isActive = form.weeklyHours === option.value;
                                    return (
                                        <label
                                            key={option.value}
                                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 transition ${isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="weeklyHours"
                                                value={option.value}
                                                checked={isActive}
                                                onChange={(event) => updateField('weeklyHours', event.target.value)}
                                                className="h-4 w-4 text-emerald-600"
                                                disabled={isSubmitting}
                                            />
                                            <span className="font-medium">{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-bold text-stone-900">{t.fields.motivation} *</span>
                            <textarea
                                value={form.motivation}
                                onChange={(event) => updateField('motivation', event.target.value)}
                                placeholder={t.placeholders.motivation}
                                className="min-h-32 w-full rounded-2xl border border-stone-300 bg-[#f8f6f0] px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                                disabled={isSubmitting}
                            />
                        </label>

                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                {successMessage}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="inline-flex h-12 items-center justify-center rounded-2xl border border-stone-300 px-5 font-bold text-stone-700 transition hover:bg-stone-50"
                                disabled={isSubmitting}
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1E8C4E] px-6 font-bold text-white transition hover:bg-[#166639] disabled:cursor-not-allowed disabled:bg-[#1E8C4E]/70"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : t.submit}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
