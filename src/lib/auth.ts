import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { verifyPermission, type AdminRole, type PermissionAction, type PermissionResource } from './permissions';
import { verifySessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS, type SessionPayload } from './session';

type AdminSessionRecord = {
    id: string;
    email: string;
    name: string | null;
    role: AdminRole;
};

export type AuthenticatedAdmin = {
    sub: string;
    email: string;
    name: string | null;
    role: AdminRole;
};

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

async function getAdminSessionRecord(id: string): Promise<AdminSessionRecord | null> {
    return prisma.adminUser.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });
}

function toAuthenticatedAdmin(admin: AdminSessionRecord): AuthenticatedAdmin {
    return {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
    };
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

export async function getSessionFromCookies(): Promise<AuthenticatedAdmin | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    const admin = await getAdminSessionRecord(session.sub);
    if (!admin) return null;

    return toAuthenticatedAdmin(admin);
}

export async function requireAuth(req: NextRequest): Promise<AuthenticatedAdmin | null> {
    const session = getSessionFromRequest(req);
    if (!session) return null;

    const admin = await getAdminSessionRecord(session.sub);
    if (!admin) return null;

    return toAuthenticatedAdmin(admin);
}

export async function requirePermission(
    req: NextRequest,
    resource: PermissionResource,
    action: PermissionAction
): Promise<{ session: AuthenticatedAdmin | null; response: NextResponse | null }> {
    const session = await requireAuth(req);
    if (!session) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    if (!verifyPermission(session.role, resource, action)) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        };
    }

    return { session, response: null };
}
