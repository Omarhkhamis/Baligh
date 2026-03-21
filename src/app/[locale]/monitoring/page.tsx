import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import { BalaghRadarDashboard } from '@/components/monitoring/BalaghRadarDashboard';
import { getSessionFromCookies } from '@/lib/auth';
import { verifyPermission } from '@/lib/permissions';
import { getRadarDashboardData } from '@/lib/radar-dashboard';

export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<{ locale: string }>;
};

export default async function MonitoringPage({ params }: PageProps) {
    const { locale } = await params;
    const session = await getSessionFromCookies();
    const showInternal = Boolean(session && verifyPermission(session.role, 'reports', 'GET'));
    const radarData = await getRadarDashboardData({ includeKeywords: showInternal });

    return (
        <div className="min-h-screen bg-[#f6f1e6]">
            <AppHeader />

            <main className="px-4 py-10 md:px-6 md:py-14">
                <div className="mx-auto max-w-7xl">
                    <BalaghRadarDashboard
                        locale={locale}
                        data={radarData}
                        showInternal={showInternal}
                    />
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
