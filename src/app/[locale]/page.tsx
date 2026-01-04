import AppHeader from '../../components/AppHeader';
import HeroSection from '../../components/landing/HeroSection';
import ServiceCards from '../../components/landing/ServiceCards';
import ReportsSection from '../../components/landing/ReportsSection';
import LatestNews from '../../components/landing/LatestNews';
import FinalCTA from '../../components/landing/FinalCTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main>
        <HeroSection />
        <ServiceCards />
        <ReportsSection />
        <LatestNews />
        <FinalCTA />
      </main>
    </div>
  );
}
