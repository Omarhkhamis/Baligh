import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type NewsCategoryType = 'TRAINING' | 'MEDIA' | 'EVENT' | 'ACHIEVEMENT' | 'STATEMENT' | 'PRESS_RELEASES' | 'EVENTS' | 'ANNOUNCEMENTS' | 'OTHER';

export async function GET(req: NextRequest) {
    try {
        const category = req.nextUrl.searchParams.get('category');
        const safeCategory: NewsCategoryType | undefined = category
            ? (category.toUpperCase() as NewsCategoryType) || 'OTHER'
            : undefined;

        const where = {
            isPublished: true,
            ...(safeCategory ? { category: safeCategory } : {}),
        };

        const articles = await prisma.newsArticle.findMany({
            where,
            orderBy: [
                { publishedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching news', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
