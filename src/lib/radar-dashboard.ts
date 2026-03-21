import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decryptSensitiveStringArray } from '@/lib/data-security';

const CLASSIFICATION_KEYS = ['explicit', 'implicit', 'incitement', 'none'] as const;
const EMOTION_KEYS = [
    'hatred',
    'anger',
    'contempt',
    'gloating',
    'fear',
    'generalization',
    'revenge_desire',
    'other',
] as const;
const DEHUMANIZATION_KEYS = ['none', 'implicit', 'explicit'] as const;
const ACCOUNT_TYPE_KEYS = ['personal', 'media', 'political', 'religious', 'anonymous', 'military'] as const;
const CONFLICT_CONTEXT_KEYS = ['active_conflict', 'tense', 'stable'] as const;
const PLATFORM_KEYS = ['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other'] as const;

const REACH_WEIGHTS: Record<string, number> = {
    limited: 1,
    moderate: 1.35,
    wide: 1.7,
};

type ClassificationKey = (typeof CLASSIFICATION_KEYS)[number];
type EmotionKey = (typeof EMOTION_KEYS)[number];
type DehumanizationKey = (typeof DEHUMANIZATION_KEYS)[number];
type AccountTypeKey = (typeof ACCOUNT_TYPE_KEYS)[number];
type ConflictContextKey = (typeof CONFLICT_CONTEXT_KEYS)[number];
type PlatformKey = (typeof PLATFORM_KEYS)[number];

type RawWeeklyRow = {
    week: Date;
    aiClassification: string | null;
    count: bigint | number;
    avgSeverity: Prisma.Decimal | number | null;
    escalated: bigint | number;
};

type BreakdownItem = {
    key: string;
    label: string;
    count: number;
    percentage: number;
};

type WeeklyPoint = {
    weekStart: string;
    label: string;
    explicit: number;
    implicit: number;
    incitement: number;
    none: number;
    totalReports: number;
    avgSeverity: number;
    weightedIntensity: number;
    escalated: number;
    glorificationCount: number;
    incitementActionCount: number;
    topConflictContext: string | null;
};

type StackedWeeklyPoint = {
    weekStart: string;
    label: string;
    none: number;
    implicit: number;
    explicit: number;
};

type HeatLocation = {
    location: string;
    count: number;
    intensity: number;
};

type PeakAnnotation = {
    weekStart: string;
    label: string;
    context: string | null;
    weightedIntensity: number;
    escalated: number;
};

type TrendPoint = {
    weekStart: string;
    label: string;
    [key: string]: string | number;
};

type KeywordFrequency = {
    keyword: string;
    count: number;
};

type RadarSummary = {
    totalReports: number;
    averageSeverity: number;
    escalatedReports: number;
    activePlatforms: number;
    targetedGroups: number;
};

export type RadarDashboardData = {
    generatedAt: string;
    weeksWindow: number;
    summary: RadarSummary;
    escalationAlert: {
        active: boolean;
        count: number;
    };
    classificationBreakdown: BreakdownItem[];
    weeklyClassification: Array<{
        weekStart: string;
        classification: ClassificationKey;
        count: number;
        avgSeverity: number;
        escalated: number;
    }>;
    intensityTimeline: WeeklyPoint[];
    targetGroupBreakdown: BreakdownItem[];
    targetGroupTrend: TrendPoint[];
    platformBreakdown: BreakdownItem[];
    platformTrend: TrendPoint[];
    keywordFrequencies: KeywordFrequency[];
    emotions: Array<{
        key: EmotionKey;
        count: number;
        share: number;
    }>;
    dehumanizationTimeline: StackedWeeklyPoint[];
    accountTypeBreakdown: BreakdownItem[];
    locationHeatmap: HeatLocation[];
    peakAnnotations: PeakAnnotation[];
    incitementToActionCount: number;
    glorificationTotal: number;
    mainQueryText: string;
};

