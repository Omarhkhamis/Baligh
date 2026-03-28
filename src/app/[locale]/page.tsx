import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import HeroSection from '../../components/landing/HeroSection';
import MonitoringSnapshot from '../../components/landing/MonitoringSnapshot';
import ReportsSection from '../../components/landing/ReportsSection';
import LatestNews from '../../components/landing/LatestNews';
import HomeAnalysisChecklist from '../../components/landing/HomeAnalysisChecklist';
import { getPublishedRadarDashboardData } from '../../lib/radar-dashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const publishedRadar = await getPublishedRadarDashboardData();

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main>
        <HeroSection />
        <MonitoringSnapshot
          data={publishedRadar.data}
          publication={publishedRadar.publication}
        />
        <ReportsSection />
        <LatestNews />
        <HomeAnalysisChecklist />
      </main>
      <AppFooter />
    </div>
  );
}
