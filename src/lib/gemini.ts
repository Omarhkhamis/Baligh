import { GoogleGenerativeAI, type Part } from '@google/generative-ai';

const getApiKeys = () => {
    const keys: string[] = [];

    // Primary key
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);

    // Backup keys
    if (process.env.GEMINI_API_KEY_1) keys.push(process.env.GEMINI_API_KEY_1);
    if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
    if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);

    return keys;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract retry delay from error message (e.g., "Please retry in 5.293689927s")
const extractRetryDelay = (message: string): number => {
    const match = message.match(/retry in (\d+(?:\.\d+)?)/i);
    if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000); // Convert to milliseconds
    }
    return 5000; // Default 5 second delay
};

export const getGeminiClient = () => {
    const keys = getApiKeys();

    if (keys.length === 0) {
        throw new Error('No GEMINI_API_KEY found in environment variables');
    }

    return {
        generateContent: async (
            modelName: string,
            promptParts: Array<string | Part>,
            options: Record<string, unknown> = {}
        ) => {
            let lastError: unknown;
            const maxRetries = 2; // Number of retries per key

            for (const key of keys) {
                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                    try {
                        const genAI = new GoogleGenerativeAI(key);
                        const { history, ...modelOptions } = options as {
                            history?: Array<{ role: 'user' | 'model'; parts: Array<string | Part> }>;
                        };
                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            ...modelOptions
                        });

                        const normalizeParts = (parts: Array<string | Part>) =>
                            parts.map(part => (typeof part === 'string' ? { text: part } : part));

                        if (history && Array.isArray(history) && history.length > 0) {
                            const contents = [
                                ...history.map(entry => ({
                                    role: entry.role,
                                    parts: normalizeParts(entry.parts)
                                })),
                                { role: 'user', parts: normalizeParts(promptParts) }
                            ];
                            const result = await model.generateContent({ contents });
                            return result;
                        }

                        const result = await model.generateContent(promptParts);
                        return result; // Success!
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Unknown error';
                        const status = typeof (error as { status?: number }).status === 'number' ? (error as { status?: number }).status : undefined;
                        console.warn(`Gemini API failed with key ending in ...${key.slice(-4)} (attempt ${attempt + 1}): ${message}`);
                        lastError = error;

                        const lowered = message.toLowerCase();
                        const isRateLimited = status === 429 || lowered.includes('resource exhausted') || lowered.includes('quota');
                        const isRetryable = isRateLimited ||
                            lowered.includes('key') ||
                            lowered.includes('permission') ||
                            status === 403 ||
                            (typeof status === 'number' && status >= 500);

                        if (!isRetryable) {
                            throw error;
                        }

                        // If rate limited and we have more retries, wait and try again
                        if (isRateLimited && attempt < maxRetries) {
                            const waitTime = extractRetryDelay(message);
                            console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                            await delay(waitTime);
                            continue; // Retry same key
                        }

                        // Move to next key
                        break;
                    }
                }
            }

            throw lastError instanceof Error ? lastError : new Error('All Gemini API keys failed');
        }
    };
};
