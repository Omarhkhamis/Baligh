'use client';

import { useMemo, useState } from 'react';
import { type AdminRole } from '@/lib/permissions';
import { AdminPermissionsProvider } from './AdminPermissions';
import { TeamManager } from './TeamManager';
import { AdminAccountSettings } from './AdminAccountSettings';
import { AdminNewsManager } from './AdminNewsManager';
import { AdminReportsManager } from './AdminReportsManager';
import { AdminLegalReportsManager } from './AdminLegalReportsManager';

type TeamMember = Parameters<typeof TeamManager>[0]['initialMembers'][number];
type Analysis = {
    id: string;
    inputText: string;
    classification: string;
    riskLevel: string;
    reportNumber?: string | null;
    createdAt: string | Date;
};

type Stats = {
    analysisCount: number;
    legalReportCount: number;
    newsCount: number;
    reportCount: number;
};

type Notification = {
    id: string;
    title: string;
    message: string;
    reportNumber?: string | null;
    isRead: boolean;
    createdAt: string | Date;
};

type Props = {
    currentRole: AdminRole;
    stats: Stats;
    teamMembers: TeamMember[];
    recentAnalyses: Analysis[];
    notifications: Notification[];
};

export function AdminDashboardTabs({ currentRole, stats, teamMembers, recentAnalyses, notifications }: Props) {
    const tabs = useMemo(
        () => {
            const items = [{ key: 'dashboard', label: 'Dashboard', icon: '📊' }];

            if (currentRole === 'SUPER_ADMIN') {
                items.push({ key: 'team', label: 'Team Members', icon: '👥' });
            }

            if (currentRole === 'SUPER_ADMIN' || currentRole === 'EDITOR') {
                items.push({ key: 'news', label: 'News Articles', icon: '📰' });
                items.push({ key: 'reports', label: 'Report Studies', icon: '📑' });
            }

            if (currentRole === 'SUPER_ADMIN' || currentRole === 'ANALYST') {
                items.push({ key: 'legal', label: 'Legal Reports', icon: '⚖️' });
            }

            if (currentRole !== 'VIEWER') {
                items.push({ key: 'admin', label: 'Admin', icon: '👤' });
            }
            return items;
        },
        [currentRole]
    );
    const [active, setActive] = useState<string>('dashboard');

    return (
        <AdminPermissionsProvider role={currentRole}>
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActive(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition border ${
                                    active === tab.key
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {active === 'dashboard' && (
                    <div className="space-y-4">
                        {notifications.length > 0 && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-red-900">Internal Alerts</h2>
                                        <p className="text-sm text-red-700">High-priority escalations assigned to your role.</p>
                                    </div>
                                    <span className="inline-flex rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700">
                                        {notifications.length} alerts
                                    </span>
                                </div>
                                <div className="mt-3 space-y-3">
                                    {notifications.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-red-100 bg-white px-3 py-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString('en-US')}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                                            {item.reportNumber && (
                                                <p className="mt-2 text-xs font-semibold text-red-700">
                                                    Report: {item.reportNumber}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard title="Analyses" value={stats.analysisCount} />
                            <StatCard title="Legal Reports" value={stats.legalReportCount} />
                            <StatCard title="News" value={stats.newsCount} />
                            <StatCard title="Reports & Studies" value={stats.reportCount} />
                            <StatCard title="Team Members" value={teamMembers.length} />
                        </div>

                        {(currentRole === 'SUPER_ADMIN' || currentRole === 'ANALYST') && (
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-gray-900">Latest Analyses</h2>
                                    <span className="text-xs text-gray-500">Most recent 5 entries</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentAnalyses.length === 0 && (
                                        <p className="text-sm text-gray-500">No records yet.</p>
                                    )}
                                    {recentAnalyses.map((item) => (
                                        <div key={item.id} className="py-3 flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                                                {item.riskLevel.slice(0, 1)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 line-clamp-2">{item.inputText}</p>
                                                <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                                    <span>Classification: {item.classification}</span>
                                                    <span>Risk: {item.riskLevel}</span>
                                                    {item.reportNumber && <span>Report: {item.reportNumber}</span>}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString('en-US')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {active === 'team' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                        <TeamManager initialMembers={teamMembers} />
                    </div>
                )}

                {active === 'news' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">News Articles</h2>
                        <AdminNewsManager />
                    </div>
                )}
                {active === 'reports' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Reports & Studies</h2>
                        <AdminReportsManager />
                    </div>
                )}
                {active === 'legal' && (
                    <div className="space-y-3">
                        <AdminLegalReportsManager />
                    </div>
                )}
                {active === 'admin' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Admin Account</h2>
                        <AdminAccountSettings />
                    </div>
                )}
            </div>
        </AdminPermissionsProvider>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
