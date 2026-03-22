'use client';

import type { AdminRole } from '@/lib/permissions';
import type { AdminLocale } from '@/lib/admin-locale';
import { AdminDashboardTabs } from './AdminDashboardTabs';
import { AdminI18nProvider, AdminLocaleSwitcher, useAdminI18n } from './AdminI18n';

type TeamMember = Parameters<typeof AdminDashboardTabs>[0]['teamMembers'][number];
type Analysis = Parameters<typeof AdminDashboardTabs>[0]['recentAnalyses'][number];
type Notification = Parameters<typeof AdminDashboardTabs>[0]['notifications'][number];
type Stats = Parameters<typeof AdminDashboardTabs>[0]['stats'];

type Props = {
    currentRole: AdminRole;
    email: string;
    locale: AdminLocale;
    stats: Stats;
    teamMembers: TeamMember[];
    recentAnalyses: Analysis[];
    notifications: Notification[];
};

function AdminPageContent({ currentRole, email, stats, teamMembers, recentAnalyses, notifications }: Omit<Props, 'locale'>) {
    const { dir, locale, t, formatRole } = useAdminI18n();

    return (
        <div className="min-h-screen bg-gray-50" dir={dir} lang={locale}>
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm text-gray-500">{t('header.signedInAs', { email })}</p>
                        <p className="text-sm font-medium text-emerald-700">{formatRole(currentRole)}</p>
                        <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
                        <p className="text-sm text-gray-500">{t('header.subtitle')}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                        <AdminLocaleSwitcher />
                        <form action="/api/auth/logout" method="post">
                            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                {t('common.logout')}
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <AdminDashboardTabs
                    currentRole={currentRole}
                    stats={stats}
                    teamMembers={teamMembers}
                    recentAnalyses={recentAnalyses}
                    notifications={notifications}
                />
            </main>
        </div>
    );
}

export function AdminPageShell({ locale, ...props }: Props) {
    return (
        <AdminI18nProvider locale={locale}>
            <AdminPageContent {...props} />
        </AdminI18nProvider>
    );
}
