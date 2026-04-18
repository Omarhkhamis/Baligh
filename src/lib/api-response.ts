type ApiErrorPayload = {
    error?: string;
    message?: string;
};

export async function readJsonResponse<T>(response: Response): Promise<T | null> {
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('application/json')) {
        return null;
    }

    try {
        return await response.json() as T;
    } catch {
        return null;
    }
}

export function getApiErrorMessage(body: unknown, fallbackMessage: string) {
    if (!body || typeof body !== 'object') {
        return fallbackMessage;
    }

    const payload = body as ApiErrorPayload;
    if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error.trim();
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message.trim();
    }

    return fallbackMessage;
}

export async function readApiResponse<T>(
    response: Response,
    fallbackMessage: string
): Promise<
    | { ok: true; data: T }
    | { ok: false; data: T | null; error: string }
> {
    const data = await readJsonResponse<T & ApiErrorPayload>(response);

    if (!response.ok) {
        return {
            ok: false,
            data: data as T | null,
            error: getApiErrorMessage(data, fallbackMessage),
        };
    }

    if (data === null) {
        return {
            ok: false,
            data: null,
            error: fallbackMessage,
        };
    }

    return {
        ok: true,
        data: data as T,
    };
}
