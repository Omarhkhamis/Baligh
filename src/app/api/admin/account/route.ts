import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
        where: { id: session.sub },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    if (!admin) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
}

export async function PATCH(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email, password, name } = await req.json();
        if (!email && !password && !name) {
            return NextResponse.json({ error: 'لا توجد تغييرات' }, { status: 400 });
        }

        const data: Record<string, unknown> = {};
        if (email) data.email = String(email).trim();
        if (name) data.name = String(name).trim();
        if (password) {
            if (String(password).length < 6) {
                return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
            }
            data.passwordHash = await hashPassword(String(password));
        }

        const updated = await prisma.adminUser.update({
            where: { id: session.sub },
            data,
            select: { id: true, email: true, name: true, updatedAt: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update admin account', error);
        return NextResponse.json({ error: 'تعذر تحديث الحساب' }, { status: 500 });
    }
}
