'use client';

import { createContext, useContext, useMemo, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_LOCALE_COOKIE, type AdminLocale, normalizeAdminLocale } from '@/lib/admin-locale';
import type { AdminRole } from '@/lib/permissions';

type Primitive = string | number;

type AdminI18nValue = {
    dir: 'rtl' | 'ltr';
    locale: AdminLocale;
    isSwitchingLocale: boolean;
    setLocale: (locale: AdminLocale) => void;
    t: (key: string, values?: Record<string, Primitive | null | undefined>) => string;
    formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
    formatDateTime: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
    pickLocalizedText: (value: Record<string, string> | string | null | undefined) => string;
    translateApiError: (message: string | null | undefined) => string;
    formatRole: (role: AdminRole) => string;
    formatNewsCategory: (category: string) => string;
    formatReportCategory: (category: string) => string;
    formatPlatform: (platform: string | null | undefined) => string;
    formatImmediateDanger: (value: string | null | undefined) => string;
    formatClassification: (value: string | null | undefined) => string;
    formatRiskLevel: (value: string | null | undefined) => string;
    formatSpeechType: (value: string | null | undefined) => string;
    formatReviewStatus: (value: string | null | undefined) => string;
    formatTargetGroup: (value: string | null | undefined) => string;
    formatVolunteerArea: (value: string | null | undefined) => string;
    formatVolunteerHours: (value: string | null | undefined) => string;
};

