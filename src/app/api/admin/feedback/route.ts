import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { decryptAnalysisLogFields } from '@/lib/data-security';

export async function GET(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'GET');
    if (auth.response) {
        return auth.response;
    }

    const analyses = await prisma.analysisLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return NextResponse.json(analyses.map((analysis) => decryptAnalysisLogFields(analysis)));
}

export async function DELETE(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'DELETE');
    if (auth.response) {
        return auth.response;
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.analysisLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
