import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { getDefaultRadarDescriptions, normalizeRadarDescriptions } from '@/lib/radar-descriptions';
import {
    getPublishedRadarDashboardData,
    getRadarPublicationHistory,
    publishRadarSnapshot,
    saveRadarDescriptionsOnly,
} from '@/lib/radar-dashboard';

function parseSourceDate(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const normalized = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return 'invalid';
    }

    const parsed = new Date(`${normalized}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? 'invalid' : parsed;
}

function parseRangeDates(startValue: unknown, endValue: unknown) {
    const startDate = parseSourceDate(startValue);
    const endDate = parseSourceDate(endValue);

    if (startDate === 'invalid' || endDate === 'invalid') {
        return 'invalid';
    }

    if ((startDate && !endDate) || (!startDate && endDate)) {
        return 'incomplete';
    }

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
        return 'reversed';
    }

    return {
        startDate,
        endDate,
    };
}

export async function GET(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'GET');
    if (auth.response) {
        return auth.response;
    }

    const [current, history] = await Promise.all([
        getPublishedRadarDashboardData({ includeKeywords: true }),
        getRadarPublicationHistory(8),
    ]);

    return NextResponse.json({
        current: current.publication,
        history,
        descriptions: current.data?.descriptions ?? getDefaultRadarDescriptions(),
        selectedRange: current.data?.selectedRange ?? { startDate: null, endDate: null },
    });
}

export async function POST(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'PATCH');
    if (auth.response) {
        return auth.response;
    }

    try {
        const body = await req.json().catch(() => ({}));
        const parsedRange = parseRangeDates(body.startDate, body.endDate);
        const descriptions = normalizeRadarDescriptions(body.descriptions);

        if (parsedRange === 'invalid') {
            return NextResponse.json({ error: 'Invalid radar range' }, { status: 400 });
        }
        if (parsedRange === 'incomplete') {
            return NextResponse.json({ error: 'Range start and end dates are both required' }, { status: 400 });
        }
        if (parsedRange === 'reversed') {
            return NextResponse.json({ error: 'Range start date cannot be after end date' }, { status: 400 });
        }

        const published = await publishRadarSnapshot({
            publishedById: auth.session!.sub,
            startDate: parsedRange.startDate,
            endDate: parsedRange.endDate,
            descriptions,
        });
        const history = await getRadarPublicationHistory(8);

        return NextResponse.json({
            success: true,
            current: published.publication,
            summary: published.data.summary,
            history,
            descriptions: published.data.descriptions,
            selectedRange: published.data.selectedRange,
        });
    } catch (error) {
        console.error('Failed to publish radar snapshot', error);
        return NextResponse.json({ error: 'Failed to publish radar snapshot' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'PATCH');
    if (auth.response) {
        return auth.response;
    }

    try {
        const body = await req.json().catch(() => ({}));
        const descriptions = normalizeRadarDescriptions(body.descriptions);

        const saved = await saveRadarDescriptionsOnly({
            descriptions,
        });
        const history = await getRadarPublicationHistory(8);

        return NextResponse.json({
            success: true,
            current: saved.publication,
            summary: saved.data.summary,
            history,
            descriptions: saved.data.descriptions,
            selectedRange: saved.data.selectedRange,
        });
    } catch (error) {
        console.error('Failed to save radar descriptions', error);
        if (error instanceof Error && error.message === 'No published radar snapshot available') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to save radar descriptions' }, { status: 500 });
    }
}
