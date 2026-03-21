import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

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
    const auth = await requirePermission(req, 'studies', 'GET');
    if (auth.response) {
        return auth.response;
    }

    const reports = await prisma.reportStudy.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
    const auth = await requirePermission(req, 'studies', 'POST');
    if (auth.response) {
        return auth.response;
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
            documentUrlAr,
            documentUrlEn,
            publishNow,
        } = body;

        if (!titleAr || !summaryAr || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';
        const report = await prisma.reportStudy.create({
            data: {
                title: { ar: titleAr, en: titleEn || titleAr },
                summary: { ar: summaryAr, en: summaryEn || summaryAr },
                body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr },
                category: prismaCategory,
                authorName: authorName || null,
                authorNameEn: authorNameEn || null,
                documentUrl: documentUrl || null,
                documentUrlAr: documentUrlAr || documentUrl || null,
                documentUrlEn: documentUrlEn || documentUrl || null,
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
    const auth = await requirePermission(req, 'studies', 'PATCH');
    if (auth.response) {
        return auth.response;
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
            documentUrlAr,
            documentUrlEn,
            publishNow,
        } = body;

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';

        const data: Record<string, unknown> = {
            ...(titleAr ? { title: { ar: titleAr, en: titleEn || titleAr } } : {}),
            ...(summaryAr ? { summary: { ar: summaryAr, en: summaryEn || summaryAr } } : {}),
            ...(bodyAr ? { body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr } } : {}),
            category: prismaCategory,
            authorName: authorName ?? undefined,
            authorNameEn: authorNameEn ?? undefined,
            imageUrl: imageUrl ?? undefined,
            isPublished: publishNow !== undefined ? !!publishNow : undefined,
            publishedAt: publishNow ? new Date() : undefined,
        };

        if (Object.prototype.hasOwnProperty.call(body, 'documentUrl')) {
            data.documentUrl = documentUrl;
        }
        if (Object.prototype.hasOwnProperty.call(body, 'documentUrlAr')) {
            data.documentUrlAr = documentUrlAr;
        }
        if (Object.prototype.hasOwnProperty.call(body, 'documentUrlEn')) {
            data.documentUrlEn = documentUrlEn;
        }

        const report = await prisma.reportStudy.update({
            where: { id },
            data,
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('Failed to update report', error);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await requirePermission(req, 'studies', 'DELETE');
    if (auth.response) {
        return auth.response;
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
