import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const idFromPath = _req.nextUrl?.pathname?.split('/').filter(Boolean).pop();
        const idOrSlug = resolvedParams?.id || idFromPath;

        if (!idOrSlug) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const byId = await prisma.newsArticle.findUnique({ where: { id: idOrSlug } });
        const bySlug = byId ? null : await prisma.newsArticle.findFirst({ where: { slug: idOrSlug } });
        const article = byId || bySlug;

        if (!article || !article.isPublished) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(article);
    } catch (error: any) {
        console.error('Error fetching news article', error);
        return NextResponse.json({ error: 'Server error', detail: error?.message || String(error) }, { status: 500 });
    }
}
