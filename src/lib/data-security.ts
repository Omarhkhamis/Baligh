import crypto from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v1';
const DEVELOPMENT_FALLBACK_ENCRYPTION_KEY = 'balagh-local-development-column-encryption-key';
let hasWarnedAboutDevelopmentFallbackKey = false;

function getColumnEncryptionKey(): Buffer {
    const key = process.env.COLUMN_ENCRYPTION_KEY?.trim();
    if (key) {
        return crypto.createHash('sha256').update(key).digest();
    }

    if (process.env.NODE_ENV !== 'production') {
        if (!hasWarnedAboutDevelopmentFallbackKey) {
            console.warn('COLUMN_ENCRYPTION_KEY is not set. Falling back to a fixed development-only encryption key.');
            hasWarnedAboutDevelopmentFallbackKey = true;
        }

        return crypto.createHash('sha256').update(DEVELOPMENT_FALLBACK_ENCRYPTION_KEY).digest();
    }

    throw new Error('COLUMN_ENCRYPTION_KEY is not set');
}

function isEncryptedValue(value: string) {
    return value.startsWith(`${ENCRYPTION_PREFIX}:`);
}

export function encryptSensitiveText(value: string) {
    const normalized = value ?? '';
    if (!normalized) {
        return '';
    }

    if (isEncryptedValue(normalized)) {
        return normalized;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getColumnEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [
        ENCRYPTION_PREFIX,
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url'),
    ].join(':');
}

export function decryptSensitiveText(value: string | null | undefined) {
    const normalized = typeof value === 'string' ? value : '';
    if (!normalized || !isEncryptedValue(normalized)) {
        return normalized;
    }

    const [, , ivPart, tagPart, encryptedPart] = normalized.split(':');
    if (!ivPart || !tagPart || !encryptedPart) {
        return normalized;
    }

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        getColumnEncryptionKey(),
        Buffer.from(ivPart, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
}

export function encryptSensitiveStringArray(values: string[]) {
    const normalized = values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (normalized.length === 0) {
        return [] as string[];
    }

    return [encryptSensitiveText(JSON.stringify(normalized))];
}

export function decryptSensitiveStringArray(values: string[] | null | undefined) {
    if (!Array.isArray(values) || values.length === 0) {
        return [] as string[];
    }

    if (values.length === 1 && isEncryptedValue(values[0])) {
        try {
            const parsed = JSON.parse(decryptSensitiveText(values[0]));
            return Array.isArray(parsed)
                ? parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
                : [];
        } catch {
            return [];
        }
    }

    return values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

export function toDateOnlyTimestamp(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

export function toDateOnlyString(date = new Date()) {
    return toDateOnlyTimestamp(date).toISOString().slice(0, 10);
}

type AnalysisLogLike = {
    inputText: string;
    detectedKeywords: string[];
    aiScores?: unknown;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

export function buildEncryptedAnalysisLogFields(inputText: string, detectedKeywords: string[]) {
    return {
        inputText: encryptSensitiveText(inputText),
        detectedKeywords: encryptSensitiveStringArray(detectedKeywords),
    };
}

export function decryptAnalysisLogFields<T extends AnalysisLogLike>(log: T) {
    const aiScores = asRecord(log.aiScores);

    return {
        ...log,
        inputText: decryptSensitiveText(log.inputText),
        detectedKeywords: decryptSensitiveStringArray(log.detectedKeywords),
        aiScores: {
            ...aiScores,
            content_text: decryptSensitiveText(log.inputText),
            ai_hate_keywords: decryptSensitiveStringArray(log.detectedKeywords),
        },
    };
}
