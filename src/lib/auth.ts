import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS, type SessionPayload } from './session';

export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

export async function authenticateAdmin(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) return null;

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) return null;

    return admin;
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: SESSION_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_TTL_SECONDS,
        path: '/',
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set({
        name: SESSION_COOKIE,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
    });
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) return null;
    return verifySessionToken(cookie);
}

export async function requireAuth(req: NextRequest): Promise<SessionPayload | null> {
    const session = getSessionFromRequest(req);
    if (!session) return null;
    const exists = await prisma.adminUser.findUnique({ where: { id: session.sub } });
    if (!exists) return null;
    return session;
}