type RadarRecord = Prisma.LegalReportGetPayload<{
    select: {
        id: true;
        reportNumber: true;
        createdAt: true;
        platform: true;
        aiProcessingStatus: true;
        humanReviewStatus: true;
        finalPath: true;
        analysisLog: {
            select: {
                aiClassification: true;
                aiSeverity: true;
                aiTargetGroups: true;
                detectedKeywords: true;
                aiEmotionsDetected: true;
                aiDehumanizationLevel: true;
                aiReachLevel: true;
                aiConflictContext: true;
                aiAccountType: true;
                aiPublisherLocation: true;
                aiEscalationFlag: true;
                aiIncitementToAction: true;
                aiGlorificationOfViolence: true;
            };
        };
    };
}>;

function startOfUtcWeek(input: Date) {
    const date = new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

function addWeeks(input: Date, amount: number) {
    const date = new Date(input);
    date.setUTCDate(date.getUTCDate() + amount * 7);
    return date;
}

function toWeekKey(value: Date | string) {
    const date = typeof value === 'string' ? new Date(value) : value;
    return startOfUtcWeek(date).toISOString().slice(0, 10);
}

function toNumber(value: unknown) {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (value instanceof Prisma.Decimal) {
        return Number(value);
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function round(value: number, precision = 2) {
    return Number(value.toFixed(precision));
}

function formatWeekLabel(weekStart: string) {
    const date = new Date(`${weekStart}T00:00:00.000Z`);
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function normalizeClassification(value: string | null | undefined): ClassificationKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (CLASSIFICATION_KEYS.includes(normalized as ClassificationKey)) {
        return normalized as ClassificationKey;
    }
    return 'none';
}

function normalizePlatform(value: string | null | undefined): PlatformKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (PLATFORM_KEYS.includes(normalized as PlatformKey)) {
        return normalized as PlatformKey;
    }
    return 'other';
}

function normalizeEmotion(value: string | null | undefined): EmotionKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (EMOTION_KEYS.includes(normalized as EmotionKey)) {
        return normalized as EmotionKey;
    }
    return 'other';
}

function normalizeDehumanization(value: string | null | undefined): DehumanizationKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (DEHUMANIZATION_KEYS.includes(normalized as DehumanizationKey)) {
        return normalized as DehumanizationKey;
    }
    return 'none';
}

function normalizeAccountType(value: string | null | undefined): AccountTypeKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (ACCOUNT_TYPE_KEYS.includes(normalized as AccountTypeKey)) {
        return normalized as AccountTypeKey;
    }
    return 'anonymous';
}

function normalizeConflictContext(value: string | null | undefined): ConflictContextKey {
    const normalized = String(value || '').trim().toLowerCase();
    if (CONFLICT_CONTEXT_KEYS.includes(normalized as ConflictContextKey)) {
        return normalized as ConflictContextKey;
    }
    return 'stable';
}

