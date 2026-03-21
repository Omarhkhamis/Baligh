'use client';

import AppHeader from '@/components/AppHeader';
import { ReportFlowPanel } from '@/components/reporting/ReportFlowPanel';

export default function AnalyzePage() {
    return (
        <div className="min-h-screen bg-[#f4f3ef]">
            <AppHeader />
            <main className="px-4 py-10 md:px-6 md:py-14">
                <ReportFlowPanel variant="page" />
            </main>
        </div>
    );
}
