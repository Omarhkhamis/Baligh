import { prisma } from '@/lib/prisma';
import { getRadarDashboardData } from '@/lib/radar-dashboard';
import {
    canonicalizeTargetGroupValues,
    getTargetGroupKeyFromValue,
    type TargetGroupKey,
} from '@/lib/target-groups';

function sameStringArray(left: string[], right: string[]) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function canonicalizeTargetGroupKeys(values: unknown[]): TargetGroupKey[] {
    const keys = values
        .map((value) => (typeof value === 'string' ? getTargetGroupKeyFromValue(value) : null))
        .filter((value): value is TargetGroupKey => value !== null);

    return Array.from(new Set(keys));
}

function normalizeScores(raw: unknown) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return { changed: false, value: raw };
    }

    const scores = { ...(raw as Record<string, unknown>) };
    let changed = false;

    const canonicalGroups = canonicalizeTargetGroupValues([
        ...(Array.isArray(scores.targetGroups) ? scores.targetGroups.filter((value): value is string => typeof value === 'string') : []),
        ...(Array.isArray(scores.target_groups) ? scores.target_groups.filter((value): value is string => typeof value === 'string') : []),
        ...(Array.isArray(scores.aiTargetGroups) ? scores.aiTargetGroups.filter((value): value is string => typeof value === 'string') : []),
        ...(Array.isArray(scores.ai_target_groups) ? scores.ai_target_groups.filter((value): value is string => typeof value === 'string') : []),
        typeof scores.targetGroup === 'string' ? scores.targetGroup : null,
        typeof scores.target_group === 'string' ? scores.target_group : null,
        typeof scores.target_group_label === 'string' ? scores.target_group_label : null,
    ]);

    const canonicalKeys = canonicalizeTargetGroupKeys([
        ...(Array.isArray(scores.targetGroupKeys) ? scores.targetGroupKeys : []),
        ...(Array.isArray(scores.target_group_keys) ? scores.target_group_keys : []),
        ...canonicalGroups,
    ]);

    const canonicalJoined = canonicalGroups.join(', ');

    const setIfDifferent = (key: string, nextValue: unknown) => {
        const currentValue = scores[key];
        const isDifferent = Array.isArray(currentValue) && Array.isArray(nextValue)
            ? !sameStringArray(
                currentValue.filter((value): value is string => typeof value === 'string'),
                nextValue as string[]
            )
            : currentValue !== nextValue;

        if (isDifferent) {
            scores[key] = nextValue;
            changed = true;
        }
    };

    if ('targetGroups' in scores || canonicalGroups.length > 0) setIfDifferent('targetGroups', canonicalGroups);
    if ('target_groups' in scores || canonicalGroups.length > 0) setIfDifferent('target_groups', canonicalGroups);
    if ('aiTargetGroups' in scores || canonicalGroups.length > 0) setIfDifferent('aiTargetGroups', canonicalGroups);
    if ('ai_target_groups' in scores || canonicalGroups.length > 0) setIfDifferent('ai_target_groups', canonicalGroups);
    if ('targetGroup' in scores || canonicalJoined) setIfDifferent('targetGroup', canonicalJoined);
    if ('target_group' in scores || canonicalJoined) setIfDifferent('target_group', canonicalJoined);
    if ('target_group_label' in scores || canonicalJoined) setIfDifferent('target_group_label', canonicalJoined);
    if ('targetGroupKeys' in scores || canonicalKeys.length > 0) setIfDifferent('targetGroupKeys', canonicalKeys);
    if ('target_group_keys' in scores || canonicalKeys.length > 0) setIfDifferent('target_group_keys', canonicalKeys);

    return { changed, value: scores };
}

async function main() {
    const publicationRows = await prisma.$queryRaw<Array<{ id: string; sourceDate: Date | null }>>`
        SELECT id, "sourceDate"
        FROM "RadarPublication"
        ORDER BY "publishedAt" DESC
    `;

    let updatedLegalReports = 0;
    for (const report of await prisma.legalReport.findMany({ select: { id: true, targetGroupsUser: true } })) {
        const normalized = canonicalizeTargetGroupValues(report.targetGroupsUser);
        if (!sameStringArray(report.targetGroupsUser, normalized)) {
            await prisma.legalReport.update({
                where: { id: report.id },
                data: { targetGroupsUser: normalized },
            });
            updatedLegalReports += 1;
        }
    }

    let updatedAnalysisLogs = 0;
    for (const log of await prisma.analysisLog.findMany({ select: { id: true, aiTargetGroups: true, aiScores: true } })) {
        const normalizedGroups = canonicalizeTargetGroupValues(log.aiTargetGroups);
        const normalizedScores = normalizeScores(log.aiScores);
        if (!sameStringArray(log.aiTargetGroups, normalizedGroups) || normalizedScores.changed) {
            await prisma.analysisLog.update({
                where: { id: log.id },
                data: {
                    aiTargetGroups: normalizedGroups,
                    ...(normalizedScores.changed ? { aiScores: normalizedScores.value as object } : {}),
                },
            });
            updatedAnalysisLogs += 1;
        }
    }

    let updatedPublications = 0;
    for (const row of publicationRows) {
        const snapshot = await getRadarDashboardData({
            includeKeywords: true,
            endDate: row.sourceDate ?? null,
        });

        await prisma.$executeRawUnsafe(
            'UPDATE "RadarPublication" SET data = $1::jsonb, "totalReports" = $2, "weeksWindow" = $3, "updatedAt" = NOW() WHERE id = $4::uuid',
            JSON.stringify(snapshot),
            snapshot.summary.totalReports,
            snapshot.weeksWindow,
            row.id,
        );
        updatedPublications += 1;
    }

    const counts = await prisma.$queryRawUnsafe(`
        SELECT value, COUNT(*)::int AS count
        FROM (
            SELECT unnest("targetGroupsUser") AS value FROM "LegalReport"
            UNION ALL
            SELECT unnest("aiTargetGroups") AS value FROM "AnalysisLog"
        ) t
        WHERE value IS NOT NULL AND btrim(value) <> ''
        GROUP BY value
        ORDER BY count DESC, value ASC
    `);

    console.log(JSON.stringify({ updatedLegalReports, updatedAnalysisLogs, updatedPublications, counts }, null, 2));
}

main()
    .catch((error) => {
        console.error('Failed to normalize target groups', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
