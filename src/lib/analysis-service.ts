import { SchemaType, type Part } from '@google/generative-ai';
import { HSIE_SYRIA_SYSTEM_PROMPT } from '@/lib/prompts';
import { getGeminiClient, getGeminiModelName } from '@/lib/gemini';
import { normalizeAnalysisResult } from '@/lib/analysis-utils';

export const INVALID_AI_JSON_RESPONSE_MESSAGE = 'Invalid JSON response from Gemini';
const ANALYSIS_MAX_OUTPUT_TOKENS = 4096;
const COMPACT_JSON_INSTRUCTION =
    "Return a compact JSON object only. Keep rationale_arabic, awareness_note_arabic, ai_severity_explanation, ai_path_sentence, ai_legal_basis, ai_notes, and image_description brief. Limit arrays to the most relevant 3 items.";

type AnalyzeContentParams = {
    text?: string;
    image?: string | null;
    locale?: string;
};

const languageMap: Record<string, string> = {
    ar: 'Arabic',
    en: 'English',
    ku: 'Kurdish (Kurmanji)',
};

export async function analyzeContent({ text, image, locale = 'ar' }: AnalyzeContentParams) {
    if (!text && !image) {
        throw new Error('Text or Image is required');
    }

    const client = getGeminiClient();
    const targetLanguage = languageMap[locale] || 'Arabic';

    const promptParts: Array<string | Part> = [];
    if (text) {
        promptParts.push(text);
    }

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
        promptParts.push(
            "Describe the visual content of the image in the 'image_description' field. Focus on elements relevant to hate speech or violence if present."
        );
    }

    promptParts.push(COMPACT_JSON_INSTRUCTION);

    const result = await client.generateContent(getGeminiModelName(), promptParts, {
        systemInstruction: HSIE_SYRIA_SYSTEM_PROMPT(targetLanguage),
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: ANALYSIS_MAX_OUTPUT_TOKENS,
            responseMimeType: 'application/json',
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    classification: {
                        type: SchemaType.STRING,
                        enum: ['Safe', 'Category A', 'Category B', 'Category C', 'Category D'],
                    },
                    violation_type: {
                        type: SchemaType.STRING,
                        enum: ['None', 'A', 'B', 'C', 'D'],
                    },
                    is_identity_based: {
                        type: SchemaType.STRING,
                        enum: ['Yes', 'No'],
                    },
                    severity_score: { type: SchemaType.NUMBER },
                    target_group_arabic: { type: SchemaType.STRING },
                    rationale_arabic: { type: SchemaType.STRING },
                    awareness_note_arabic: { type: SchemaType.STRING },
                    image_description: { type: SchemaType.STRING },
                    ai_classification: {
                        type: SchemaType.STRING,
                        enum: ['explicit', 'implicit', 'incitement', 'none'],
                    },
                    ai_severity: { type: SchemaType.NUMBER },
                    ai_severity_explanation: { type: SchemaType.STRING },
                    ai_speech_type: {
                        type: SchemaType.STRING,
                        enum: ['direct', 'implicit', 'symbolic', 'false_propaganda'],
                    },
                    ai_confidence: {
                        type: SchemaType.STRING,
                        enum: ['high', 'medium', 'low'],
                    },
                    ai_context_sensitivity: {
                        type: SchemaType.STRING,
                        enum: ['high', 'medium', 'low'],
                    },
                    ai_target_groups: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    ai_hate_keywords: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    ai_symbolic_references: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                    },
                    ai_emotions_detected: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.STRING,
                            enum: ['hatred', 'anger', 'contempt', 'gloating', 'fear', 'generalization', 'revenge_desire', 'other'],
                        },
                    },
                    ai_dehumanization_level: {
                        type: SchemaType.STRING,
                        enum: ['none', 'implicit', 'explicit'],
                    },
                    ai_generalization_type: {
                        type: SchemaType.STRING,
                        enum: ['individual_to_group', 'geographic', 'religious', 'ethnic', 'none'],
                    },
                    ai_account_type: {
                        type: SchemaType.STRING,
                        enum: ['personal', 'media', 'political', 'religious', 'anonymous', 'military'],
                    },
                    ai_reach_level: {
                        type: SchemaType.STRING,
                        enum: ['limited', 'moderate', 'wide'],
                    },
                    ai_content_type: {
                        type: SchemaType.STRING,
                        enum: ['text', 'image', 'video', 'meme', 'comment', 'live_stream'],
                    },
                    ai_language_register: {
                        type: SchemaType.STRING,
                        enum: ['formal', 'colloquial', 'symbolic', 'mixed'],
                    },
                    ai_conflict_context: {
                        type: SchemaType.STRING,
                        enum: ['active_conflict', 'tense', 'stable'],
                    },
                    ai_publisher_location: { type: SchemaType.STRING, nullable: true },
                    ai_recommended_path: {
                        type: SchemaType.STRING,
                        enum: ['legal_action', 'documentation', 'monitoring', 'no_action'],
                    },
                    ai_path_sentence: { type: SchemaType.STRING },
                    ai_legal_basis: { type: SchemaType.STRING, nullable: true },
                    ai_escalation_flag: { type: SchemaType.BOOLEAN },
                    ai_incitement_to_action: { type: SchemaType.BOOLEAN },
                    ai_glorification_of_violence: { type: SchemaType.BOOLEAN },
                    ai_notes: { type: SchemaType.STRING, nullable: true },
                },
                required: [
                    'classification',
                    'violation_type',
                    'is_identity_based',
                    'severity_score',
                    'rationale_arabic',
                    'target_group_arabic',
                    'awareness_note_arabic',
                    'ai_classification',
                    'ai_severity',
                    'ai_severity_explanation',
                    'ai_speech_type',
                    'ai_confidence',
                    'ai_context_sensitivity',
                    'ai_target_groups',
                    'ai_hate_keywords',
                    'ai_symbolic_references',
                    'ai_emotions_detected',
                    'ai_dehumanization_level',
                    'ai_generalization_type',
                    'ai_account_type',
                    'ai_reach_level',
                    'ai_content_type',
                    'ai_language_register',
                    'ai_conflict_context',
                    'ai_recommended_path',
                    'ai_path_sentence',
                    'ai_escalation_flag',
                    'ai_incitement_to_action',
                    'ai_glorification_of_violence',
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

    return normalizeAnalysisResult(rawAnalysis, text || '');
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
