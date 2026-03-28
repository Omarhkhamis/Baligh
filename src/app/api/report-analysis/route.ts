import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { getGeminiModelName } from '@/lib/gemini';
import {
    analyzeContent,
    extractTextFromImage,
    INVALID_AI_JSON_RESPONSE_MESSAGE,
} from '@/lib/analysis-service';
import { getSeverityScoreOutOfFive, mapRiskLevel } from '@/lib/analysis-utils';
import { generateReportNumber, isUniqueConstraintError } from '@/lib/report-number';
import {
    consumeReportSubmissionRateLimit,
    getRequestIp,
    REPORT_SUBMISSION_RATE_LIMIT_MESSAGE,
} from '@/lib/report-submission-rate-limit';
import { createEscalationDashboardAlerts, sendEscalationEmail } from '@/lib/admin-notifications';
import {
    buildEncryptedAnalysisLogFields,
    encryptSensitiveStringArray,
    toDateOnlyTimestamp,
} from '@/lib/data-security';
import { buildStructuredAiFields } from '@/lib/structured-report-fields';
import {
    canonicalizeKnownTargetGroupValues,
    getCanonicalTargetGroupLabelsFromKeys,
    getTargetGroupKeyFromValue,
    type TargetGroupKey,
} from '@/lib/target-groups';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'report-evidence');
const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ATTACHMENT_COUNT = 3;
const AI_TIMEOUT_MS = 30_000;
const AI_TIMEOUT_MESSAGE = 'AI analysis timed out';
const MANUAL_REVIEW_MESSAGE = 'Your report was received and will be reviewed manually';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tif', '.tiff']);
const PDF_EXTENSION = '.pdf';
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff']);
const PDF_MIME_TYPES = new Set(['application/pdf']);
const REPORT_PLATFORM_VALUES = ['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other'] as const;
const DIRECT_RISK_VALUES = ['yes', 'no', 'unknown'] as const;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReportPlatformValue = (typeof REPORT_PLATFORM_VALUES)[number];
type DirectRiskValue = (typeof DIRECT_RISK_VALUES)[number];

type ReportPayload = {
    locale?: string;
    platform?: string;
    platform_label?: string;
    post_link?: string;
    post_url?: string;
    text?: string;
    image_urls?: string[] | string;
    target_group?: string;
    target_groups?: string[] | string;
    target_group_labels?: string[] | string;
    immediate_danger?: string;
    is_direct_risk?: string;
    immediate_danger_label?: string;
    is_direct_risk_label?: string;
};

type ParsedReportPayload = Omit<ReportPayload, 'target_groups' | 'target_group_labels'> & {
    target_groups?: string[];
    target_group_labels?: string[];
    image_urls?: string[];
    imageFiles: File[];
};

type StoredUpload = {
    url: string;
    filepath: string;
    mimeType: string;
    originalName: string;
    kind: 'image' | 'pdf';
};

type AnalysisImageContext = {
    extracted_text: string;
    image_description: string;
} | null;

type SuccessfulAutomationResult = {
    ok: true;
    analysis: Awaited<ReturnType<typeof analyzeContent>>;
    imageContext: AnalysisImageContext;
};

type FailedAutomationResult = {
    ok: false;
    errorMessage: string;
};

function getStringValue(value: FormDataEntryValue | null): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    return normalized ? normalized : undefined;
}

function normalizeStringArray(value: unknown): string[] | undefined {
    if (Array.isArray(value)) {
        const normalized = value
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => entry.trim())
            .filter(Boolean);
        return normalized.length > 0 ? normalized : undefined;
    }

    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return normalizeStringArray(parsed);
        }
    } catch {
        // Fall back to comma-separated parsing below.
    }

    const normalized = trimmed
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

    return normalized.length > 0 ? normalized : undefined;
}

function normalizePlatformValue(value: string | undefined): ReportPlatformValue {
    return REPORT_PLATFORM_VALUES.includes((value || '') as ReportPlatformValue)
        ? ((value || 'other') as ReportPlatformValue)
        : 'other';
}

function normalizeDirectRiskValue(value: string | undefined): DirectRiskValue {
    return DIRECT_RISK_VALUES.includes((value || '') as DirectRiskValue)
        ? ((value || 'unknown') as DirectRiskValue)
        : 'unknown';
}

async function ensureUploadDir() {
    await fs.mkdir(uploadDir, { recursive: true });
}

