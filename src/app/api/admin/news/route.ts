import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

type NewsCategoryType = 'TRAINING' | 'MEDIA' | 'EVENT' | 'ACHIEVEMENT' | 'STATEMENT' | 'PRESS_RELEASES' | 'EVENTS' | 'ANNOUNCEMENTS' | 'OTHER';

const CATEGORY_MAP: Record<string, NewsCategoryType> = {
    training: 'TRAINING',
    media: 'MEDIA',
    event: 'EVENT',
    achievement: 'ACHIEVEMENT',
    statement: 'STATEMENT',
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
    return base || `article-${crypto.randomBytes(4).toString('hex')}`;
}

export async function GET(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.newsArticle.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(articles);
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
            publishedAt,
            imageUrl,
            videoUrl,
            publishNow,
        } = body;

        if (!titleAr || !summaryAr || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';
        const slug = slugify(titleEn || titleAr);
        const publishDate = publishNow ? new Date(publishedAt || Date.now()) : publishedAt ? new Date(publishedAt) : null;

        const article = await prisma.newsArticle.create({
            data: {
                title: { ar: titleAr, en: titleEn || titleAr },
                summary: { ar: summaryAr, en: summaryEn || summaryAr },
                body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr },
                category: prismaCategory,
                slug,
                authorName: authorName || null,
                authorNameEn: authorNameEn || null,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                isPublished: !!publishNow,
                publishedAt: publishDate,
            },
        });

        return NextResponse.json(article, { status: 201 });
    } catch (error) {
        console.error('Failed to create news article', error);
        return NextResponse.json({ error: 'Failed to create news article' }, { status: 500 });
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
            publishedAt,
            imageUrl,
            videoUrl,
            publishNow,
        } = body;

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const prismaCategory = CATEGORY_MAP[category] ?? 'OTHER';

        const updated = await prisma.newsArticle.update({
            where: { id },
            data: {
                ...(titleAr ? { title: { ar: titleAr, en: titleEn || titleAr } } : {}),
                ...(summaryAr ? { summary: { ar: summaryAr, en: summaryEn || summaryAr } } : {}),
                ...(bodyAr ? { body: { ar: bodyAr || summaryAr, en: bodyEn || bodyAr || summaryAr } } : {}),
                category: prismaCategory,
                authorName: authorName ?? undefined,
                authorNameEn: authorNameEn ?? undefined,
                imageUrl: imageUrl ?? undefined,
                videoUrl: videoUrl ?? undefined,
                isPublished: publishNow !== undefined ? !!publishNow : undefined,
                publishedAt: publishNow !== undefined
                    ? publishNow
                        ? new Date(publishedAt || Date.now())
                        : null
                    : publishedAt
                        ? new Date(publishedAt)
                        : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update news article', error);
        return NextResponse.json({ error: 'Failed to update news article' }, { status: 500 });
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
        await prisma.newsArticle.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete news article', error);
        return NextResponse.json({ error: 'Failed to delete news article' }, { status: 500 });
    }
}
