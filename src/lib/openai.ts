/**
 * OpenAI API Client with automatic key rotation
 * Similar to gemini.ts - automatically switches to backup keys on failure
 */

const getOpenAIKeys = (): string[] => {
    const keys: string[] = [];

    // Primary key
    if (process.env.OPENAI_API_KEY) keys.push(process.env.OPENAI_API_KEY);

    // Backup keys
    if (process.env.OPENAI_API_KEY_1) keys.push(process.env.OPENAI_API_KEY_1);
    if (process.env.OPENAI_API_KEY_2) keys.push(process.env.OPENAI_API_KEY_2);

    return keys;
};

export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenAIResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export const getOpenAIClient = () => {
    const keys = getOpenAIKeys();

    if (keys.length === 0) {
        throw new Error('No OPENAI_API_KEY found in environment variables');
    }

    return {
        /**
         * Generate chat completion with automatic key rotation on failure
         */
        chatCompletion: async (
            messages: OpenAIMessage[],
            options: {
                model?: string;
                temperature?: number;
                max_tokens?: number;
            } = {}
        ): Promise<OpenAIResponse> => {
            let lastError: unknown;

            const {
                model = 'gpt-4o-mini',  // Default to cost-effective model
                temperature = 0.3,
                max_tokens = 2000
            } = options;

            for (const key of keys) {
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${key}`
                        },
                        body: JSON.stringify({
                            model,
                            messages,
                            temperature,
                            max_tokens
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMessage = (errorData as { error?: { message?: string } }).error?.message || response.statusText;
                        
                        // Check if error is retryable (rate limit, quota, auth issues)
                        const isRetryable = 
                            response.status === 429 || // Rate limit
                            response.status === 401 || // Auth error
                            response.status === 403 || // Permission denied
                            response.status >= 500;    // Server errors

                        if (isRetryable && keys.indexOf(key) < keys.length - 1) {
                            console.warn(`OpenAI API failed with key ending in ...${key.slice(-4)}: ${errorMessage}`);
                            lastError = new Error(errorMessage);
                            continue; // Try next key
                        }

                        throw new Error(`OpenAI API Error: ${errorMessage}`);
                    }

                    return await response.json() as OpenAIResponse;

                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    console.warn(`OpenAI API failed with key ending in ...${key.slice(-4)}: ${message}`);
                    lastError = error;

                    // Only continue to next key if this wasn't the last one
                    if (keys.indexOf(key) >= keys.length - 1) {
                        throw error;
                    }
                }
            }

            throw lastError instanceof Error ? lastError : new Error('All OpenAI API keys failed');
        },

        /**
         * Simple text generation helper
         */
        generateText: async (
            prompt: string,
            systemPrompt?: string,
            options: {
                model?: string;
                temperature?: number;
                max_tokens?: number;
            } = {}
        ): Promise<string> => {
            const messages: OpenAIMessage[] = [];
            
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const client = getOpenAIClient();
            const response = await client.chatCompletion(messages, options);
            
            return response.choices[0]?.message?.content || '';
        }
    };
};