function resolveFileExtension(file: File) {
    const ext = path.extname(file.name || '').toLowerCase();
    if (ext === PDF_EXTENSION || file.type === 'application/pdf') {
        return PDF_EXTENSION;
    }
    if (ext === '.gif' || file.type === 'image/gif') {
        return '.gif';
    }
    if (ext === '.bmp' || file.type === 'image/bmp') {
        return '.bmp';
    }
    if (ext === '.tif' || ext === '.tiff' || file.type === 'image/tiff') {
        return '.tiff';
    }
    if (ext === '.png' || file.type === 'image/png') {
        return '.png';
    }
    if (ext === '.jpg' || ext === '.jpeg' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return '.jpg';
    }
    if (isImageFile(file)) {
        return ext || '.jpg';
    }

    const mimeMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        'image/tiff': '.tiff',
        'application/pdf': '.pdf',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
    };

    return mimeMap[file.type] || '.jpg';
}

function isImageFile(file: File) {
    const ext = path.extname(file.name || '').toLowerCase();
    return file.type.startsWith('image/') || IMAGE_MIME_TYPES.has(file.type) || IMAGE_EXTENSIONS.has(ext);
}

function isPdfFile(file: File) {
    const ext = path.extname(file.name || '').toLowerCase();
    return PDF_MIME_TYPES.has(file.type) || ext === PDF_EXTENSION;
}

function isSupportedFile(file: File) {
    return isImageFile(file) || isPdfFile(file);
}

function resolveStoredMimeType(file: File) {
    const extension = resolveFileExtension(file);
    if (extension === '.pdf') {
        return 'application/pdf';
    }
    if (extension === '.gif') {
        return 'image/gif';
    }
    if (extension === '.bmp') {
        return 'image/bmp';
    }
    if (extension === '.tif' || extension === '.tiff') {
        return 'image/tiff';
    }
    if (extension === '.png') {
        return 'image/png';
    }
    if (extension === '.webp') {
        return 'image/webp';
    }
    if (extension === '.svg') {
        return 'image/svg+xml';
    }
    return 'image/jpeg';
}

function normalizeStoredUploadUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const withoutQuery = trimmed.split('?')[0]?.split('#')[0] || trimmed;
    let pathname = withoutQuery;

    if (/^https?:\/\//i.test(withoutQuery)) {
        try {
            pathname = new URL(withoutQuery).pathname;
        } catch {
            return null;
        }
    }

    const normalized = pathname.replace(/\\/g, '/');
    let filename = normalized;

    if (normalized.startsWith('/uploads/report-evidence/')) {
        filename = normalized.slice('/uploads/report-evidence/'.length);
    } else if (normalized.startsWith('uploads/report-evidence/')) {
        filename = normalized.slice('uploads/report-evidence/'.length);
    } else if (normalized.startsWith('/')) {
        return null;
    }

    const safeFilename = path.basename(filename);
    if (!safeFilename || safeFilename !== filename || safeFilename.includes('..')) {
        return null;
    }

    return `/uploads/report-evidence/${safeFilename}`;
}

async function resolveStoredUploadFromUrl(url: string): Promise<StoredUpload | null> {
    const normalizedUrl = normalizeStoredUploadUrl(url);
    if (!normalizedUrl) {
        return null;
    }

    const filename = normalizedUrl.split('/').pop();
    if (!filename) {
        return null;
    }

    const filepath = path.join(uploadDir, filename);
    const resolvedFilepath = path.resolve(filepath);
    const resolvedUploadDir = path.resolve(uploadDir);
    if (!resolvedFilepath.startsWith(resolvedUploadDir + path.sep) && resolvedFilepath !== resolvedUploadDir) {
        return null;
    }

    try {
        await fs.access(resolvedFilepath);
    } catch {
        return null;
    }

    const extension = path.extname(filename).toLowerCase();
    const kind = extension === PDF_EXTENSION ? 'pdf' : 'image';
    const mimeType = kind === 'pdf'
        ? 'application/pdf'
        : extension === '.png'
            ? 'image/png'
            : extension === '.gif'
                ? 'image/gif'
                : extension === '.bmp'
                    ? 'image/bmp'
                    : extension === '.tif' || extension === '.tiff'
                        ? 'image/tiff'
                        : extension === '.webp'
                            ? 'image/webp'
                            : extension === '.svg'
                                ? 'image/svg+xml'
                                : 'image/jpeg';

    return {
        url: normalizedUrl,
        filepath: resolvedFilepath,
        mimeType,
        originalName: filename,
        kind,
    };
}

