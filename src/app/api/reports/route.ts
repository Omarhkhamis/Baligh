import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ReportCategoryType = 'MONTHLY_REPORT' | 'RESEARCH' | 'INFOGRAPHIC' | 'POLICY_BRIEF' | 'OTHER';

const CATEGORY_MAP: Record<string, ReportCategoryType> = {
    initiative: 'MONTHLY_REPORT',
    analytical: 'RESEARCH',
    study: 'RESEARCH',
    infographic: 'INFOGRAPHIC',
    policy: 'POLICY_BRIEF',
    other: 'OTHER',
};

export async function GET(req: NextRequest) {
    try {
        const category = req.nextUrl.searchParams.get('category');

        const where = {
            isPublished: true,
            ...(category ? { category: CATEGORY_MAP[category] ?? 'OTHER' } : {}),
        };

        const reports = await prisma.reportStudy.findMany({
            where,
            orderBy: [
                { publishedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
