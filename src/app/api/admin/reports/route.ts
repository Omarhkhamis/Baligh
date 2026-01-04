import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

type ReportCategoryType = 'MONTHLY_REPORT' | 'RESEARCH' | 'INFOGRAPHIC' | 'POLICY_BRIEF' | 'OTHER';

const CATEGORY_MAP: Record<string, ReportCategoryType> = {
    initiative: 'MONTHLY_REPORT',
    analytical: 'RESEARCH',
    study: 'RESEARCH',
    infographic: 'INFOGRAPHIC',
    policy: 'POLICY_BRIEF',
    other: 'OTHER',
};

function slugify(value: string) {
    const base = value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    return base || `report-${crypto.randomBytes(4).toString('hex')}`;
}

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.reportStudy.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            titleAr,
            titleEn,
            summaryAr,
            summaryEn,
            bodyAr,
            bodyEn,
            category,
            authorName,
            authorNameEn,
            imageUrl,
            documentUrl,
            publishNow,
        } = body;

        if (!titleAr || !summaryAr || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';
        const slug = slugify(titleEn || titleAr);

        const report = await prisma.reportStudy.create({
            data: {
                title: { ar: titleAr, en: titleEn || titleAr },
                summary: { ar: summaryAr, en: summaryEn || summaryAr },
                body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr },
                category: prismaCategory,
                authorName: authorName || null,
                authorNameEn: authorNameEn || null,
                documentUrl: documentUrl || null,
                imageUrl: imageUrl || null,
                isPublished: !!publishNow,
                publishedAt: publishNow ? new Date() : null,
            },
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        console.error('Failed to create report', error);
        return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            id,
            titleAr,
            titleEn,
            summaryAr,
            summaryEn,
            bodyAr,
            bodyEn,
            category,
            authorName,
            authorNameEn,
            imageUrl,
            documentUrl,
            publishNow,
        } = body;

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';

        const report = await prisma.reportStudy.update({
            where: { id },
            data: {
                ...(titleAr ? { title: { ar: titleAr, en: titleEn || titleAr } } : {}),
                ...(summaryAr ? { summary: { ar: summaryAr, en: summaryEn || summaryAr } } : {}),
                ...(bodyAr ? { body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr } } : {}),
                category: prismaCategory,
                authorName: authorName ?? undefined,
                authorNameEn: authorNameEn ?? undefined,
                documentUrl: documentUrl ?? undefined,
                imageUrl: imageUrl ?? undefined,
                isPublished: publishNow !== undefined ? !!publishNow : undefined,
                publishedAt: publishNow ? new Date() : undefined,
            },
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('Failed to update report', error);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        await prisma.reportStudy.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete report', error);
        return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }
}
