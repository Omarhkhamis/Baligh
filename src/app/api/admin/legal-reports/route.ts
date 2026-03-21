import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { getSeverityScoreOutOfFive } from '@/lib/analysis-utils';
import {
    decryptAnalysisLogFields,
    decryptSensitiveStringArray,
    toDateOnlyTimestamp,
} from '@/lib/data-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VALID_HUMAN_REVIEW_STATUSES = new Set(['pending', 'reviewed', 'escalated', 'closed', 'in_review', 'resolved']);

export async function GET(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'GET');
    if (auth.response) {
        return auth.response;
    }

    const reportNumber = req.nextUrl.searchParams.get('reportNumber')?.trim() || '';
    const severity = Number(req.nextUrl.searchParams.get('severity') || '');
    const dateFrom = req.nextUrl.searchParams.get('dateFrom')?.trim() || '';
    const dateTo = req.nextUrl.searchParams.get('dateTo')?.trim() || '';

    const where: {
        reportNumber?: { contains: string; mode: 'insensitive' };
        createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (reportNumber) {
        where.reportNumber = {
            contains: reportNumber,
            mode: 'insensitive',
        };
    }

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
            where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
        }
        if (dateTo) {
            where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
        }
    }

    const reports = await prisma.legalReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { analysisLog: true },
    });

    const filteredReports =
        Number.isInteger(severity) && severity >= 1 && severity <= 5
            ? reports.filter((report) => {
                  const scores = (report.analysisLog.aiScores as { severity_score?: number | string } | null) || {};
                  const directSeverity = report.analysisLog.aiSeverity;
                  const rawScore = Number(scores.severity_score ?? report.analysisLog.confidenceScore ?? 0);
                  return (directSeverity || getSeverityScoreOutOfFive(rawScore)) === severity;
              })
            : reports;

    return NextResponse.json(
        filteredReports.map((report) => ({
            ...report,
            imageUrls: decryptSensitiveStringArray(report.imageUrls),
            analysisLog: decryptAnalysisLogFields(report.analysisLog),
        }))
    );
}

export async function PATCH(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'PATCH');
    if (auth.response) {
        return auth.response;
    }

    const body = await req.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    const humanReviewStatus = typeof body?.humanReviewStatus === 'string' ? body.humanReviewStatus.trim() : '';
    const reviewComment = typeof body?.reviewComment === 'string' ? body.reviewComment.trim() : '';

    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    if (!humanReviewStatus) {
        return NextResponse.json({ error: 'Missing human review status' }, { status: 400 });
    }
    if (!VALID_HUMAN_REVIEW_STATUSES.has(humanReviewStatus)) {
        return NextResponse.json({ error: 'Invalid human review status' }, { status: 400 });
    }

    const normalizedHumanReviewStatus =
        humanReviewStatus === 'in_review'
            ? 'reviewed'
            : humanReviewStatus === 'resolved'
                ? 'closed'
                : humanReviewStatus;
    const hasReviewer = normalizedHumanReviewStatus === 'reviewed' || normalizedHumanReviewStatus === 'closed';

    const updated = await prisma.legalReport.update({
        where: { id },
        data: {
            humanReviewStatus: normalizedHumanReviewStatus,
            reviewComment: reviewComment || null,
            reviewedById: hasReviewer ? auth.session?.sub || null : null,
            reviewedAt: hasReviewer ? toDateOnlyTimestamp(new Date()) : null,
        },
        include: {
            analysisLog: true,
        },
    });

    return NextResponse.json({
        ...updated,
        imageUrls: decryptSensitiveStringArray(updated.imageUrls),
        analysisLog: decryptAnalysisLogFields(updated.analysisLog),
    });
}

export async function DELETE(req: NextRequest) {
    const auth = await requirePermission(req, 'reports', 'DELETE');
    if (auth.response) {
        return auth.response;
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const report = await prisma.legalReport.findUnique({
        where: { id },
        include: {
            analysisLog: {
                select: {
                    aiScores: true,
                },
            },
        },
    });

    const scores = (report?.analysisLog.aiScores as {
        imageUrls?: string[];
        image_urls?: string[];
        reportImageUrl?: string;
        report_image_url?: string;
        reportImageUrls?: string[];
        report_image_urls?: string[];
        reportFileUrl?: string;
        report_file_url?: string;
        reportFileUrls?: string[];
        report_file_urls?: string[];
    } | null) || null;

    const reportImageUrls = [
        ...decryptSensitiveStringArray(report?.imageUrls),
        ...(Array.isArray(scores?.imageUrls) ? scores.imageUrls : []),
        ...(Array.isArray(scores?.image_urls) ? scores.image_urls : []),
        ...(Array.isArray(scores?.reportFileUrls) ? scores.reportFileUrls : []),
        ...(Array.isArray(scores?.report_file_urls) ? scores.report_file_urls : []),
        ...(Array.isArray(scores?.reportImageUrls) ? scores.reportImageUrls : []),
        ...(Array.isArray(scores?.report_image_urls) ? scores.report_image_urls : []),
        ...(scores?.reportFileUrl ? [scores.reportFileUrl] : []),
        ...(scores?.report_file_url ? [scores.report_file_url] : []),
        ...(scores?.reportImageUrl ? [scores.reportImageUrl] : []),
        ...(scores?.report_image_url ? [scores.report_image_url] : []),
    ].filter((value, index, array): value is string => typeof value === 'string' && value.startsWith('/uploads/') && array.indexOf(value) === index);

    await prisma.legalReport.delete({ where: { id } });

    await Promise.all(
        reportImageUrls.map(async (reportImageUrl) => {
            const filepath = path.join(process.cwd(), 'public', reportImageUrl.replace(/^\/+/, ''));
            try {
                await fs.unlink(filepath);
            } catch {
                // Ignore missing files during cleanup.
            }
        })
    );

    return NextResponse.json({ success: true });
}
