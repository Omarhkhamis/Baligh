import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword } from '@/lib/auth';
import { isAdminRole } from '@/lib/permissions';

const adminUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

function normalizeEmail(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
}

function normalizeOptionalText(value: unknown): string | null {
    const normalized = String(value ?? '').trim();
    return normalized ? normalized : null;
}

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
        where: { id: session.sub },
        select: adminUserSelect,
    });

    if (!admin) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (session.role !== 'SUPER_ADMIN') {
        return NextResponse.json(admin);
    }

    const adminUsers = await prisma.adminUser.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: adminUserSelect,
    });

    return NextResponse.json({
        ...admin,
        adminUsers,
    });
}

export async function POST(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const email = normalizeEmail(body.email);
        const password = String(body.password ?? '');
        const role = body.role;
        const name = normalizeOptionalText(body.name);

        if (!email) {
            return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        if (!isAdminRole(role)) {
            return NextResponse.json({ error: 'صلاحية غير صالحة' }, { status: 400 });
        }

        if (role === 'SUPER_ADMIN') {
            const existingSuperAdmin = await prisma.adminUser.findFirst({
                where: { role: 'SUPER_ADMIN' },
                select: { id: true },
            });

            if (existingSuperAdmin) {
                return NextResponse.json({ error: 'يوجد مستخدم واحد فقط بصلاحية Super Admin' }, { status: 409 });
            }
        }

        const existingAdmin = await prisma.adminUser.findUnique({
            where: { email },
            select: { id: true },
        });
        if (existingAdmin) {
            return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
        }

        const created = await prisma.adminUser.create({
            data: {
                email,
                name,
                role,
                passwordHash: await hashPassword(password),
            },
            select: adminUserSelect,
        });

        const adminUsers = await prisma.adminUser.findMany({
            orderBy: [{ createdAt: 'desc' }],
            select: adminUserSelect,
        });

        return NextResponse.json(
            {
                user: created,
                adminUsers,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Failed to create admin user', error);
        return NextResponse.json({ error: 'تعذر إنشاء المستخدم' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const hasEmail = typeof body.email === 'string';
        const hasName = typeof body.name === 'string';
        const hasPassword = typeof body.password === 'string' && body.password.length > 0;

        if (!hasEmail && !hasPassword && !hasName) {
            return NextResponse.json({ error: 'لا توجد تغييرات' }, { status: 400 });
        }

        const data: Record<string, unknown> = {};

        if (hasEmail) {
            const email = normalizeEmail(body.email);
            if (!email) {
                return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
            }

            const existingAdmin = await prisma.adminUser.findUnique({
                where: { email },
                select: { id: true },
            });
            if (existingAdmin && existingAdmin.id !== session.sub) {
                return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
            }

            data.email = email;
        }

        if (hasName) {
            data.name = normalizeOptionalText(body.name);
        }

        if (hasPassword) {
            if (String(body.password).length < 6) {
                return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
            }
            data.passwordHash = await hashPassword(String(body.password));
        }

        const updated = await prisma.adminUser.update({
            where: { id: session.sub },
            data,
            select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update admin account', error);
        return NextResponse.json({ error: 'تعذر تحديث الحساب' }, { status: 500 });
    }
}