const ADMIN_MESSAGES = {
    ar: {
        common: {
            dashboard: 'لوحة الإدارة',
            logout: 'تسجيل الخروج',
            loading: 'جارٍ التحميل...',
            saving: 'جارٍ الحفظ...',
            creating: 'جارٍ الإنشاء...',
            save: 'حفظ',
            saveChanges: 'حفظ التغييرات',
            cancel: 'إلغاء',
            close: 'إغلاق',
            clear: 'مسح',
            refresh: 'تحديث',
            delete: 'حذف',
            edit: 'تعديل',
            update: 'تحديث',
            library: 'المكتبة',
            upload: 'رفع',
            uploadFailed: 'فشل الرفع',
            unexpectedError: 'حدث خطأ غير متوقع',
            permissionDenied: 'لا تملك الصلاحية لتنفيذ هذا الإجراء',
            draft: 'مسودة',
            published: 'منشور',
            optional: 'اختياري',
            untitled: 'بدون عنوان',
            unnamedAdmin: 'مدير بدون اسم',
            you: 'أنت',
            report: 'البلاغ',
            search: 'بحث',
            yesDelete: 'نعم، احذف',
            date: 'التاريخ',
            none: '—',
            language: 'اللغة',
            arabic: 'العربية',
            english: 'English',
            kurdish: 'الكردية',
        },
        header: {
            signedInAs: 'مسجل الدخول باسم {email}',
            title: 'لوحة إدارة بلّغ',
            subtitle: 'إدارة المحتوى، البلاغات، والمرصد الداخلي',
        },
        tabs: {
            dashboard: 'الرئيسية',
            team: 'أعضاء الفريق',
            news: 'الأخبار',
            reports: 'التقارير والدراسات',
            legal: 'البلاغات',
            radar: 'المرصد',
            volunteerForms: 'استمارات التطوع',
            admin: 'الحساب',
        },
        roles: {
            SUPER_ADMIN: 'المدير العام',
            ANALYST: 'المحلل',
            EDITOR: 'المحرر',
            VIEWER: 'المشاهد',
        },
        dashboardView: {
            internalAlerts: 'تنبيهات داخلية',
            internalAlertsSubtitle: 'حالات تصعيد عالية الأولوية موجهة إلى دورك.',
            alertsCount: '{count} تنبيه',
            internalAlertTitle: 'بلاغ عالي الأولوية',
            internalAlertMessage: 'تم استلام بلاغ عالي الأولوية: {reportNumber} — درجة الشدة 5 — يحتاج إلى مراجعة فورية',
            analyses: 'التحليلات',
            legalReports: 'البلاغات',
            news: 'الأخبار',
            reportsStudies: 'التقارير والدراسات',
            teamMembers: 'أعضاء الفريق',
            latestAnalyses: 'أحدث التحليلات',
            latestEntries: 'آخر 5 سجلات',
            noRecords: 'لا توجد سجلات بعد.',
            classification: 'التصنيف',
            risk: 'الخطورة',
            report: 'البلاغ',
        },
        account: {
            title: 'حساب الإدارة',
            subtitle: 'تحديث البريد الإلكتروني وكلمة المرور المستخدمة لتسجيل الدخول',
            role: 'الدور',
            lastUpdate: 'آخر تحديث',
            name: 'الاسم',
            namePlaceholder: 'اسم المدير',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور الجديدة',
            passwordHint: 'الحد الأدنى 6 أحرف',
            passwordPlaceholder: 'اتركه فارغًا للإبقاء على كلمة المرور الحالية',
            loading: 'جارٍ تحميل بيانات الحساب...',
            updated: 'تم تحديث الحساب بنجاح',
            adminUsersTitle: 'مستخدِمو الإدارة',
            adminUsersSubtitle: 'إنشاء مستخدم إداري جديد وتحديد الدور المناسب له.',
            createUser: 'إنشاء مستخدم',
            createRole: 'الدور',
            createEmailPlaceholder: 'new-admin@balgh.org',
            createPasswordPlaceholder: 'الحد الأدنى 6 أحرف',
            createSuccess: 'تم إنشاء المستخدم بنجاح',
            currentAdmins: 'المستخدمون الحاليون',
            usersCount: '{count} مستخدم',
            createdOn: 'أُنشئ في {date}',
        },
        team: {
            title: 'أعضاء الفريق',
            count: '{count} عضو',
            addMember: 'إضافة عضو',
            readOnly: 'بيانات الفريق للعرض فقط بالنسبة لدورك الحالي.',
            noMembers: 'لا يوجد أعضاء بعد. أضف أول عضو ليظهر في صفحة من نحن.',
            editMember: 'تعديل عضو الفريق',
            addMemberTitle: 'إضافة عضو فريق',
            nameAr: 'الاسم بالعربية',
            nameEn: 'الاسم بالإنجليزية',
            roleAr: 'المسمى الوظيفي بالعربية',
            roleEn: 'المسمى الوظيفي بالإنجليزية',
            bio: 'نبذة قصيرة',
            sortOrder: 'ترتيب الظهور',
            sortOrderPlaceholder: 'كلما كان الرقم أصغر ظهر أولًا',
            updated: 'تم تحديث بيانات الفريق بنجاح',
            created: 'تمت إضافة عضو الفريق بنجاح',
            save: 'حفظ',
            update: 'تحديث',
            deleteConfirm: 'حذف هذا العضو؟',
        },
        news: {
            title: 'الأخبار',
            count: '{count} خبر',
            add: 'إضافة خبر',
            loading: 'جارٍ تحميل الأخبار...',
            empty: 'لا توجد أخبار بعد.',
            editTitle: 'تعديل الخبر',
            addTitle: 'إضافة خبر',
            titleAr: 'العنوان بالعربية',
            titleEn: 'العنوان بالإنجليزية',
            summaryAr: 'الملخص بالعربية',
            summaryEn: 'الملخص بالإنجليزية',
            bodyAr: 'النص بالعربية',
            bodyEn: 'النص بالإنجليزية',
            videoUrl: 'رابط الفيديو',
            image: 'الصورة',
            imageUrl: 'رابط الصورة',
            authorName: 'اسم الكاتب',
            authorNameEn: 'اسم الكاتب بالإنجليزية',
            publishDate: 'تاريخ النشر',
            category: 'التصنيف',
            publishNow: 'نشر الآن',
            save: 'حفظ الخبر',
            update: 'تحديث الخبر',
            updated: 'تم تحديث الخبر بنجاح',
            created: 'تم إنشاء الخبر بنجاح',
            deleteConfirm: 'حذف هذا الخبر؟',
            deleteError: 'تعذر حذف الخبر',
        },
        reports: {
            title: 'التقارير والدراسات',
            count: '{count} عنصر',
            add: 'إضافة تقرير',
            loading: 'جارٍ تحميل التقارير...',
            empty: 'لا توجد تقارير بعد.',
            editTitle: 'تعديل التقرير/الدراسة',
            addTitle: 'إضافة تقرير/دراسة',
            titleAr: 'العنوان بالعربية',
            titleEn: 'العنوان بالإنجليزية',
            authorAr: 'اسم الكاتب',
            authorEn: 'اسم الكاتب بالإنجليزية',
            summaryAr: 'الملخص بالعربية',
            summaryEn: 'الملخص بالإنجليزية',
            bodyAr: 'النص بالعربية',
            bodyEn: 'النص بالإنجليزية',
            image: 'الصورة',
            imageUrl: 'رابط الصورة',
            documentAr: 'الملف العربي PDF',
            documentEn: 'الملف الإنجليزي PDF',
            documentHintAr: 'أو ألصق رابط الملف العربي',
            documentHintEn: 'أو ألصق رابط الملف الإنجليزي',
            attachedAr: 'مرفق عربي',
            attachedEn: 'مرفق إنجليزي',
            uploadAr: 'جارٍ رفع الملف العربي...',
            uploadEn: 'جارٍ رفع الملف الإنجليزي...',
            category: 'التصنيف',
            publishNow: 'نشر الآن',
            save: 'حفظ التقرير',
            update: 'تحديث التقرير',
            updated: 'تم تحديث التقرير بنجاح',
            created: 'تم إنشاء التقرير بنجاح',
            deleteConfirm: 'حذف هذا التقرير؟',
            pdfUploaded: 'تم رفع ملف PDF بنجاح',
            pdfOnly: 'يسمح بملفات PDF فقط',
            pdfMaxSize: 'الحد الأقصى لحجم الملف هو 20 ميغابايت',
            deleteError: 'تعذر حذف التقرير',
        },
        imagePicker: {
            libraryTitle: 'مكتبة الملفات',
            refresh: 'تحديث',
            uploadImage: 'رفع صورة',
            uploading: 'جارٍ الرفع...',
            close: 'إغلاق',
            loading: 'جارٍ التحميل...',
            noImages: 'لا توجد صور مرفوعة بعد.',
            noPdfs: 'لا توجد ملفات PDF مرفوعة بعد.',
            images: 'الصور',
            pdfs: 'ملفات PDF',
            deleteImageConfirm: 'حذف هذا الملف نهائيًا؟',
            deleteTitle: 'حذف الملف',
            openFile: 'فتح الملف',
            imageUrl: 'رابط الصورة',
        },
        legal: {
            title: 'البلاغات',
            readOnly: 'البلاغات للقراءة فقط بالنسبة لدورك الحالي.',
            reportNumber: 'رقم البلاغ',
            fromDate: 'من تاريخ',
            toDate: 'إلى تاريخ',
            severity: 'درجة الشدة',
            allSeverities: 'كل الدرجات',
            applyFilters: 'تطبيق التصفية',
            reset: 'إعادة ضبط',
            exportCsv: 'تصدير CSV',
            loadingFiltered: 'جارٍ تحميل النتائج المفلترة...',
            reportsFound: '{count} بلاغ',
            loading: 'جارٍ تحميل البلاغات...',
            empty: 'لا توجد بلاغات بعد.',
            searchByReport: 'ابحث برقم البلاغ فقط',
            startDateAfterEnd: 'لا يمكن أن يكون تاريخ البداية بعد تاريخ النهاية.',
            deleteConfirm: 'حذف هذا البلاغ؟',
            deleteTitle: 'حذف البلاغ',
            humanReview: 'المراجعة البشرية',
            escalated: 'تصعيد',
            postText: 'نص المنشور',
            noPostText: 'لم يتم حفظ نص المنشور الأصلي لهذا البلاغ.',
            postImages: 'صور المنشور',
            targetGroup: 'الفئة المستهدفة',
            speechType: 'نوع الخطاب',
            hatefulWords: 'الكلمات الكارهة',
            reportDetail: 'تفاصيل البلاغ',
            classification: 'التصنيف',
            riskLevel: 'مستوى الخطورة',
            imageDescription: 'وصف الصورة',
            storedImages: 'الصور المحفوظة',
            postImagesAndAttachments: 'الصور والمرفقات',
            openFile: 'فتح الملف',
            pdfDocument: 'ملف PDF',
            attachment: 'مرفق',
            image: 'صورة',
            noOriginalImageTitle: 'لا توجد صورة أصلية محفوظة',
            noOriginalImageBody: 'البلاغ يحتوي فقط على وصف للصورة ضمن بيانات التحليل. يمكن عرض الصورة الفعلية فقط عندما يكون رابط الملف الأصلي محفوظًا مع البلاغ.',
            reviewWorkflow: 'سير المراجعة البشرية',
            reviewWorkflowSubtitle: 'يمكن للمحللين تحديث الحالة وإضافة ملاحظة داخلية دون حذف البلاغ.',
            reviewStatus: 'حالة المراجعة',
            currentInternalState: 'الحالة الداخلية الحالية',
            internalReviewNote: 'ملاحظة المراجعة الداخلية',
            internalReviewPlaceholder: 'أضف ملاحظة محلل أو ملخص متابعة',
            internalOnlyNote: 'لن يتم إخطار المبلّغ من هذه اللوحة. جميع التحديثات تبقى داخلية فقط.',
            saveReviewUpdate: 'حفظ تحديث المراجعة',
            reviewSavedTitle: 'تم الحفظ',
            reviewSavedBody: 'تم تحديث حالة المراجعة بنجاح.',
            reasoning: 'التعليل',
            platform: 'المنصة',
            postLink: 'رابط المنشور',
            immediateDanger: 'الخطر المباشر',
            reportSummary: 'ملخص البلاغ',
        },
        radar: {
            title: 'التحكم بالمرصد',
            description: 'لم تعد صفحة المرصد العامة تتحدث تلقائيًا مع كل سجل جديد في قاعدة البيانات. ستبقى البيانات الجديدة محفوظة في الموقع، لكنها لن تظهر في المرصد حتى يتم نشر نسخة جديدة من هنا.',
            saveDescriptions: 'حفظ التوصيفات فقط',
            savingDescriptions: 'جارٍ حفظ التوصيفات...',
            saveDescriptionsSuccess: 'تم حفظ توصيفات المرصد بنجاح على النسخة المنشورة الحالية.',
            saveDescriptionsUnavailable: 'يجب نشر نسخة من المرصد أولًا قبل حفظ التوصيفات فقط.',
            updateRadar: 'تحديث صفحة المرصد',
            updatingRadar: 'جارٍ تحديث المرصد...',
            rangeStart: 'من تاريخ',
            rangeEnd: 'إلى تاريخ',
            rangeHelp: 'لإنشاء مرصد لفترة محددة، اختر تاريخ البداية والنهاية معًا. إذا تركتهما فارغين فسيُنشأ المرصد اعتمادًا على أحدث 52 أسبوعًا.',
            displayRange: 'النطاق المعروض',
            descriptionsTitle: 'توصيفات صفحة المرصد',
            descriptionsSubtitle: 'يمكن تعديل الأوصاف النصية الظاهرة في الصفحة العامة للمرصد من هنا. لن تنعكس التغييرات إلا عند الضغط على زر تحديث المرصد.',
            pageSubtitleLabel: 'وصف مقدمة المرصد',
            classificationSubtitleLabel: 'وصف بطاقة نوع الخطاب',
            targetGroupsSubtitleLabel: 'وصف بطاقة الفئة المستهدفة',
            emotionsSubtitleLabel: 'وصف بطاقة خريطة النبرة العاطفية',
            keywordsSubtitleLabel: 'وصف بطاقة سحابة الكلمات الكارهة',
            useDataUpTo: 'استخدام البيانات حتى تاريخ',
            useDataUpToHelp: 'اترك هذا الحقل فارغًا لنشر المرصد اعتمادًا على أحدث السجلات المتاحة. وإذا اخترت تاريخًا، فسيتم إنشاء النسخة حتى نهاية ذلك اليوم فقط.',
            currentSnapshot: 'النسخة الحالية',
            dataThrough: 'البيانات حتى',
            publishedBy: 'نُشرت بواسطة',
            latestAvailableData: 'أحدث البيانات المتاحة',
            notPublishedYet: 'لم تُنشر بعد',
            success: 'تم تحديث صفحة المرصد بنجاح. صفحة المرصد العامة تعرض الآن هذه النسخة المنشورة فقط.',
            reportsInSnapshot: 'عدد البلاغات',
            averageSeverity: 'متوسط الشدة',
            escalatedReports: 'البلاغات المصعّدة',
            activePlatforms: 'المنصات النشطة',
            targetedGroups: 'الفئات المستهدفة',
            publicationHistory: 'سجل النشر',
            publicationHistorySubtitle: 'آخر نسخ المرصد المنشورة والمحفوظة في قاعدة البيانات.',
            noHistory: 'لم يتم نشر أي نسخة من المرصد بعد.',
            publishedAt: 'تاريخ النشر',
            reports: 'البلاغات',
        },
        volunteerForms: {
            title: 'استمارات التطوع',
            count: '{count} استمارة',
            loading: 'جارٍ تحميل استمارات التطوع...',
            empty: 'لا توجد استمارات تطوع بعد.',
            openDetails: 'عرض التفاصيل',
            submittedAt: 'تاريخ الإرسال',
            applicantName: 'الاسم',
            applicantEmail: 'البريد الإلكتروني',
            applicantPhone: 'الهاتف',
            volunteerArea: 'مجال التطوع',
            background: 'الخلفية / التخصص',
            weeklyHours: 'الالتزام الزمني',
            motivation: 'الدافع',
            detailsTitle: 'تفاصيل استمارة التطوع',
            detailsSubtitle: 'استعراض داخلي فقط. لا يمكن تعديل الاستمارة أو حذفها من هذه اللوحة.',
            noPhone: 'غير مذكور',
        },
        categories: {
            news: {
                training: 'تدريب',
                media: 'مقابلات إعلامية',
                event: 'مشاركة في فعالية',
                achievement: 'مستجدات',
                statement: 'بيانات',
                other: 'أخرى',
            },
            reports: {
                initiative: 'تقارير المبادرة',
                analytical: 'تقارير تحليلية',
                study: 'دراسات',
                infographic: 'إنفوغراف',
                policy: 'موجزات سياسات',
                other: 'أخرى',
            },
        },
        platforms: {
            facebook: 'فيسبوك',
            telegram: 'تلغرام',
            x: 'إكس',
            youtube: 'يوتيوب',
            instagram: 'إنستغرام',
            tiktok: 'تيك توك',
            other: 'أخرى',
        },
        immediateDanger: {
            yes: 'نعم',
            no: 'لا',
            unknown: 'غير معروف',
        },
        riskLevels: {
            CRITICAL: 'حرج',
            HIGH: 'مرتفع',
            MEDIUM: 'متوسط',
            LOW: 'منخفض',
        },
        reviewStatus: {
            pending: 'بانتظار المراجعة',
            reviewed: 'تمت المراجعة',
            escalated: 'مصعّد',
            closed: 'مغلق',
            resolved: 'مغلق',
            in_review: 'قيد المراجعة',
        },
        classifications: {
            explicit_hate_speech: 'خطاب كراهية صريح',
            implicit_hate_speech: 'خطاب كراهية ضمني',
            incitement: 'تحريض',
            no_hate_speech: 'لا يوجد خطاب كراهية',
            category_a: 'تحريض مباشر',
            category_b: 'مضايقة أو تهديد',
            category_c: 'نزع إنسانية',
            category_d: 'كراهية منخفضة الحدة',
            safe: 'محتوى آمن',
            none: 'لا يوجد خطاب كراهية',
        },
        speechTypes: {
            direct: 'مباشر',
            implicit: 'ضمني',
            symbolic: 'رمزي',
            false_propaganda: 'دعاية مضللة',
        },
        targetGroups: {
            druze: 'دروز',
            sunni_muslims: 'مسلمون سنة',
            sunnis: 'مسلمون سنة',
            alawites: 'علويون',
            kurds: 'كرد',
            arabs: 'عرب',
            christians: 'مسيحيون',
            women_children: 'نساء/أطفال',
            women: 'نساء/أطفال',
            children: 'نساء/أطفال',
            other_groups_minorities: 'أقليات أخرى',
            unspecified: 'غير محدد',
        },
        volunteerAreas: {
            research_analysis: 'البحث والتحليل',
            monitoring_documentation: 'الرصد والتوثيق',
            technology_programming: 'التقنية والبرمجة',
            communications_media: 'التواصل والإعلام',
            legal_support: 'الدعم القانوني',
            other: 'أخرى',
        },
        volunteerHours: {
            under_3: 'أقل من 3 ساعات',
            between_3_7: '3 إلى 7 ساعات',
            over_7: 'أكثر من 7 ساعات',
        },
        errors: {
            unauthorized: 'يجب تسجيل الدخول للوصول إلى لوحة الإدارة',
            permission: 'لا تملك الصلاحية لتنفيذ هذا الإجراء',
            loadAccount: 'تعذر تحميل بيانات الحساب',
            saveFailed: 'تعذر الحفظ',
            createFailed: 'تعذر إنشاء المستخدم',
            loadNews: 'تعذر تحميل الأخبار',
            saveNews: 'تعذر حفظ الخبر',
            loadReports: 'تعذر تحميل التقارير',
            saveReport: 'تعذر حفظ التقرير',
            loadLegalReports: 'تعذر تحميل البلاغات',
            loadVolunteerForms: 'تعذر تحميل استمارات التطوع',
            updateReview: 'تعذر تحديث حالة المراجعة',
            loadRadar: 'تعذر تحميل حالة المرصد',
            publishRadar: 'تعذر تحديث صفحة المرصد',
            saveRadarDescriptions: 'تعذر حفظ توصيفات المرصد',
            invalidRadarRange: 'نطاق المرصد غير صالح',
            maxPdfSize: 'الحد الأقصى لحجم ملف PDF هو 20 ميغابايت',
            pdfOnly: 'يسمح برفع ملفات PDF فقط',
            singleSuperAdmin: 'يمكن أن يوجد مدير عام واحد فقط',
            duplicateUser: 'هذا البريد مستخدم بالفعل',
            generic: 'حدث خطأ أثناء تنفيذ الطلب',
        },
    },
    en: {
        common: {
            dashboard: 'Admin Dashboard',
            logout: 'Logout',
            loading: 'Loading...',
            saving: 'Saving...',
            creating: 'Creating...',
            save: 'Save',
            saveChanges: 'Save changes',
            cancel: 'Cancel',
            close: 'Close',
            clear: 'Clear',
            refresh: 'Refresh',
            delete: 'Delete',
            edit: 'Edit',
            update: 'Update',
            library: 'Library',
            upload: 'Upload',
            uploadFailed: 'Upload failed',
            unexpectedError: 'Unexpected error',
            permissionDenied: 'You do not have permission to perform this action',
            draft: 'Draft',
            published: 'Published',
            optional: 'Optional',
            untitled: 'Untitled',
            unnamedAdmin: 'Unnamed admin',
            you: 'You',
            report: 'Report',
            search: 'Search',
            yesDelete: 'Yes, delete',
            date: 'Date',
            none: '—',
            language: 'Language',
            arabic: 'العربية',
            english: 'English',
            kurdish: 'Kurdish',
        },
        header: {
            signedInAs: 'Signed in as {email}',
            title: 'Balagh Admin Dashboard',
            subtitle: 'Manage content, reports, and the internal radar',
        },
        tabs: {
            dashboard: 'Dashboard',
            team: 'Team Members',
            news: 'News Articles',
            reports: 'Reports & Studies',
            legal: 'Reports',
            radar: 'Radar Control',
            volunteerForms: 'Volunteer Forms',
            admin: 'Account',
        },
        roles: {
            SUPER_ADMIN: 'Super Admin',
            ANALYST: 'Analyst',
            EDITOR: 'Editor',
            VIEWER: 'Viewer',
        },
        dashboardView: {
            internalAlerts: 'Internal Alerts',
            internalAlertsSubtitle: 'High-priority escalations assigned to your role.',
            alertsCount: '{count} alerts',
            internalAlertTitle: 'High-priority report received',
            internalAlertMessage: 'High-priority report received: {reportNumber} — severity 5 — requires immediate review',
            analyses: 'Analyses',
            legalReports: 'Reports',
            news: 'News',
            reportsStudies: 'Reports & Studies',
            teamMembers: 'Team Members',
            latestAnalyses: 'Latest Analyses',
            latestEntries: 'Most recent 5 entries',
            noRecords: 'No records yet.',
            classification: 'Classification',
            risk: 'Risk',
            report: 'Report',
        },
        account: {
            title: 'Admin Account',
            subtitle: 'Update the email and password used to sign in',
            role: 'Role',
            lastUpdate: 'Last update',
            name: 'Name',
            namePlaceholder: 'Admin name',
            email: 'Email',
            password: 'New password',
            passwordHint: 'Minimum 6 characters',
            passwordPlaceholder: 'Leave blank to keep the current password',
            loading: 'Loading account...',
            updated: 'Account updated successfully',
            adminUsersTitle: 'Admin Users',
            adminUsersSubtitle: 'Create a new admin user and choose the appropriate role.',
            createUser: 'Create user',
            createRole: 'Role',
            createEmailPlaceholder: 'new-admin@baligh.org',
            createPasswordPlaceholder: 'Minimum 6 characters',
            createSuccess: 'Admin user created successfully',
            currentAdmins: 'Current admin users',
            usersCount: '{count} users',
            createdOn: 'Created on {date}',
        },
        team: {
            title: 'Team Members',
            count: '{count} members',
            addMember: 'Add member',
            readOnly: 'Team members are read-only for your current role.',
            noMembers: 'No members yet. Add the first member to show on the About page.',
            editMember: 'Edit Team Member',
            addMemberTitle: 'Add Team Member',
            nameAr: 'Name (Arabic)',
            nameEn: 'Name (English)',
            roleAr: 'Role (Arabic)',
            roleEn: 'Role (English)',
            bio: 'Short bio',
            sortOrder: 'Sort order',
            sortOrderPlaceholder: 'Smaller numbers appear first',
            updated: 'Team member updated successfully',
            created: 'Team member added successfully',
            save: 'Save',
            update: 'Update',
            deleteConfirm: 'Delete this member?',
        },
        news: {
            title: 'News Articles',
            count: '{count} articles',
            add: 'Add article',
            loading: 'Loading news...',
            empty: 'No news articles yet.',
            editTitle: 'Edit News Article',
            addTitle: 'Add News Article',
            titleAr: 'Title (Arabic)',
            titleEn: 'Title (English)',
            summaryAr: 'Summary (Arabic)',
            summaryEn: 'Summary (English)',
            bodyAr: 'Body (Arabic)',
            bodyEn: 'Body (English)',
            videoUrl: 'Video URL',
            image: 'Image',
            imageUrl: 'Image URL',
            authorName: 'Author name',
            authorNameEn: 'Author name (English)',
            publishDate: 'Publish date',
            category: 'Category',
            publishNow: 'Publish now',
            save: 'Save article',
            update: 'Update article',
            updated: 'Article updated successfully',
            created: 'Article created successfully',
            deleteConfirm: 'Delete this article?',
            deleteError: 'Failed to delete article',
        },
        reports: {
            title: 'Reports & Studies',
            count: '{count} entries',
            add: 'Add report',
            loading: 'Loading reports...',
            empty: 'No reports yet.',
            editTitle: 'Edit Report / Study',
            addTitle: 'Add Report / Study',
            titleAr: 'Title (Arabic)',
            titleEn: 'Title (English)',
            authorAr: 'Author name',
            authorEn: 'Author name (English)',
            summaryAr: 'Summary (Arabic)',
            summaryEn: 'Summary (English)',
            bodyAr: 'Body (Arabic)',
            bodyEn: 'Body (English)',
            image: 'Image',
            imageUrl: 'Image URL',
            documentAr: 'Arabic PDF',
            documentEn: 'English PDF',
            documentHintAr: 'Or paste the Arabic PDF URL',
            documentHintEn: 'Or paste the English PDF URL',
            attachedAr: 'Attached (AR)',
            attachedEn: 'Attached (EN)',
            uploadAr: 'Uploading Arabic PDF...',
            uploadEn: 'Uploading English PDF...',
            category: 'Category',
            publishNow: 'Publish now',
            save: 'Save report',
            update: 'Update report',
            updated: 'Report updated successfully',
            created: 'Report created successfully',
            deleteConfirm: 'Delete this report?',
            pdfUploaded: 'PDF uploaded successfully',
            pdfOnly: 'Only PDF files are allowed',
            pdfMaxSize: 'Maximum PDF size is 20MB',
            deleteError: 'Failed to delete report',
        },
        imagePicker: {
            libraryTitle: 'File Library',
            refresh: 'Refresh',
            uploadImage: 'Upload image',
            uploading: 'Uploading...',
            close: 'Close',
            loading: 'Loading...',
            noImages: 'No images uploaded yet.',
            noPdfs: 'No PDF files uploaded yet.',
            images: 'Images',
            pdfs: 'PDF Files',
            deleteImageConfirm: 'Delete this file permanently?',
            deleteTitle: 'Delete file',
            openFile: 'Open file',
            imageUrl: 'Image URL',
        },
        legal: {
            title: 'Legal Reports',
            readOnly: 'Reports are read-only for your current role.',
            reportNumber: 'Report number',
            fromDate: 'From date',
            toDate: 'To date',
            severity: 'Severity',
            allSeverities: 'All severities',
            applyFilters: 'Apply filters',
            reset: 'Reset',
            exportCsv: 'Export CSV',
            loadingFiltered: 'Loading filtered results...',
            reportsFound: '{count} reports',
            loading: 'Loading legal reports...',
            empty: 'No legal reports yet.',
            searchByReport: 'Search by report number only',
            startDateAfterEnd: 'Start date cannot be later than end date.',
            deleteConfirm: 'Delete this report?',
            deleteTitle: 'Delete report',
            humanReview: 'Human review',
            escalated: 'Escalated',
            postText: 'Post text',
            noPostText: 'No original post text was stored for this report.',
            postImages: 'Post images',
            targetGroup: 'Target group',
            speechType: 'Speech type',
            hatefulWords: 'Hateful words',
            reportDetail: 'Report detail',
            classification: 'Classification',
            riskLevel: 'Risk level',
            imageDescription: 'Image description',
            storedImages: 'Stored images',
            postImagesAndAttachments: 'Post images and attachments',
            openFile: 'Open file',
            pdfDocument: 'PDF document',
            attachment: 'Attachment',
            image: 'Image',
            noOriginalImageTitle: 'No original image file is stored',
            noOriginalImageBody: 'This report only has an image description in the analysis data. The dashboard can show the actual image only when the original upload URL was saved with the report.',
            reviewWorkflow: 'Human review workflow',
            reviewWorkflowSubtitle: 'Analysts can update status and add an internal note without deleting the report.',
            reviewStatus: 'Review status',
            currentInternalState: 'Current internal state',
            internalReviewNote: 'Internal review note',
            internalReviewPlaceholder: 'Add analyst note or follow-up summary',
            internalOnlyNote: 'The reporter is not notified from this panel. All updates remain internal only.',
            saveReviewUpdate: 'Save review update',
            reviewSavedTitle: 'Saved',
            reviewSavedBody: 'Review status updated successfully.',
            reasoning: 'Reasoning',
            platform: 'Platform',
            postLink: 'Post link',
            immediateDanger: 'Immediate danger',
            reportSummary: 'Report summary',
        },
        radar: {
            title: 'Radar Control',
            description: 'The public radar page no longer updates automatically from new database records. New data stays stored in the site, but it will not appear in the radar until you publish a fresh snapshot from here.',
            saveDescriptions: 'Save Descriptions Only',
            savingDescriptions: 'Saving descriptions...',
            saveDescriptionsSuccess: 'Radar descriptions were saved successfully on the current published snapshot.',
            saveDescriptionsUnavailable: 'Publish a radar snapshot first before saving descriptions only.',
            updateRadar: 'Update Radar Page',
            updatingRadar: 'Updating radar...',
            rangeStart: 'Start date',
            rangeEnd: 'End date',
            rangeHelp: 'To publish a radar for a specific period, choose both a start date and an end date. Leave both empty to publish the latest 52-week window.',
            displayRange: 'Displayed range',
            descriptionsTitle: 'Radar page descriptions',
            descriptionsSubtitle: 'You can edit the descriptive text shown on the public radar page here. Changes appear publicly only after publishing a fresh radar snapshot.',
            pageSubtitleLabel: 'Radar intro description',
            classificationSubtitleLabel: 'Type of speech card description',
            targetGroupsSubtitleLabel: 'Targeted group card description',
            emotionsSubtitleLabel: 'Emotional tone card description',
            keywordsSubtitleLabel: 'Hate keyword cloud description',
            useDataUpTo: 'Use data up to date',
            useDataUpToHelp: 'Leave this empty to publish the radar from the latest available records. If a date is selected, the snapshot will include data up to the end of that day only.',
            currentSnapshot: 'Current snapshot',
            dataThrough: 'Data through',
            publishedBy: 'Published by',
            latestAvailableData: 'Latest available data',
            notPublishedYet: 'Not published yet',
            success: 'The radar page was updated successfully. The public monitoring page now shows this published snapshot only.',
            reportsInSnapshot: 'Reports in snapshot',
            averageSeverity: 'Average severity',
            escalatedReports: 'Escalated reports',
            activePlatforms: 'Active platforms',
            targetedGroups: 'Targeted groups',
            publicationHistory: 'Publication History',
            publicationHistorySubtitle: 'Latest published radar snapshots stored in the database.',
            noHistory: 'No radar snapshot has been published yet.',
            publishedAt: 'Published at',
            reports: 'Reports',
        },
        volunteerForms: {
            title: 'Volunteer Forms',
            count: '{count} forms',
            loading: 'Loading volunteer forms...',
            empty: 'No volunteer forms yet.',
            openDetails: 'View details',
            submittedAt: 'Submitted at',
            applicantName: 'Name',
            applicantEmail: 'Email',
            applicantPhone: 'Phone',
            volunteerArea: 'Volunteer area',
            background: 'Background / Specialization',
            weeklyHours: 'Weekly availability',
            motivation: 'Motivation',
            detailsTitle: 'Volunteer form details',
            detailsSubtitle: 'Internal view only. The form cannot be edited or deleted from this panel.',
            noPhone: 'Not provided',
        },
        categories: {
            news: {
                training: 'Training',
                media: 'Media Interviews',
                event: 'Event Participation',
                achievement: 'Updates',
                statement: 'Statements',
                other: 'Other',
            },
            reports: {
                initiative: 'Initiative Reports',
                analytical: 'Analytical Reports',
                study: 'Studies',
                infographic: 'Infographics',
                policy: 'Policy Briefs',
                other: 'Other',
            },
        },
        platforms: {
            facebook: 'Facebook',
            telegram: 'Telegram',
            x: 'X',
            youtube: 'YouTube',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            other: 'Other',
        },
        immediateDanger: {
            yes: 'Yes',
            no: 'No',
            unknown: 'Unknown',
        },
        riskLevels: {
            CRITICAL: 'Critical',
            HIGH: 'High',
            MEDIUM: 'Medium',
            LOW: 'Low',
        },
        reviewStatus: {
            pending: 'Pending review',
            reviewed: 'Reviewed',
            escalated: 'Escalated',
            closed: 'Closed',
            resolved: 'Closed',
            in_review: 'In review',
        },
        classifications: {
            explicit_hate_speech: 'Explicit hate speech',
            implicit_hate_speech: 'Implicit hate speech',
            incitement: 'Incitement',
            no_hate_speech: 'No hate speech',
            category_a: 'Direct incitement',
            category_b: 'Harassment / threat',
            category_c: 'Dehumanization',
            category_d: 'Low-level hate',
            safe: 'Safe content',
            none: 'No hate speech',
        },
        speechTypes: {
            direct: 'Direct',
            implicit: 'Implicit',
            symbolic: 'Symbolic',
            false_propaganda: 'False propaganda',
        },
        targetGroups: {
            druze: 'Druze',
            sunni_muslims: 'Sunni Muslims',
            sunnis: 'Sunni Muslims',
            alawites: 'Alawites',
            kurds: 'Kurds',
            arabs: 'Arabs',
            christians: 'Christians',
            women_children: 'Women/Children',
            women: 'Women/Children',
            children: 'Women/Children',
            other_groups_minorities: 'Other minorities',
            unspecified: 'Unspecified',
        },
        volunteerAreas: {
            research_analysis: 'Research and Analysis',
            monitoring_documentation: 'Monitoring and Documentation',
            technology_programming: 'Technology and Programming',
            communications_media: 'Communications and Media',
            legal_support: 'Legal Support',
            other: 'Other',
        },
        volunteerHours: {
            under_3: 'Less than 3 hours',
            between_3_7: '3 to 7 hours',
            over_7: 'More than 7 hours',
        },
        errors: {
            unauthorized: 'You must sign in to access the admin dashboard',
            permission: 'You do not have permission to perform this action',
            loadAccount: 'Failed to load account information',
            saveFailed: 'Failed to save changes',
            createFailed: 'Failed to create the user',
            loadNews: 'Failed to load news articles',
            saveNews: 'Failed to save the article',
            loadReports: 'Failed to load reports',
            saveReport: 'Failed to save the report',
            loadLegalReports: 'Failed to load legal reports',
            loadVolunteerForms: 'Failed to load volunteer forms',
            updateReview: 'Failed to update review status',
            loadRadar: 'Failed to load radar publication state',
            publishRadar: 'Failed to update the radar page',
            saveRadarDescriptions: 'Failed to save radar descriptions',
            invalidRadarRange: 'Invalid radar range',
            maxPdfSize: 'Maximum PDF size is 20MB',
            pdfOnly: 'Only PDF files are allowed',
            singleSuperAdmin: 'Only one super admin account is allowed',
            duplicateUser: 'This email address is already in use',
            generic: 'An error occurred while processing the request',
        },
    },
} as const;

