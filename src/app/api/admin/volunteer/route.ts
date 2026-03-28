import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = await requirePermission(request, 'volunteer', 'GET');
    if (auth.response) {
        return auth.response;
    }

    try {
        const items = await prisma.volunteerApplication.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to load volunteer forms', error);
        return NextResponse.json({ error: 'failed_to_load_volunteer_forms' }, { status: 500 });
    }
}
