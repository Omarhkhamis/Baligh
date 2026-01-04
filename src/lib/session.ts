import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'balgh_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
    sub: string;
    email: string;
};

function getSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error('AUTH_SECRET is not set');
    }
    return secret;
}

export function createSessionToken(payload: SessionPayload): string {
    return jwt.sign(payload, getSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function verifySessionToken(token: string): SessionPayload | null {
    try {
        return jwt.verify(token, getSecret()) as SessionPayload;
    } catch {
        return null;
    }
}