async function resolveStoredUploads(urls: string[]) {
    const resolved = await Promise.all(urls.map((url) => resolveStoredUploadFromUrl(url)));
    return resolved.filter((upload): upload is StoredUpload => Boolean(upload));
}

async function stripImageMetadata(file: File) {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const mimeType = resolveStoredMimeType(file);

    try {
        if (mimeType === 'image/png') {
            return await sharp(originalBuffer).rotate().png().toBuffer();
        }
        if (mimeType === 'image/webp') {
            return await sharp(originalBuffer).rotate().webp().toBuffer();
        }
        if (mimeType === 'image/tiff') {
            return await sharp(originalBuffer).rotate().tiff().toBuffer();
        }
        if (mimeType === 'image/jpeg') {
            return await sharp(originalBuffer).rotate().jpeg().toBuffer();
        }

        // Keep unsupported or metadata-light formats unchanged.
        return originalBuffer;
    } catch {
        return originalBuffer;
    }
}

async function saveUploadedFile(file: File): Promise<StoredUpload> {
    if (!isSupportedFile(file)) {
        throw new Error('Please upload image or PDF files only.');
    }

    const buffer = isImageFile(file)
        ? await stripImageMetadata(file)
        : Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error('Each image must be no larger than 5MB.');
    }

    await ensureUploadDir();

    const extension = resolveFileExtension(file);
    const filename = `report-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    return {
        url: `/uploads/report-evidence/${filename}`,
        filepath,
        mimeType: resolveStoredMimeType(file),
        originalName: file.name || filename,
        kind: isPdfFile(file) ? 'pdf' : 'image',
    };
}

async function buildInlineImageDataFromStoredUpload(upload: StoredUpload) {
    const buffer = await fs.readFile(upload.filepath);
    return `data:${upload.mimeType};base64,${buffer.toString('base64')}`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
    let timeoutHandle: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
    }) as Promise<T>;
}

function isInvalidAiJsonError(error: unknown) {
    return error instanceof Error && error.message === INVALID_AI_JSON_RESPONSE_MESSAGE;
}

function toApiClassification(value: string | undefined) {
    const normalized = String(value || '').trim().toLowerCase();

    if (normalized === 'explicit') return 'explicit hate speech';
    if (normalized === 'implicit') return 'implicit hate speech';
    if (normalized === 'incitement') return 'incitement';
    return 'no hate speech';
}

async function deleteStoredFiles(storedFiles: StoredUpload[]) {
    if (storedFiles.length === 0) {
        return;
    }

    await Promise.all(
        storedFiles.map(async (storedFile) => {
            try {
                await fs.unlink(storedFile.filepath);
            } catch {
                // Ignore cleanup failures after a failed submission.
            }
        })
    );
}

async function parseReportPayload(req: NextRequest): Promise<ParsedReportPayload> {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const imageValues = formData
            .getAll('images')
            .filter((value): value is File => value instanceof File && value.size > 0);
        const legacyImageValue = formData.get('image');
        const imageFiles = imageValues.length
            ? imageValues
            : legacyImageValue instanceof File && legacyImageValue.size > 0
                ? [legacyImageValue]
                : [];

        return {
            locale: getStringValue(formData.get('locale')),
            platform: getStringValue(formData.get('platform')),
            platform_label: getStringValue(formData.get('platform_label')),
            post_link: getStringValue(formData.get('post_link')) || getStringValue(formData.get('post_url')),
            text: getStringValue(formData.get('text')),
            image_urls: normalizeStringArray(formData.getAll('image_urls').map((value) => typeof value === 'string' ? value : '').filter(Boolean)),
            target_group: getStringValue(formData.get('target_group')),
            target_groups: normalizeStringArray(formData.get('target_groups')),
            target_group_labels: normalizeStringArray(formData.get('target_group_labels')),
            immediate_danger: getStringValue(formData.get('immediate_danger')) || getStringValue(formData.get('is_direct_risk')),
            immediate_danger_label: getStringValue(formData.get('immediate_danger_label')) || getStringValue(formData.get('is_direct_risk_label')),
            imageFiles,
        };
    }

    const body = (await req.json()) as ReportPayload;
    return {
        ...body,
        post_link: body.post_link?.trim() || body.post_url?.trim(),
        image_urls: normalizeStringArray(body.image_urls),
        target_groups: normalizeStringArray(body.target_groups),
        target_group_labels: normalizeStringArray(body.target_group_labels),
        immediate_danger: body.immediate_danger?.trim() || body.is_direct_risk?.trim(),
        immediate_danger_label: body.immediate_danger_label?.trim() || body.is_direct_risk_label?.trim(),
        imageFiles: [],
    };
}

async function runAutomatedAnalysis(input: {
    text: string;
    locale: string;
    imageUploads: StoredUpload[];
}): Promise<SuccessfulAutomationResult | FailedAutomationResult> {
    const { text, locale, imageUploads } = input;
    const primaryAnalysisImage = imageUploads.find((upload) => upload.kind === 'image');

    let imageContext: AnalysisImageContext = null;

    try {
        if (!text && primaryAnalysisImage) {
            const imageContextParts = await Promise.all(
                imageUploads
                    .filter((upload) => upload.kind === 'image')
                    .map(async (upload) => ({
                        extracted_text: await withTimeout(
                            extractTextFromImage({
                                image: await buildInlineImageDataFromStoredUpload(upload),
                                locale,
                            }),
                            AI_TIMEOUT_MS,
                            AI_TIMEOUT_MESSAGE
                        ),
                        image_description: '',
                    }))
            );

            imageContext = {
                extracted_text: imageContextParts
                    .map((part) => part.extracted_text)
                    .filter(Boolean)
                    .join('\n\n')
                    .trim(),
                image_description: imageContextParts
                    .map((part) => part.image_description)
                    .filter(Boolean)
                    .join(' | ')
                    .trim(),
            };
        }

        const analysisText = text || imageContext?.extracted_text || undefined;
        const analysisImage = primaryAnalysisImage
            ? await buildInlineImageDataFromStoredUpload(primaryAnalysisImage)
            : undefined;

        let analysis: Awaited<ReturnType<typeof analyzeContent>> | null = null;

        for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
                analysis = await withTimeout(
                    analyzeContent({
                        text: analysisText,
                        image: analysisImage,
                        locale,
                    }),
                    AI_TIMEOUT_MS,
                    AI_TIMEOUT_MESSAGE
                );
                break;
            } catch (error) {
                if (isInvalidAiJsonError(error) && attempt === 0) {
                    continue;
                }

                throw error;
            }
        }

        if (!analysis) {
            return {
                ok: false,
                errorMessage: INVALID_AI_JSON_RESPONSE_MESSAGE,
            };
        }

        return {
            ok: true,
            analysis,
            imageContext,
        };
    } catch (error) {
        return {
            ok: false,
            errorMessage: error instanceof Error && error.message ? error.message : 'AI analysis failed',
        };
    }
}

async function saveFailedReportSubmission(input: {
    submittedAt: Date;
    reportNumber: string;
    platform: string;
    platformLabel?: string;
    postLink: string;
    text: string;
    locale: string;
    targetGroupLabels: string[];
    targetGroupKeys: string[];
    immediateDanger: string;
    immediateDangerLabel?: string;
    storedUploads: StoredUpload[];
    failureReason: string;
}) {
    const {
        submittedAt,
        reportNumber,
        platform,
        platformLabel,
        postLink,
        text,
        locale,
        targetGroupLabels,
        targetGroupKeys,
        immediateDanger,
        immediateDangerLabel,
        storedUploads,
        failureReason,
    } = input;

    const details = [
        `Platform: ${platform}`,
        `Post link: ${postLink}`,
        `Target groups: ${targetGroupLabels.join(', ') || '—'}`,
        `Immediate danger: ${immediateDanger}`,
        storedUploads.length > 0 ? `Attached files: ${storedUploads.length}` : null,
        'AI status: failed',
    ]
        .filter(Boolean)
        .join('\n');

    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            const saved = await prisma.$transaction(async (tx) => {
                const uniqueReportNumber =
                    attempt > 0 ? await generateReportNumber(tx, submittedAt, attempt) : reportNumber;

                const analysisLog = await tx.analysisLog.create({
                    data: {
                        ...buildEncryptedAnalysisLogFields(text, targetGroupLabels),
                        classification: 'Manual review required',
                        riskLevel: 'LOW',
                        confidenceScore: 0,
                        aiScores: {
                            analysisProvider: 'gemini',
                            analysisStatus: 'failed',
                            failureReason,
                            manualReviewMessage: MANUAL_REVIEW_MESSAGE,
                            postLink,
                            platform,
                            platformLabel: platformLabel || platform,
                            immediateDanger: immediateDanger,
                            immediateDangerLabel: immediateDangerLabel || immediateDanger,
                            target_groups: targetGroupLabels,
                            target_group_keys: targetGroupKeys,
                            attachmentCount: storedUploads.length,
                            hasAttachments: storedUploads.length > 0,
                            ref_number: uniqueReportNumber,
                            received_date: submittedAt.toISOString().slice(0, 10),
                            locale,
                            source: 'report-modal',
                        },
                        createdAt: submittedAt,
                    },
                });

                const legalReport = await tx.legalReport.create({
                    data: {
                        analysisLogId: analysisLog.id,
                        title: 'Submitted report - manual review',
                        details,
                        aiProcessingStatus: 'failed',
                        reportNumber: uniqueReportNumber,
                        escalationFlag: false,
                        humanReviewStatus: 'pending',
                        platform: normalizePlatformValue(platform),
                        postUrl: postLink,
                        imageUrls: encryptSensitiveStringArray(storedUploads.map((storedUpload) => storedUpload.url)),
                        targetGroupsUser: targetGroupLabels,
                        isDirectRisk: normalizeDirectRiskValue(immediateDanger),
                        createdAt: submittedAt,
                    },
                });

                return { analysisLog, legalReport };
            });

            return saved;
        } catch (error) {
            if (isUniqueConstraintError(error) && attempt < 4) {
                continue;
            }

            throw error;
        }
    }

    throw new Error('Failed to generate report number');
}

export async function POST(req: NextRequest) {
    const rateLimitResult = consumeReportSubmissionRateLimit(getRequestIp(req.headers));
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: REPORT_SUBMISSION_RATE_LIMIT_MESSAGE,
            },
            { status: 429 }
        );
    }

    let storedFiles: StoredUpload[] = [];

    try {
        const body = await parseReportPayload(req);
        const {
            locale = 'ar',
            platform,
            platform_label,
            post_link,
            text,
            image_urls,
            target_group,
            target_groups,
            target_group_labels,
            immediate_danger,
            immediate_danger_label,
            imageFiles,
        } = body;

        const referencedImageUrls = image_urls || [];
        if (imageFiles.length + referencedImageUrls.length > MAX_ATTACHMENT_COUNT) {
            return NextResponse.json({ error: `You can upload up to ${MAX_ATTACHMENT_COUNT} images per report.` }, { status: 400 });
        }

        if (!platform) {
            return NextResponse.json({ error: 'Which platform did you see this content on?' }, { status: 400 });
        }
        if (!post_link) {
            return NextResponse.json({ error: 'Post URL is required' }, { status: 400 });
        }
        if (!immediate_danger) {
            return NextResponse.json({ error: 'Do you think this poses a direct threat? Please select an answer' }, { status: 400 });
        }

        const normalizedText = text?.trim() || '';
        const selectedTargetGroupKeys: TargetGroupKey[] = (target_groups || [])
            .map((value) => getTargetGroupKeyFromValue(value))
            .filter((value): value is TargetGroupKey => value !== null);
        const selectedTargetGroupLabels = selectedTargetGroupKeys.length > 0
            ? getCanonicalTargetGroupLabelsFromKeys(selectedTargetGroupKeys)
            : canonicalizeKnownTargetGroupValues(
                target_group_labels?.length
                    ? target_group_labels
                    : target_group
                        ? [target_group]
                        : getCanonicalTargetGroupLabelsFromKeys(target_groups || [])
            );
        const selectedTargetGroupText = selectedTargetGroupLabels.join(', ');

        if (imageFiles.length > 0) {
            for (const imageFile of imageFiles) {
                storedFiles.push(await saveUploadedFile(imageFile));
            }
        }

        const referencedUploads = await resolveStoredUploads(referencedImageUrls);
        const allStoredUploads = [...referencedUploads, ...storedFiles];
        const hasProcessableImage = allStoredUploads.some((upload) => upload.kind === 'image');

        if (!normalizedText && !hasProcessableImage) {
            return NextResponse.json({ error: 'Please enter the post text at minimum' }, { status: 400 });
        }

        const submittedAt = toDateOnlyTimestamp(new Date());
        let reportNumber = await prisma.$transaction(async (tx) => generateReportNumber(tx, submittedAt));

        const automationResult = await runAutomatedAnalysis({
            text: normalizedText,
            locale,
            imageUploads: allStoredUploads,
        });
        const analysisInputText = normalizedText || (automationResult.ok ? automationResult.imageContext?.extracted_text || '' : '');

        if (!automationResult.ok) {
            const saved = await saveFailedReportSubmission({
                submittedAt,
                reportNumber,
                platform,
                platformLabel: platform_label,
                postLink: post_link,
                text: analysisInputText,
                locale,
                targetGroupLabels: selectedTargetGroupLabels,
                targetGroupKeys: selectedTargetGroupKeys,
                immediateDanger: immediate_danger,
                immediateDangerLabel: immediate_danger_label,
                storedUploads: allStoredUploads,
                failureReason: automationResult.errorMessage,
            });

            return NextResponse.json({
                success: true,
                ref_number: saved.legalReport.reportNumber,
                analysis: {
                    classification: '',
                    severity: 0,
                    severity_explanation: '',
                    recommended_path: 'documentation',
                    path_sentence: MANUAL_REVIEW_MESSAGE,
                    processing_status: 'failed',
                },
                result: {
                    classification: '',
                    violation_type: '',
                    severity_score: 0,
                    rationale_arabic: MANUAL_REVIEW_MESSAGE,
                    reasoning_ar: MANUAL_REVIEW_MESSAGE,
                    ai_classification: 'none',
                    ai_severity: 0,
                    ai_severity_explanation: MANUAL_REVIEW_MESSAGE,
                    ai_recommended_path: 'documentation',
                    ai_path_sentence: MANUAL_REVIEW_MESSAGE,
                    ai_processing_status: 'failed',
                    text: analysisInputText,
                },
                reportNumber: saved.legalReport.reportNumber,
                analysisId: saved.analysisLog.id,
                legalReportId: saved.legalReport.id,
                submittedAt: submittedAt.toISOString(),
                message: MANUAL_REVIEW_MESSAGE,
            });
        }

        const imageContext = automationResult.imageContext;
        const analysisResponse = automationResult.analysis;
        const classificationValue = String(analysisResponse.classification || '').trim().toLowerCase();
        const shouldApplySeverityFloor =
            classificationValue !== 'no hate speech' &&
            classificationValue !== 'safe' &&
            String(analysisResponse.violation_type || '').trim().toLowerCase() !== 'none';
        const analysis = {
            ...analysisResponse,
            severity_score: shouldApplySeverityFloor
                ? Math.max(Number(analysisResponse.severity_score || 0), 2)
                : Number(analysisResponse.severity_score || 0),
        };
        const severity = Math.max(0, Math.min(9.9999, Number(analysis.severity_score || 0)));
        const severityBucket = getSeverityScoreOutOfFive(severity);
        const escalationFlag = severityBucket === 5;
        const humanReviewStatus = escalationFlag ? 'escalated' : 'pending';
        const riskLevel = mapRiskLevel(
            analysis.violation_type ?? analysis.risk_level ?? analysis.classification
        );

        const detectedKeywords = Array.from(
            new Set([
                ...(analysis.detected_markers || []),
                analysis.target_group_arabic || '',
                ...selectedTargetGroupLabels,
            ].filter(Boolean))
        );
        const structuredAi = buildStructuredAiFields({
            analysis,
            selectedTargetGroupLabels,
            analysisText: analysisInputText,
            hasImage: allStoredUploads.length > 0,
            escalationFlag,
        });
        const aiHateKeywords =
            structuredAi.aiHateKeywords.length > 0 ? structuredAi.aiHateKeywords : detectedKeywords;
        const {
            detected_markers: _detectedMarkers,
            ai_hate_keywords: _aiHateKeywords,
            ai_notes: _aiNotes,
            ai_legal_basis: _aiLegalBasis,
            ...analysisForStorage
        } = analysis;

        const details = [
            `Platform: ${platform}`,
            `Post link: ${post_link}`,
            `Target groups: ${selectedTargetGroupText || '—'}`,
            `Immediate danger: ${immediate_danger}`,
            allStoredUploads.length > 0 ? `Attached files: ${allStoredUploads.length}` : null,
            `Reasoning: ${analysis.rationale_arabic || analysis.rationale || ''}`,
            (analysis.image_description || imageContext?.image_description) ? `Image description: ${analysis.image_description || imageContext?.image_description}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const saved = await prisma.$transaction(async (tx) => {
                    if (attempt > 0) {
                        reportNumber = await generateReportNumber(tx, submittedAt, attempt);
                    }

                    const analysisLog = await tx.analysisLog.create({
                        data: {
                            ...buildEncryptedAnalysisLogFields(analysisInputText, aiHateKeywords),
                            classification: analysis.classification,
                            riskLevel,
                            confidenceScore: severity,
                            aiClassification: structuredAi.aiClassification,
                            aiSeverity: structuredAi.aiSeverity,
                            aiSeverityExplanation: structuredAi.aiSeverityExplanation,
                            aiSpeechType: structuredAi.aiSpeechType,
                            aiConfidence: structuredAi.aiConfidence,
                            aiContextSensitivity: structuredAi.aiContextSensitivity,
                            aiTargetGroups: structuredAi.aiTargetGroups,
                            aiSymbolicReferences: structuredAi.aiSymbolicReferences,
                            aiEmotionsDetected: structuredAi.aiEmotionsDetected,
                            aiDehumanizationLevel: structuredAi.aiDehumanizationLevel,
                            aiGeneralizationType: structuredAi.aiGeneralizationType,
                            aiAccountType: structuredAi.aiAccountType,
                            aiReachLevel: structuredAi.aiReachLevel,
                            aiContentType: structuredAi.aiContentType,
                            aiLanguageRegister: structuredAi.aiLanguageRegister,
                            aiConflictContext: structuredAi.aiConflictContext,
                            aiPublisherLocation: structuredAi.aiPublisherLocation,
                            aiRecommendedPath: structuredAi.aiRecommendedPath,
                            aiPathSentence: structuredAi.aiPathSentence,
                            aiLegalBasis: structuredAi.aiLegalBasis,
                            aiEscalationFlag: structuredAi.aiEscalationFlag,
                            aiIncitementToAction: structuredAi.aiIncitementToAction,
                            aiGlorificationOfViolence: structuredAi.aiGlorificationOfViolence,
                            aiNotes: structuredAi.aiNotes,
                            aiScores: {
                                ...analysisForStorage,
                                rationale: analysis.rationale_arabic || analysis.rationale || '',
                                reasoning: analysis.rationale_arabic || analysis.rationale || '',
                                analysisProvider: 'gemini',
                                analysisModel: getGeminiModelName(),
                                target_group: selectedTargetGroupText,
                                targetGroup: selectedTargetGroupText,
                                target_group_label: selectedTargetGroupText || analysis.target_group_arabic || '',
                                target_groups: selectedTargetGroupLabels,
                                targetGroups: selectedTargetGroupLabels,
                                target_group_keys: selectedTargetGroupKeys,
                                targetGroupKeys: selectedTargetGroupKeys,
                                postLink: post_link,
                                platform,
                                platformLabel: platform_label || platform,
                                immediateDanger: immediate_danger,
                                immediateDangerLabel: immediate_danger_label || immediate_danger,
                                attachmentCount: allStoredUploads.length,
                                hasAttachments: allStoredUploads.length > 0,
                                imageContextDescription: analysis.image_description || imageContext?.image_description || null,
                                ai_classification: structuredAi.aiClassification,
                                ai_severity: structuredAi.aiSeverity,
                                ai_severity_explanation: structuredAi.aiSeverityExplanation,
                                ai_speech_type: structuredAi.aiSpeechType,
                                ai_confidence: structuredAi.aiConfidence,
                                ai_context_sensitivity: structuredAi.aiContextSensitivity,
                                ai_target_groups: structuredAi.aiTargetGroups,
                                ai_symbolic_references: structuredAi.aiSymbolicReferences,
                                ai_emotions_detected: structuredAi.aiEmotionsDetected,
                                ai_dehumanization_level: structuredAi.aiDehumanizationLevel,
                                ai_generalization_type: structuredAi.aiGeneralizationType,
                                ai_account_type: structuredAi.aiAccountType,
                                ai_reach_level: structuredAi.aiReachLevel,
                                ai_content_type: structuredAi.aiContentType,
                                ai_language_register: structuredAi.aiLanguageRegister,
                                ai_conflict_context: structuredAi.aiConflictContext,
                                ai_publisher_location: structuredAi.aiPublisherLocation,
                                ai_recommended_path: structuredAi.aiRecommendedPath,
                                ai_path_sentence: structuredAi.aiPathSentence,
                                ai_escalation_flag: structuredAi.aiEscalationFlag,
                                ai_incitement_to_action: structuredAi.aiIncitementToAction,
                                ai_glorification_of_violence: structuredAi.aiGlorificationOfViolence,
                                escalation_flag: escalationFlag,
                                escalationFlag,
                                human_review_status: humanReviewStatus,
                                humanReviewStatus,
                                ref_number: reportNumber,
                                received_date: submittedAt.toISOString().slice(0, 10),
                                locale,
                                source: 'report-modal',
                            },
                            createdAt: submittedAt,
                        },
                    });

                    const legalReport = await tx.legalReport.create({
                        data: {
                            analysisLogId: analysisLog.id,
                            title: `Submitted report - ${analysis.classification}`,
                            details,
                            aiProcessingStatus: 'done',
                            reportNumber,
                            escalationFlag,
                            humanReviewStatus,
                            platform: normalizePlatformValue(platform),
                            postUrl: post_link,
                            imageUrls: encryptSensitiveStringArray(allStoredUploads.map((storedFile) => storedFile.url)),
                            targetGroupsUser: selectedTargetGroupLabels,
                            isDirectRisk: normalizeDirectRiskValue(immediate_danger),
                            createdAt: submittedAt,
                        },
                    });

                    if (escalationFlag) {
                        await createEscalationDashboardAlerts(tx, reportNumber);
                    }

                    return { analysisLog, legalReport };
                });

                if (escalationFlag) {
                    try {
                        await sendEscalationEmail(reportNumber);
                    } catch (notificationError) {
                        console.error('Failed to send escalation email:', notificationError);
                    }
                }

                const {
                    ai_hate_keywords: _responseAiHateKeywords,
                    ai_notes: _responseAiNotes,
                    ai_legal_basis: _responseAiLegalBasis,
                    ai_escalation_flag: _responseAiEscalationFlag,
                    ...publicResult
                } = analysis;
                const {
                    aiLegalBasis: _privateAiLegalBasis,
                    aiNotes: _privateAiNotes,
                    aiEscalationFlag: _privateAiEscalationFlag,
                    ...publicStructuredAi
                } = structuredAi;

                return NextResponse.json({
                    success: true,
                    ref_number: saved.legalReport.reportNumber,
                    analysis: {
                        classification: toApiClassification(structuredAi.aiClassification),
                        severity: structuredAi.aiSeverity,
                        severity_explanation: structuredAi.aiSeverityExplanation,
                        recommended_path: structuredAi.aiRecommendedPath,
                        path_sentence: structuredAi.aiPathSentence,
                        processing_status: 'done',
                    },
                    result: {
                        ...publicResult,
                        ...publicStructuredAi,
                        ai_processing_status: 'done',
                        text: analysisInputText,
                    },
                    reportNumber: saved.legalReport.reportNumber,
                    analysisId: saved.analysisLog.id,
                    legalReportId: saved.legalReport.id,
                    submittedAt: submittedAt.toISOString(),
                });
            } catch (error) {
                if (isUniqueConstraintError(error) && attempt < 4) {
                    continue;
                }
                throw error;
            }
        }

        return NextResponse.json({ error: 'Failed to generate report number' }, { status: 500 });
    } catch (error) {
        await deleteStoredFiles(storedFiles);
        console.error('Error in report submission:', error);
        const message =
            error instanceof Error && error.message
                ? error.message
                : 'Failed to analyze and save report';
        const status =
            message === 'Please upload image or PDF files only.' ||
            message === 'Each image must be no larger than 5MB.' ||
            message === `You can upload up to ${MAX_ATTACHMENT_COUNT} images per report.` ||
            message === 'Which platform did you see this content on?' ||
            message === 'Post URL is required' ||
            message === 'Please enter the post text at minimum' ||
            message === 'Do you think this poses a direct threat? Please select an answer'
                ? 400
                : message === REPORT_SUBMISSION_RATE_LIMIT_MESSAGE
                    ? 429
                : 500;

        return NextResponse.json(
            {
                error: message,
            },
            { status }
        );
    }
}
