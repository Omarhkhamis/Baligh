import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth';
import { formatRoleLabel } from '@/lib/permissions';
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs';
import { decryptAnalysisLogFields } from '@/lib/data-security';

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
        <div className="min-h-screen bg-gray-50" dir="ltr">
            <header className="border-b border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Signed in as {session.email}</p>
                        <p className="text-sm text-emerald-700 font-medium">{formatRoleLabel(session.role)}</p>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your application content</p>
                    </div>
                    <form action="/api/auth/logout" method="post">
                        <button className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100">
                            Logout
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <AdminDashboardTabs
                    currentRole={session.role}
                    stats={stats}
                    teamMembers={teamMembers}
                    recentAnalyses={recentAnalyses}
                    notifications={notifications.map((item) => ({
                        ...item,
                        createdAt: item.createdAt.toISOString(),
                    }))}
                />
            </main>
        </div>
    );
}
