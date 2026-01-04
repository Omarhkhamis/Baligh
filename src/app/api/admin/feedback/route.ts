import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await prisma.analysisLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return NextResponse.json(analyses);
}

export async function DELETE(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.analysisLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
