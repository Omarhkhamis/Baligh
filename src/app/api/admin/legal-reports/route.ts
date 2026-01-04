import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.legalReport.findMany({
        orderBy: { createdAt: 'desc' },
        include: { analysisLog: true },
        take: 100,
    });

    return NextResponse.json(reports);
}

export async function DELETE(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.legalReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
