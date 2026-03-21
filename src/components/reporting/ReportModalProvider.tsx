'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ReportFlowPanel } from '@/components/reporting/ReportFlowPanel';

type ReportModalContextValue = {
    openReportModal: () => void;
    closeReportModal: () => void;
};

const ReportModalContext = createContext<ReportModalContextValue | null>(null);

export function ReportModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const value = useMemo<ReportModalContextValue>(() => ({
        openReportModal: () => setIsOpen(true),
        closeReportModal: () => setIsOpen(false),
    }), []);

    return (
        <ReportModalContext.Provider value={value}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
                    <div
                        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative z-10 mx-auto w-full max-w-[481px]">
                        <ReportFlowPanel onClose={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </ReportModalContext.Provider>
    );
}

export function useReportModal() {
    const context = useContext(ReportModalContext);

    if (!context) {
        throw new Error('useReportModal must be used within ReportModalProvider');
    }

    return context;
}
