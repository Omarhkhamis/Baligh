'use client';

import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import TrainingContent from '../../../components/about/TrainingContent';

export default function TrainingPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AppHeader />
            <TrainingContent />
            <AppFooter />
        </div>
    );
}