const AdminI18nContext = createContext<AdminI18nValue | null>(null);

function getNestedValue(source: unknown, path: string) {
    return path.split('.').reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object' || !(segment in current)) {
            return undefined;
        }
        return (current as Record<string, unknown>)[segment];
    }, source);
}

function interpolate(template: string, values?: Record<string, Primitive | null | undefined>) {
    if (!values) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = values[key];
        return value === null || value === undefined ? '' : String(value);
    });
}

function normalizeValueKey(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[\s/\\-]+/g, '_')
        .replace(/[()]+/g, '')
        .replace(/__+/g, '_');
}

const targetGroupAliases: Record<string, string> = {
    druze: 'druze',
    الدروز: 'druze',
    دروز: 'druze',
    طائفة_الموحدين_الدروز: 'druze',
    sunni_muslims: 'sunni_muslims',
    sunni: 'sunni_muslims',
    sunnis: 'sunnis',
    muslims_sunni: 'sunni_muslims',
    muslimon_suna: 'sunni_muslims',
    مسلمون_سنة: 'sunni_muslims',
    المسلمون_السنة: 'sunni_muslims',
    المسلمون_السنه: 'sunni_muslims',
    أهل_السنة_والجماعة: 'sunni_muslims',
    السنة: 'sunni_muslims',
    السنه: 'sunni_muslims',
    misilmanên_sunnî: 'sunni_muslims',
    alawites: 'alawites',
    علويون: 'alawites',
    العلويون: 'alawites',
    العلويين: 'alawites',
    elewî: 'alawites',
    kurds: 'kurds',
    kurdish: 'kurds',
    كرد: 'kurds',
    الكرد: 'kurds',
    الأكراد: 'kurds',
    kurd: 'kurds',
    arabs: 'arabs',
    عرب: 'arabs',
    العرب: 'arabs',
    ereb: 'arabs',
    christians: 'christians',
    مسيحيين: 'christians',
    مسيحيون: 'christians',
    المسيحيين: 'christians',
    mesîhî: 'christians',
    women_children: 'women_children',
    womenchildren: 'women_children',
    women: 'women',
    نساء_أطفال: 'women_children',
    نساء_وأطفال: 'women_children',
    women_and_children: 'women_children',
    jin_zarok: 'women_children',
    other_groups_minorities: 'other_groups_minorities',
    other_minorities: 'other_groups_minorities',
    أقليات_أخرى: 'other_groups_minorities',
    الأرمن: 'other_groups_minorities',
    الإيزيديون: 'other_groups_minorities',
    الشيعة: 'other_groups_minorities',
    النازحون: 'other_groups_minorities',
    أهل_إدلب: 'other_groups_minorities',
    السريان_الآشوريين: 'other_groups_minorities',
    kêmîneyên_din: 'other_groups_minorities',
    unspecified: 'unspecified',
    غير_محدد: 'unspecified',
    nediyar: 'unspecified',
};

