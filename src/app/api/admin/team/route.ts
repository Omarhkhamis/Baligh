import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = await requirePermission(request, 'team', 'GET');
    if (auth.response) {
        return auth.response;
    }

    const members = await prisma.teamMember.findMany({
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
        ],
    });

    return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
    const auth = await requirePermission(request, 'team', 'POST');
    if (auth.response) {
        return auth.response;
    }

    try {
        const body = await request.json();
        const {
            nameAr,
            nameEn,
            roleAr,
            roleEn,
            bio,
            imageUrl,
            sortOrder,
        } = body;

        if (!nameAr || !roleAr) {
            return NextResponse.json({ error: 'الاسم والدور بالعربية مطلوبان' }, { status: 400 });
        }

        const member = await prisma.teamMember.create({
            data: {
                name: { ar: nameAr, en: nameEn || nameAr },
                role: { ar: roleAr, en: roleEn || roleAr },
                bio: bio || null,
                imageUrl: imageUrl || null,
                sortOrder: Number.isFinite(sortOrder) ? Number(sortOrder) : 0,
            },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Failed to create team member', error);
        return NextResponse.json({ error: 'تعذر حفظ العضو' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const auth = await requirePermission(request, 'team', 'PATCH');
    if (auth.response) return auth.response;

    try {
        const { id, nameAr, nameEn, roleAr, roleEn, bio, imageUrl, sortOrder } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const updated = await prisma.teamMember.update({
            where: { id },
            data: {
                ...(nameAr || nameEn ? { name: { ar: nameAr, en: nameEn || nameAr } } : {}),
                ...(roleAr || roleEn ? { role: { ar: roleAr, en: roleEn || roleAr } } : {}),
                bio: bio ?? undefined,
                imageUrl: imageUrl ?? undefined,
                sortOrder: Number.isFinite(sortOrder) ? Number(sortOrder) : undefined,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update team member', error);
        return NextResponse.json({ error: 'تعذر تحديث العضو' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const auth = await requirePermission(request, 'team', 'DELETE');
    if (auth.response) return auth.response;

    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        await prisma.teamMember.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete team member', error);
        return NextResponse.json({ error: 'تعذر الحذف' }, { status: 500 });
    }
}
