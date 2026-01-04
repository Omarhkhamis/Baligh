'use client';

import { useMemo, useState } from 'react';
import { TeamManager } from './TeamManager';
import { AdminAccountSettings } from './AdminAccountSettings';
import { AdminNewsManager } from './AdminNewsManager';
import { AdminReportsManager } from './AdminReportsManager';
import { AdminFeedbackManager } from './AdminFeedbackManager';
import { AdminLegalReportsManager } from './AdminLegalReportsManager';

type TeamMember = Parameters<typeof TeamManager>[0]['initialMembers'][number];
type Analysis = {
    id: string;
    inputText: string;
    classification: string;
    riskLevel: string;
    createdAt: string | Date;
};

type Stats = {
    analysisCount: number;
    feedbackCount: number;
    legalReportCount: number;
    newsCount: number;
    reportCount: number;
};

type Props = {
    stats: Stats;
    teamMembers: TeamMember[];
    recentAnalyses: Analysis[];
};

export function AdminDashboardTabs({ stats, teamMembers, recentAnalyses }: Props) {
    const tabs = useMemo(
        () => [
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'team', label: 'Team Members', icon: '👥' },
            { key: 'news', label: 'News Articles', icon: '📰' },
            { key: 'reports', label: 'Report Studies', icon: '📑' },
            { key: 'feedback', label: 'User Feedback', icon: '💬' },
            { key: 'legal', label: 'Legal Reports', icon: '⚖️' },
            { key: 'admin', label: 'Admin', icon: '👤' },
        ],
        []
    );
    const [active, setActive] = useState<string>('dashboard');

    return (
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard title="Analyses" value={stats.analysisCount} />
                        <StatCard title="Feedback" value={stats.feedbackCount} />
                        <StatCard title="Legal Reports" value={stats.legalReportCount} />
                        <StatCard title="News" value={stats.newsCount} />
                        <StatCard title="Reports & Studies" value={stats.reportCount} />
                        <StatCard title="Team Members" value={teamMembers.length} />
                    </div>

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
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(item.createdAt).toLocaleString('en-US')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
            {active === 'feedback' && (
                <div className="space-y-3">
                    <AdminFeedbackManager />
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

function Placeholder({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-700">{description}</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon</p>
        </div>
    );
}
