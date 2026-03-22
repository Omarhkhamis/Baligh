import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth';
import { decryptAnalysisLogFields } from '@/lib/data-security';
import { getAdminLocaleFromCookieStore } from '@/lib/admin-locale';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

async function getDashboardData(currentRole: string) {
    const rawTeamMembers = await prisma.teamMember.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    type TeamMemberModel = Awaited<ReturnType<typeof prisma.teamMember.findMany>>[number];
    const teamMembers = rawTeamMembers.map((member: TeamMemberModel) => ({
        ...member,
        name: member.name as Record<string, string>,
        role: member.role as Record<string, string>,
    }));

    const [analysesAll, legalReportCount, newsCount, reportCount] = await Promise.all([
        prisma.analysisLog.findMany({ select: { id: true, aiScores: true } }),
        prisma.legalReport.count(),
        prisma.newsArticle.count(),
        prisma.reportStudy.count(),
    ]);

    const analysisCount = analysesAll.length;

    const canReadRawReports = currentRole === 'SUPER_ADMIN' || currentRole === 'ANALYST';
    const recentAnalysesRaw = canReadRawReports
        ? await prisma.analysisLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                legalReports: {
                    select: {
                        reportNumber: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        })
        : [];
    const recentAnalyses = recentAnalysesRaw.map((item: typeof recentAnalysesRaw[number]) => {
        const decrypted = decryptAnalysisLogFields(item);

        return {
            id: decrypted.id,
            inputText: decrypted.inputText,
            classification: decrypted.classification,
            riskLevel: decrypted.riskLevel,
            reportNumber: item.legalReports[0]?.reportNumber || null,
            confidenceScore: decrypted.confidenceScore?.toString() || '0',
            detectedKeywords: decrypted.detectedKeywords,
            aiScores: decrypted.aiScores,
            createdAt: decrypted.createdAt.toISOString(),
            updatedAt: decrypted.updatedAt.toISOString(),
        };
    });

    return {
        teamMembers,
        stats: {
            analysisCount,
            legalReportCount,
            newsCount,
            reportCount,
        },
        recentAnalyses,
    };
}

export default async function AdminPage() {
    const session = await getSessionFromCookies();
    const cookieStore = await cookies();
    const locale = getAdminLocaleFromCookieStore(cookieStore);

    if (!session) {
        redirect('/login?redirect=/admin');
    }

    const [{ teamMembers, stats, recentAnalyses }, notifications] = await Promise.all([
        getDashboardData(session.role),
        session.role === 'SUPER_ADMIN' || session.role === 'ANALYST'
            ? prisma.adminNotification.findMany({
                where: { recipientId: session.sub },
                orderBy: { createdAt: 'desc' },
                take: 8,
                select: {
                    id: true,
                    title: true,
                    message: true,
                    reportNumber: true,
                    isRead: true,
                    createdAt: true,
                },
            })
            : Promise.resolve([]),
    ]);

    return (
        <AdminPageShell
            currentRole={session.role}
            email={session.email}
            locale={locale}
            stats={stats}
            teamMembers={teamMembers}
            recentAnalyses={recentAnalyses}
            notifications={notifications.map((item) => ({
                ...item,
                createdAt: item.createdAt.toISOString(),
            }))}
        />
    );
}
