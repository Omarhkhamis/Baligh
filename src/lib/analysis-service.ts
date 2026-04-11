import { SchemaType, type Part } from '@google/generative-ai';
import { HATE_SPEECH_SYSTEM_PROMPT } from '@/lib/prompts';
import { getGeminiClient, getGeminiModelName } from '@/lib/gemini';
import { normalizeAnalysisResult } from '@/lib/analysis-utils';

export const INVALID_AI_JSON_RESPONSE_MESSAGE = 'Invalid JSON response from Gemini';
const ANALYSIS_MAX_OUTPUT_TOKENS = 4096;
const COMPACT_JSON_INSTRUCTION =
    "Return a compact JSON object only. Keep reasoning, hateful_words, and image_description brief.";

type AnalyzeContentParams = {
    text?: string;
    image?: string | null;
    locale?: string;
    platform?: string;
    reportId?: string | number;
    immediateDanger?: string | boolean | null;
};

const languageMap: Record<string, string> = {
    ar: 'Arabic',
    en: 'English',
    ku: 'Kurdish (Kurmanji)',
};

function extractHashtags(text?: string) {
    if (!text) {
        return 'none';
    }

    const tags = text.match(/#[\u0600-\u06FF\w]+/g);
    return tags ? tags.join(' | ') : 'none';
}

function normalizeReporterDeclaredDanger(value: AnalyzeContentParams['immediateDanger']) {
    if (typeof value === 'boolean') {
        return value ? 'yes' : 'no';
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        return normalized || 'unknown';
    }

    return 'unknown';
}

function appendValidationFlag(result: Record<string, unknown>, flag: string) {
    const currentFlags = Array.isArray(result.validation_flags)
        ? result.validation_flags.filter((value): value is string => typeof value === 'string')
        : [];

    result.validation_flags = Array.from(new Set([...currentFlags, flag]));
}

function validateAndClean(result: Record<string, unknown>, hasImage: boolean) {
    const cleaned: Record<string, unknown> = { ...result };
    const classification = typeof cleaned.classification === 'string' ? cleaned.classification.trim() : '';
    const targetGroup = typeof cleaned.target_group === 'string' ? cleaned.target_group.trim() : '';
    const severity =
        typeof cleaned.severity === 'number'
            ? cleaned.severity
            : Number.parseFloat(String(cleaned.severity ?? ''));
    const riskLevel =
        typeof cleaned.risk_level === 'string' ? cleaned.risk_level.trim().toUpperCase() : '';

    if (!hasImage) {
        if (typeof cleaned.image_description === 'string' && cleaned.image_description.trim()) {
            appendValidationFlag(cleaned, 'HALLUCINATED_IMAGE_REMOVED');
        }
        cleaned.image_description = null;
        cleaned.image_verified = false;
    }

    if (cleaned.immediate_danger === true && classification === 'Safe') {
        cleaned.needs_review = true;
        appendValidationFlag(cleaned, 'DANGER_SAFE_CONFLICT');
    }

    if (Number.isFinite(severity) && severity >= 4 && riskLevel === 'LOW') {
        cleaned.needs_review = true;
        appendValidationFlag(cleaned, 'SEVERITY_RISK_MISMATCH');
    }

    if (!targetGroup && (classification === 'Category A' || classification === 'Category B')) {
        cleaned.needs_review = true;
        appendValidationFlag(cleaned, 'MISSING_TARGET_GROUP');
    }

    return cleaned;
}

function buildAnalysisPrompt({
    text,
    image,
    platform,
    reportId,
    immediateDanger,
}: Pick<AnalyzeContentParams, 'text' | 'image' | 'platform' | 'reportId' | 'immediateDanger'>) {
    return `
REPORT_ID: ${reportId ?? 'unknown'}
PLATFORM: ${platform || 'unknown'}
HAS_IMAGE_ATTACHED: ${image ? 'YES' : 'NO'}
HASHTAGS_DETECTED: ${extractHashtags(text)}
REPORTER_DECLARED_DANGER: ${normalizeReporterDeclaredDanger(immediateDanger)}

TEXT_TO_ANALYZE:
${text?.trim() || 'EMPTY'}
    `.trim();
}

export async function analyzeContent({
    text,
    image,
    platform,
    reportId,
    immediateDanger,
}: AnalyzeContentParams) {
    if (!text && !image) {
        throw new Error('Text or Image is required');
    }

    const client = getGeminiClient();
    const promptParts: Array<string | Part> = [
        buildAnalysisPrompt({ text, image, platform, reportId, immediateDanger }),
    ];

    if (image) {
        const mimeTypeMatch = image.match(/^data:([^;]+);base64,/);
        const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';
        const base64Data = image.split(',')[1] || image;

        promptParts.push({
            inlineData: {
                data: base64Data,
                mimeType,
            },
        });
    }

    promptParts.push(COMPACT_JSON_INSTRUCTION);

    const result = await client.generateContent(getGeminiModelName(), promptParts, {
        systemInstruction: HATE_SPEECH_SYSTEM_PROMPT,
        generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: ANALYSIS_MAX_OUTPUT_TOKENS,
            responseMimeType: 'application/json',
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    classification: {
                        type: SchemaType.STRING,
                        enum: ['Safe', 'Category A', 'Category B', 'Category C', 'Category T', 'Incomplete'],
                    },
                    risk_level: {
                        type: SchemaType.STRING,
                        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
                    },
                    severity: { type: SchemaType.NUMBER },
                    speech_type: {
                        type: SchemaType.STRING,
                        enum: ['Category A', 'Category B', 'Category C', 'Category T', 'Safe', 'Incomplete'],
                    },
                    target_group: { type: SchemaType.STRING, nullable: true },
                    target_identified_from: { type: SchemaType.STRING, nullable: true },
                    immediate_danger: { type: SchemaType.BOOLEAN },
                    image_description: { type: SchemaType.STRING, nullable: true },
                    image_verified: { type: SchemaType.BOOLEAN },
                    hateful_words: { type: SchemaType.STRING, nullable: true },
                    reasoning: { type: SchemaType.STRING },
                    classification_path: { type: SchemaType.STRING, nullable: true },
                    needs_review: { type: SchemaType.BOOLEAN },
                },
                required: [
                    'classification',
                    'risk_level',
                    'severity',
                    'speech_type',
                    'target_group',
                    'target_identified_from',
                    'immediate_danger',
                    'image_description',
                    'image_verified',
                    'hateful_words',
                    'reasoning',
                    'classification_path',
                    'needs_review',
                ],
            },
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
        ],
    });

    const finishReason = result.response.candidates?.[0]?.finishReason;
    const responseText = result.response.text().trim();
    let rawAnalysis: Record<string, unknown>;

    try {
        if (!responseText || finishReason === 'MAX_TOKENS') {
            throw new Error(INVALID_AI_JSON_RESPONSE_MESSAGE);
        }
        rawAnalysis = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
        throw new Error(INVALID_AI_JSON_RESPONSE_MESSAGE);
    }

    return normalizeAnalysisResult(validateAndClean(rawAnalysis, Boolean(image)), text || '');
}

export async function extractTextFromImage({ image, locale = 'ar' }: AnalyzeContentParams) {
    if (!image) {
        throw new Error('Image is required');
    }

    const client = getGeminiClient();
    const targetLanguage = languageMap[locale] || 'Arabic';
    const mimeTypeMatch = image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';
    const base64Data = image.split(',')[1] || image;

    const result = await client.generateContent(getGeminiModelName(), [
        {
            inlineData: {
                data: base64Data,
                mimeType,
            },
        },
        `Extract any readable text from this image and respond in ${targetLanguage}. If there is little or no readable text, provide a short neutral summary of the visible content that would help content-safety analysis. Return plain text only.`,
    ]);

    return result.response.text().trim();
}