const classificationAliases: Record<string, string> = {
    explicit_hate_speech: 'explicit_hate_speech',
    implicit_hate_speech: 'implicit_hate_speech',
    no_hate_speech: 'no_hate_speech',
    category_a: 'category_a',
    category_b: 'category_b',
    category_c: 'category_c',
    category_d: 'category_d',
    safe: 'safe',
    none: 'none',
};

const speechTypeAliases: Record<string, string> = {
    direct: 'direct',
    implicit: 'implicit',
    symbolic: 'symbolic',
    false_propaganda: 'false_propaganda',
};

function createLocaleFormatter(locale: AdminLocale, includeTime: boolean) {
    const localeCode = locale === 'ar' ? 'ar' : 'en-US';
    const baseOptions: Intl.DateTimeFormatOptions = includeTime
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return (value: string | Date, options?: Intl.DateTimeFormatOptions) => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return new Intl.DateTimeFormat(localeCode, options || baseOptions).format(date);
    };
}

export function AdminI18nProvider({
    children,
    locale: initialLocale,
}: {
    children: ReactNode;
    locale: AdminLocale;
}) {
    const router = useRouter();
    const [isSwitchingLocale, startTransition] = useTransition();
    const locale = normalizeAdminLocale(initialLocale);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    const value = useMemo<AdminI18nValue>(() => {
        const messages = ADMIN_MESSAGES[locale];
        const fallbackMessages = ADMIN_MESSAGES.en;
        const formatDate = createLocaleFormatter(locale, false);
        const formatDateTime = createLocaleFormatter(locale, true);

        const t = (key: string, values?: Record<string, Primitive | null | undefined>) => {
            const raw = getNestedValue(messages, key) ?? getNestedValue(fallbackMessages, key);
            if (typeof raw !== 'string') {
                return key;
            }
            return interpolate(raw, values);
        };

        const setLocale = (nextLocale: AdminLocale) => {
            const resolved = normalizeAdminLocale(nextLocale);
            if (resolved === locale) {
                return;
            }

            document.cookie = `${ADMIN_LOCALE_COOKIE}=${resolved}; Path=/; Max-Age=31536000; SameSite=Lax`;
            startTransition(() => {
                router.refresh();
            });
        };

        const pickLocalizedText = (value: Record<string, string> | string | null | undefined) => {
            if (!value) {
                return '';
            }
            if (typeof value === 'string') {
                return value;
            }
            const preferred = locale === 'ar' ? value.ar || value.en : value.en || value.ar;
            return preferred || Object.values(value).find(Boolean) || '';
        };

        const translateKnownValue = (baseKey: string, aliases: Record<string, string>, rawValue: string | null | undefined) => {
            const source = (rawValue || '').trim();
            if (!source) {
                return t('common.none');
            }
            const normalized = normalizeValueKey(source);
            const key = aliases[normalized] || aliases[source] || normalized;
            const translated = getNestedValue(messages, `${baseKey}.${key}`) ?? getNestedValue(fallbackMessages, `${baseKey}.${key}`);
            return typeof translated === 'string' ? translated : source;
        };

        const translateApiError = (message: string | null | undefined) => {
            const raw = (message || '').trim();
            if (!raw) {
                return t('errors.generic');
            }
            const normalized = normalizeValueKey(raw);

            if (normalized.includes('permission') || normalized.includes('صلاحية') || normalized.includes('forbidden')) {
                return t('errors.permission');
            }
            if (normalized.includes('unauthorized') || normalized.includes('غير_مصرح') || normalized.includes('login')) {
                return t('errors.unauthorized');
            }
            if (normalized.includes('super_admin') && (normalized.includes('one') || normalized.includes('single') || normalized.includes('واحد'))) {
                return t('errors.singleSuperAdmin');
            }
            if (normalized.includes('already_exists') || normalized.includes('already_in_use') || normalized.includes('موجود')) {
                return t('errors.duplicateUser');
            }
            if (normalized.includes('failed_to_load_news') || normalized.includes('load_news')) {
                return t('errors.loadNews');
            }
            if (normalized.includes('failed_to_load_reports') || normalized.includes('load_reports')) {
                return t('errors.loadReports');
            }
            if (normalized.includes('failed_to_load_legal_reports') || normalized.includes('load_legal_reports')) {
                return t('errors.loadLegalReports');
            }
            if (normalized.includes('failed_to_load_volunteer_forms') || normalized.includes('load_volunteer_forms')) {
                return t('errors.loadVolunteerForms');
            }
            if (normalized.includes('failed_to_load_account') || normalized.includes('load_account')) {
                return t('errors.loadAccount');
            }
            if (normalized.includes('failed_to_save_article') || normalized.includes('save_article')) {
                return t('errors.saveNews');
            }
            if (normalized.includes('failed_to_save_report') || normalized.includes('save_report')) {
                return t('errors.saveReport');
            }
            if (normalized.includes('failed_to_update_review') || normalized.includes('update_review')) {
                return t('errors.updateReview');
            }
            if (normalized.includes('failed_to_load_radar') || normalized.includes('radar_publication_state')) {
                return t('errors.loadRadar');
            }
            if (normalized.includes('failed_to_publish_radar') || normalized.includes('publish_radar')) {
                return t('errors.publishRadar');
            }
            if (normalized.includes('failed_to_save_radar_descriptions') || normalized.includes('save_radar_descriptions')) {
                return t('errors.saveRadarDescriptions');
            }
            if (
                normalized.includes('invalid_radar_range')
                || normalized.includes('range_start_and_end_dates_are_both_required')
                || normalized.includes('range_start_date_cannot_be_after_end_date')
            ) {
                return t('errors.invalidRadarRange');
            }
            if (normalized.includes('20mb')) {
                return t('errors.maxPdfSize');
            }
            if (normalized.includes('pdf')) {
                return normalized.includes('allowed') || normalized.includes('يسمح')
                    ? t('errors.pdfOnly')
                    : raw;
            }

            return raw;
        };

        return {
            dir,
            locale,
            isSwitchingLocale,
            setLocale,
            t,
            formatDate,
            formatDateTime,
            pickLocalizedText,
            translateApiError,
            formatRole: (role: AdminRole) => t(`roles.${role}`),
            formatNewsCategory: (category: string) => {
                const key = normalizeValueKey(category);
                const translated = getNestedValue(messages, `categories.news.${key}`) ?? getNestedValue(fallbackMessages, `categories.news.${key}`);
                return typeof translated === 'string' ? translated : category;
            },
            formatReportCategory: (category: string) => {
                const key = normalizeValueKey(category);
                const translated = getNestedValue(messages, `categories.reports.${key}`) ?? getNestedValue(fallbackMessages, `categories.reports.${key}`);
                return typeof translated === 'string' ? translated : category;
            },
            formatPlatform: (platform) => {
                const value = (platform || '').trim();
                if (!value) return t('common.none');
                const key = normalizeValueKey(value);
                const translated = getNestedValue(messages, `platforms.${key}`) ?? getNestedValue(fallbackMessages, `platforms.${key}`);
                return typeof translated === 'string' ? translated : value;
            },
            formatImmediateDanger: (value) => {
                const source = (value || '').trim();
                if (!source) return t('common.none');
                const key = normalizeValueKey(source);
                const translated = getNestedValue(messages, `immediateDanger.${key}`) ?? getNestedValue(fallbackMessages, `immediateDanger.${key}`);
                return typeof translated === 'string' ? translated : source;
            },
            formatClassification: (value) => translateKnownValue('classifications', classificationAliases, value),
            formatRiskLevel: (value) => {
                const source = (value || '').trim();
                if (!source) return t('common.none');
                const translated = getNestedValue(messages, `riskLevels.${source.toUpperCase()}`) ?? getNestedValue(fallbackMessages, `riskLevels.${source.toUpperCase()}`);
                return typeof translated === 'string' ? translated : source;
            },
            formatSpeechType: (value) => {
                const translated = translateKnownValue('speechTypes', speechTypeAliases, value);
                const source = (value || '').trim();
                if (!source) {
                    return translated;
                }
                return translated === source
                    ? translateKnownValue('classifications', classificationAliases, value)
                    : translated;
            },
            formatReviewStatus: (value) => {
                const source = (value || '').trim();
                if (!source) return t('common.none');
                const key = normalizeValueKey(source);
                const translated = getNestedValue(messages, `reviewStatus.${key}`) ?? getNestedValue(fallbackMessages, `reviewStatus.${key}`);
                return typeof translated === 'string' ? translated : source;
            },
            formatTargetGroup: (value) => translateKnownValue('targetGroups', targetGroupAliases, value),
            formatVolunteerArea: (value) => {
                const source = (value || '').trim();
                if (!source) return t('common.none');
                const key = normalizeValueKey(source);
                const translated = getNestedValue(messages, `volunteerAreas.${key}`) ?? getNestedValue(fallbackMessages, `volunteerAreas.${key}`);
                return typeof translated === 'string' ? translated : source;
            },
            formatVolunteerHours: (value) => {
                const source = (value || '').trim();
                if (!source) return t('common.none');
                const key = normalizeValueKey(source);
                const translated = getNestedValue(messages, `volunteerHours.${key}`) ?? getNestedValue(fallbackMessages, `volunteerHours.${key}`);
                return typeof translated === 'string' ? translated : source;
            },
        };
    }, [dir, isSwitchingLocale, locale, router, startTransition]);

    return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
    const context = useContext(AdminI18nContext);

    if (!context) {
        throw new Error('useAdminI18n must be used within AdminI18nProvider');
    }

    return context;
}

export function AdminLocaleSwitcher() {
    const { locale, setLocale, t, isSwitchingLocale } = useAdminI18n();

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">{t('common.language')}</span>
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                {(['ar', 'en'] as const).map((item) => (
                    <button
                        key={item}
                        type="button"
                        disabled={isSwitchingLocale}
                        onClick={() => setLocale(item)}
                        className={`px-3 py-2 text-sm font-semibold transition ${
                            locale === item
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {item === 'ar' ? t('common.arabic') : t('common.english')}
                    </button>
                ))}
            </div>
        </div>
    );
}