function toTitleCase(value: string) {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function percentage(count: number, total: number) {
    if (total <= 0) {
        return 0;
    }
    return round((count / total) * 100, 1);
}

function createBreakdown(
    counts: Map<string, number>,
    total: number,
    limit = 8
): BreakdownItem[] {
    return Array.from(counts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, limit)
        .map(([key, count]) => ({
            key,
            label: key,
            count,
            percentage: percentage(count, total),
        }));
}

const MAIN_RADAR_QUERY = `WITH weekly AS (
  SELECT
    DATE_TRUNC('week', lr."createdAt") AS week,
    COALESCE(al."aiClassification"::text, 'none') AS "aiClassification",
    COUNT(*) AS count,
    ROUND(AVG(al."aiSeverity")::numeric, 2) AS "avgSeverity",
    COUNT(CASE WHEN al."aiEscalationFlag" = true THEN 1 END) AS escalated
  FROM "LegalReport" lr
  JOIN "AnalysisLog" al ON al.id = lr."analysisLogId"
  WHERE
    (lr."finalPath" IS NULL OR lr."finalPath" != 'rejected'::"FinalPath")
    AND lr."aiProcessingStatus" = 'done'::"AiProcessingStatus"
  GROUP BY week, "aiClassification"
),
latest_weeks AS (
  SELECT DISTINCT week
  FROM weekly
  ORDER BY week DESC
  LIMIT 52
)
SELECT weekly.*
FROM weekly
JOIN latest_weeks USING (week)
ORDER BY weekly.week DESC, weekly."aiClassification" ASC;`;

export async function getRadarDashboardData(options?: { includeKeywords?: boolean }) {
    const includeKeywords = options?.includeKeywords ?? false;
    const currentWeek = startOfUtcWeek(new Date());
    const earliestWeek = addWeeks(currentWeek, -51);

    const [weeklyRows, reports] = await Promise.all([
        prisma.$queryRawUnsafe<RawWeeklyRow[]>(MAIN_RADAR_QUERY),
        prisma.legalReport.findMany({
            where: {
                aiProcessingStatus: 'done',
                createdAt: {
                    gte: earliestWeek,
                },
                OR: [
                    { finalPath: null },
                    { finalPath: { not: 'rejected' } },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                reportNumber: true,
                createdAt: true,
                platform: true,
                aiProcessingStatus: true,
                humanReviewStatus: true,
                finalPath: true,
                analysisLog: {
                    select: {
                        aiClassification: true,
                        aiSeverity: true,
                        aiTargetGroups: true,
                        detectedKeywords: true,
                        aiEmotionsDetected: true,
                        aiDehumanizationLevel: true,
                        aiReachLevel: true,
                        aiConflictContext: true,
                        aiAccountType: true,
                        aiPublisherLocation: true,
                        aiEscalationFlag: true,
                        aiIncitementToAction: true,
                        aiGlorificationOfViolence: true,
                    },
                },
            },
        }),
    ]);

    const currentWeekIndex = new Map<string, WeeklyPoint>();
    const dehumanizationMap = new Map<string, StackedWeeklyPoint>();
    const targetGroupCounts = new Map<string, number>();
    const platformCounts = new Map<string, number>();
    const keywordCounts = new Map<string, number>();
    const emotionCounts = new Map<EmotionKey, number>();
    const accountTypeCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const weeklyConflictCounts = new Map<string, Map<string, number>>();
    const targetGroupWeeklyCounts = new Map<string, Map<string, number>>();
    const platformWeeklyCounts = new Map<string, Map<string, number>>();

    for (const emotion of EMOTION_KEYS) {
        emotionCounts.set(emotion, 0);
    }

    for (let offset = 0; offset < 52; offset += 1) {
        const week = addWeeks(earliestWeek, offset);
        const weekKey = toWeekKey(week);
        currentWeekIndex.set(weekKey, {
            weekStart: weekKey,
            label: formatWeekLabel(weekKey),
            explicit: 0,
            implicit: 0,
            incitement: 0,
            none: 0,
            totalReports: 0,
            avgSeverity: 0,
            weightedIntensity: 0,
            escalated: 0,
            glorificationCount: 0,
            incitementActionCount: 0,
            topConflictContext: null,
        });
        dehumanizationMap.set(weekKey, {
            weekStart: weekKey,
            label: formatWeekLabel(weekKey),
            none: 0,
            implicit: 0,
            explicit: 0,
        });
    }

    for (const row of weeklyRows) {
        const weekKey = toWeekKey(row.week);
        const point = currentWeekIndex.get(weekKey);
        if (!point) {
            continue;
        }

        const classification = normalizeClassification(row.aiClassification);
        point[classification] = toNumber(row.count);
        point.totalReports += toNumber(row.count);
        point.escalated += toNumber(row.escalated);
        point.avgSeverity = Math.max(point.avgSeverity, toNumber(row.avgSeverity));
    }

    for (const report of reports as RadarRecord[]) {
        const weekKey = toWeekKey(report.createdAt);
        const point = currentWeekIndex.get(weekKey);
        const dehumanizationPoint = dehumanizationMap.get(weekKey);
        if (!point || !dehumanizationPoint) {
            continue;
        }

        const classification = normalizeClassification(report.analysisLog.aiClassification);
        const severity = Math.max(0, Math.min(5, Number(report.analysisLog.aiSeverity || 0)));
        const reachWeight = REACH_WEIGHTS[String(report.analysisLog.aiReachLevel || 'limited')] || 1;
        const weightedScore = severity * reachWeight;
        const dehumanization = normalizeDehumanization(report.analysisLog.aiDehumanizationLevel);
        const accountType = normalizeAccountType(report.analysisLog.aiAccountType);
        const platform = normalizePlatform(report.platform);
        const conflictContext = normalizeConflictContext(report.analysisLog.aiConflictContext);
        const location = String(report.analysisLog.aiPublisherLocation || '').trim();

        point.weightedIntensity = round(point.weightedIntensity + weightedScore, 2);
        if (report.analysisLog.aiGlorificationOfViolence) {
            point.glorificationCount += 1;
        }
        if (report.analysisLog.aiIncitementToAction) {
            point.incitementActionCount += 1;
        }

        const conflictMap = weeklyConflictCounts.get(weekKey) || new Map<string, number>();
        conflictMap.set(conflictContext, (conflictMap.get(conflictContext) || 0) + 1);
        weeklyConflictCounts.set(weekKey, conflictMap);

        platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
        accountTypeCounts.set(accountType, (accountTypeCounts.get(accountType) || 0) + 1);
        if (location) {
            locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
        }

        const platformTrend = platformWeeklyCounts.get(platform) || new Map<string, number>();
        platformTrend.set(weekKey, (platformTrend.get(weekKey) || 0) + 1);
        platformWeeklyCounts.set(platform, platformTrend);

        for (const targetGroup of report.analysisLog.aiTargetGroups) {
            const label = String(targetGroup || '').trim();
            if (!label) {
                continue;
            }
            targetGroupCounts.set(label, (targetGroupCounts.get(label) || 0) + 1);
            const trend = targetGroupWeeklyCounts.get(label) || new Map<string, number>();
            trend.set(weekKey, (trend.get(weekKey) || 0) + 1);
            targetGroupWeeklyCounts.set(label, trend);
        }

        if (includeKeywords) {
            for (const keyword of decryptSensitiveStringArray(report.analysisLog.detectedKeywords)) {
                const normalizedKeyword = String(keyword || '').trim();
                if (!normalizedKeyword) {
                    continue;
                }
                keywordCounts.set(normalizedKeyword, (keywordCounts.get(normalizedKeyword) || 0) + 1);
            }
        }

        for (const emotion of report.analysisLog.aiEmotionsDetected) {
            const normalizedEmotion = normalizeEmotion(emotion);
            emotionCounts.set(normalizedEmotion, (emotionCounts.get(normalizedEmotion) || 0) + 1);
        }

        dehumanizationPoint[dehumanization] += 1;

        if (classification === 'none' && point.avgSeverity === 0) {
            point.avgSeverity = severity;
        }
    }

    const intensityTimeline = Array.from(currentWeekIndex.values())
        .sort((left, right) => left.weekStart.localeCompare(right.weekStart))
        .map((point) => {
            const conflictMap = weeklyConflictCounts.get(point.weekStart);
            const topConflictContext = conflictMap
                ? Array.from(conflictMap.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] || null
                : null;
            return {
                ...point,
                topConflictContext,
                avgSeverity: point.totalReports > 0 ? round(point.avgSeverity, 2) : 0,
                weightedIntensity: point.totalReports > 0 ? round(point.weightedIntensity / point.totalReports, 2) : 0,
            };
        });

    const peakAnnotations = [...intensityTimeline]
        .filter((point) => point.totalReports > 0)
        .sort((left, right) => right.weightedIntensity - left.weightedIntensity || right.escalated - left.escalated)
        .slice(0, 4)
        .map((point) => ({
            weekStart: point.weekStart,
            label: point.label,
            context: point.topConflictContext,
            weightedIntensity: point.weightedIntensity,
            escalated: point.escalated,
        }));

    const totalReports = reports.length;
    const classificationCounts = new Map<ClassificationKey, number>();
    for (const key of CLASSIFICATION_KEYS) {
        classificationCounts.set(key, 0);
    }
    for (const report of reports as RadarRecord[]) {
        const key = normalizeClassification(report.analysisLog.aiClassification);
        classificationCounts.set(key, (classificationCounts.get(key) || 0) + 1);
    }

    const classificationBreakdown = CLASSIFICATION_KEYS.map((key) => ({
        key,
        label: key,
        count: classificationCounts.get(key) || 0,
        percentage: percentage(classificationCounts.get(key) || 0, totalReports),
    }));

    const weeklyClassification = weeklyRows.map((row) => ({
        weekStart: toWeekKey(row.week),
        classification: normalizeClassification(row.aiClassification),
        count: toNumber(row.count),
        avgSeverity: round(toNumber(row.avgSeverity), 2),
        escalated: toNumber(row.escalated),
    }));

    const topTargetGroups = Array.from(targetGroupCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([key]) => key);
    const targetGroupTrend = intensityTimeline.map((point) => {
        const row: TrendPoint = {
            weekStart: point.weekStart,
            label: point.label,
        };
        for (const targetGroup of topTargetGroups) {
            row[targetGroup] = targetGroupWeeklyCounts.get(targetGroup)?.get(point.weekStart) || 0;
        }
        return row;
    });

    const topPlatforms = Array.from(platformCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 4)
        .map(([key]) => key);
    const platformTrend = intensityTimeline.map((point) => {
        const row: TrendPoint = {
            weekStart: point.weekStart,
            label: point.label,
        };
        for (const platform of topPlatforms) {
            row[platform] = platformWeeklyCounts.get(platform)?.get(point.weekStart) || 0;
        }
        return row;
    });

    const totalEmotionCount = Array.from(emotionCounts.values()).reduce((sum, value) => sum + value, 0);
    const emotions = EMOTION_KEYS.map((key) => ({
        key,
        count: emotionCounts.get(key) || 0,
        share: percentage(emotionCounts.get(key) || 0, totalEmotionCount),
    }));

    const maxLocationCount = Math.max(...Array.from(locationCounts.values()), 1);
    const locationHeatmap = Array.from(locationCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 12)
        .map(([location, count]) => ({
            location,
            count,
            intensity: round(count / maxLocationCount, 2),
        }));

    const summary: RadarSummary = {
        totalReports,
        averageSeverity: totalReports > 0
            ? round(
                reports.reduce((sum, report) => sum + Number(report.analysisLog.aiSeverity || 0), 0) / totalReports,
                2
            )
            : 0,
        escalatedReports: reports.filter((report) => report.analysisLog.aiEscalationFlag).length,
        activePlatforms: platformCounts.size,
        targetedGroups: targetGroupCounts.size,
    };

    return {
        generatedAt: new Date().toISOString(),
        weeksWindow: 52,
        summary,
        escalationAlert: {
            active: summary.escalatedReports > 0,
            count: summary.escalatedReports,
        },
        classificationBreakdown,
        weeklyClassification,
        intensityTimeline,
        targetGroupBreakdown: createBreakdown(targetGroupCounts, totalReports, 8),
        targetGroupTrend,
        platformBreakdown: createBreakdown(platformCounts, totalReports, 7),
        platformTrend,
        keywordFrequencies: Array.from(keywordCounts.entries())
            .sort((left, right) => right[1] - left[1])
            .slice(0, 24)
            .map(([keyword, count]) => ({ keyword, count })),
        emotions,
        dehumanizationTimeline: Array.from(dehumanizationMap.values()).sort((left, right) => left.weekStart.localeCompare(right.weekStart)),
        accountTypeBreakdown: createBreakdown(accountTypeCounts, totalReports, 6),
        locationHeatmap,
        peakAnnotations,
        incitementToActionCount: reports.filter((report) => report.analysisLog.aiIncitementToAction).length,
        glorificationTotal: reports.filter((report) => report.analysisLog.aiGlorificationOfViolence).length,
        mainQueryText: MAIN_RADAR_QUERY,
    } satisfies RadarDashboardData;
}
