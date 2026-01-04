import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/session';
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs';
async function getDashboardData() {
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
    const feedbackCount = analysesAll.filter((a: { aiScores: unknown }) => {
        const scores = (a.aiScores as Record<string, unknown>) || {};
        return !scores.postLink && !scores.reporterCountry && !scores.targetGroup;
    }).length;

    const recentAnalysesRaw = await prisma.analysisLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
    const recentAnalyses = recentAnalysesRaw.map((item: typeof recentAnalysesRaw[number]) => ({
        id: item.id,
        inputText: item.inputText,
        classification: item.classification,
        riskLevel: item.riskLevel,
        confidenceScore: item.confidenceScore?.toString() || '0',
        detectedKeywords: item.detectedKeywords,
        aiScores: item.aiScores,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));

    return {
        teamMembers,
        stats: {
            analysisCount,
            feedbackCount,
            legalReportCount,
            newsCount,
            reportCount,
        },
        recentAnalyses,
    };
}

export default async function AdminPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('balgh_session')?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
        redirect('/login?redirect=/admin');
    }

    const { teamMembers, stats, recentAnalyses } = await getDashboardData();

    return (
        <div className="min-h-screen bg-gray-50" dir="ltr">
            <header className="border-b border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Signed in as {session.email}</p>
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
                <AdminDashboardTabs stats={stats} teamMembers={teamMembers} recentAnalyses={recentAnalyses} />
            </main>
        </div>
    );
}
