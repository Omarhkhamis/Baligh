import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const adapter = new PrismaPg(
    new Pool({
        connectionString: process.env.DATABASE_URL,
    })
);

const prisma = new PrismaClient({ adapter });

const TARGET_GROUPS = [
    'Druze',
    'Sunni Muslims',
    'Alawites',
    'Kurds',
    'Arabs',
    'Kurdish',
    'Christians',
    'Women / Children',
    'Other Groups / Minorities',
];

const PLATFORMS = ['facebook', 'x', 'telegram', 'youtube', 'instagram', 'tiktok', 'other'];
const LOCATIONS = ['Syria', 'Turkey', 'Germany', 'Lebanon', 'Iraq', 'Jordan'];
const ACCOUNT_TYPES = ['personal', 'media', 'political', 'religious', 'anonymous', 'military'];
const CONFLICT_CONTEXTS = ['active_conflict', 'tense', 'stable'];
const REACH_LEVELS = ['limited', 'moderate', 'wide'];
const DEHUMANIZATION = ['none', 'implicit', 'explicit'];

const SCENARIOS = {
    none: {
        aiClassification: 'none',
        classification: 'No hate speech',
        severity: 1,
        riskLevel: 'LOW',
        dehumanization: 'none',
        recommendedPath: 'no_action',
        pathSentence: 'This report remains documented for review without an operational escalation.',
        speechType: 'implicit',
        emotions: ['other'],
        confidence: 'low',
        incitement: false,
        glorification: false,
    },
    implicit: {
        aiClassification: 'implicit',
        classification: 'Implicit hate speech',
        severity: 3,
        riskLevel: 'MEDIUM',
        dehumanization: 'implicit',
        recommendedPath: 'monitoring',
        pathSentence: 'This report should enter the monitoring track for continued follow-up.',
        speechType: 'implicit',
        emotions: ['anger', 'generalization'],
        confidence: 'medium',
        incitement: false,
        glorification: false,
    },
    explicit: {
        aiClassification: 'explicit',
        classification: 'Explicit hate speech',
        severity: 4,
        riskLevel: 'HIGH',
        dehumanization: 'explicit',
        recommendedPath: 'legal_action',
        pathSentence: 'This report requires legal review with partner lawyers after human validation.',
        speechType: 'direct',
        emotions: ['hatred', 'contempt'],
        confidence: 'high',
        incitement: false,
        glorification: true,
    },
    incitement: {
        aiClassification: 'incitement',
        classification: 'Incitement',
        severity: 5,
        riskLevel: 'CRITICAL',
        dehumanization: 'explicit',
        recommendedPath: 'legal_action',
        pathSentence: 'This report should be escalated immediately for legal and platform review.',
        speechType: 'direct',
        emotions: ['hatred', 'revenge_desire', 'anger'],
        confidence: 'high',
        incitement: true,
        glorification: true,
    },
};

function startOfUtcWeek(input) {
    const date = new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

function addDays(input, amount) {
    const date = new Date(input);
    date.setUTCDate(date.getUTCDate() + amount);
    return date;
}

function pick(list, index) {
    return list[index % list.length];
}

function toReportNumber(index) {
    return `BLG-2026-${String(9001 + index).padStart(4, '0')}`;
}

function scenarioFor(weekIndex, sampleIndex) {
    if ([4, 11, 18, 24].includes(weekIndex) && sampleIndex >= 1) {
        return SCENARIOS.incitement;
    }

    if (weekIndex % 6 === 0) {
        return sampleIndex % 2 === 0 ? SCENARIOS.explicit : SCENARIOS.implicit;
    }

    if (weekIndex % 5 === 2) {
        return sampleIndex === 0 ? SCENARIOS.none : SCENARIOS.implicit;
    }

    if (weekIndex % 4 === 1) {
        return sampleIndex === 2 ? SCENARIOS.explicit : SCENARIOS.implicit;
    }

    return sampleIndex === 0 ? SCENARIOS.none : sampleIndex === 1 ? SCENARIOS.implicit : SCENARIOS.explicit;
}

function keywordsFor(targetGroup, scenarioKey, platform) {
    const base = {
        none: ['tension', 'identity', targetGroup.toLowerCase()],
        implicit: ['traitors', 'outsiders', targetGroup.toLowerCase()],
        explicit: ['vermin', 'purge', targetGroup.toLowerCase()],
        incitement: ['attack', 'cleanse', targetGroup.toLowerCase()],
    };

    return [...base[scenarioKey], platform];
}

function buildInputText(targetGroup, platform, scenarioKey, weekIndex, sampleIndex) {
    const messages = {
        none: `Monitoring sample ${weekIndex + 1}-${sampleIndex + 1}: discussion around ${targetGroup} on ${platform} without direct hate.`,
        implicit: `Monitoring sample ${weekIndex + 1}-${sampleIndex + 1}: coded hostility targeting ${targetGroup} is circulating on ${platform}.`,
        explicit: `Monitoring sample ${weekIndex + 1}-${sampleIndex + 1}: explicit derogatory language against ${targetGroup} is spreading on ${platform}.`,
        incitement: `Monitoring sample ${weekIndex + 1}-${sampleIndex + 1}: direct calls for action against ${targetGroup} are being amplified on ${platform}.`,
    };

    return messages[scenarioKey];
}

async function main() {
    const existing = await prisma.legalReport.findMany({
        where: {
            title: {
                startsWith: 'Radar Demo Seed -',
            },
        },
        select: {
            id: true,
            analysisLogId: true,
        },
    });

    if (existing.length > 0) {
        await prisma.legalReport.deleteMany({
            where: {
                id: {
                    in: existing.map((item) => item.id),
                },
            },
        });

        await prisma.analysisLog.deleteMany({
            where: {
                id: {
                    in: existing.map((item) => item.analysisLogId),
                },
            },
        });
    }

    const currentWeek = startOfUtcWeek(new Date());
    const weeks = 30;
    let inserted = 0;

    for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset -= 1) {
        const weekIndex = weeks - 1 - weekOffset;
        const weekDate = addDays(currentWeek, -weekOffset * 7);

        for (let sampleIndex = 0; sampleIndex < 4; sampleIndex += 1) {
            const scenarioKey =
                scenarioFor(weekIndex, sampleIndex).aiClassification;
            const scenario = SCENARIOS[scenarioKey];
            const targetGroup = pick(TARGET_GROUPS, weekIndex + sampleIndex);
            const platform = pick(PLATFORMS, weekIndex * 2 + sampleIndex);
            const location = pick(LOCATIONS, weekIndex + sampleIndex * 2);
            const accountType = pick(ACCOUNT_TYPES, weekIndex + sampleIndex);
            const conflictContext = pick(CONFLICT_CONTEXTS, weekIndex + sampleIndex);
            const reachLevel =
                scenarioKey === 'incitement'
                    ? 'wide'
                    : scenarioKey === 'explicit'
                        ? pick(['moderate', 'wide'], weekIndex + sampleIndex)
                        : pick(REACH_LEVELS, weekIndex + sampleIndex);
            const dehumanization =
                scenarioKey === 'none'
                    ? 'none'
                    : scenario.dehumanization || pick(DEHUMANIZATION, weekIndex + sampleIndex);
            const createdAt = addDays(weekDate, sampleIndex + 1);
            const reportNumber = toReportNumber(inserted);
            const finalPath =
                inserted % 17 === 0
                    ? 'rejected'
                    : scenario.recommendedPath === 'legal_action'
                        ? 'legal'
                        : scenario.recommendedPath === 'documentation'
                            ? 'documentation'
                            : scenario.recommendedPath === 'monitoring'
                                ? 'monitoring'
                                : null;
            const aiProcessingStatus = inserted % 23 === 0 ? 'failed' : 'done';
            const escalationFlag = scenarioKey === 'incitement';
            const humanReviewStatus =
                aiProcessingStatus === 'failed'
                    ? 'pending'
                    : escalationFlag
                        ? 'escalated'
                        : inserted % 4 === 0
                            ? 'reviewed'
                            : 'pending';
            const keywords = keywordsFor(targetGroup, scenarioKey, platform);
            const inputText = buildInputText(targetGroup, platform, scenarioKey, weekIndex, sampleIndex);

            const analysis = await prisma.analysisLog.create({
                data: {
                    inputText,
                    classification: scenario.classification,
                    riskLevel: scenario.riskLevel,
                    confidenceScore: scenario.severity,
                    detectedKeywords: keywords,
                    aiScores: {
                        source: 'radar-demo-seed',
                        weekIndex,
                        sampleIndex,
                    },
                    aiClassification: scenario.aiClassification,
                    aiSeverity: scenario.severity,
                    aiSeverityExplanation: `Demo severity explanation for ${scenario.classification}.`,
                    aiSpeechType: scenario.speechType,
                    aiConfidence: scenario.confidence,
                    aiContextSensitivity: scenarioKey === 'none' ? 'low' : scenarioKey === 'implicit' ? 'medium' : 'high',
                    aiTargetGroups: [targetGroup],
                    aiSymbolicReferences: scenarioKey === 'implicit' ? ['coded-threat'] : [],
                    aiEmotionsDetected: scenario.emotions,
                    aiDehumanizationLevel: dehumanization,
                    aiGeneralizationType: targetGroup === 'Kurds' || targetGroup === 'Arabs' ? 'ethnic' : 'religious',
                    aiAccountType: accountType,
                    aiReachLevel: reachLevel,
                    aiContentType: 'text',
                    aiLanguageRegister: scenarioKey === 'none' ? 'formal' : 'mixed',
                    aiConflictContext: conflictContext,
                    aiPublisherLocation: location,
                    aiRecommendedPath: scenario.recommendedPath,
                    aiPathSentence: scenario.pathSentence,
                    aiLegalBasis: scenario.severity >= 4 ? 'Demo legal basis for review' : null,
                    aiEscalationFlag: escalationFlag,
                    aiIncitementToAction: scenario.incitement,
                    aiGlorificationOfViolence: scenario.glorification,
                    aiNotes: 'Radar demo seed entry',
                    createdAt,
                },
            });

            await prisma.legalReport.create({
                data: {
                    analysisLogId: analysis.id,
                    reportNumber,
                    title: `Radar Demo Seed - ${inserted + 1}`,
                    details: `Seeded radar report for ${targetGroup} on ${platform}.`,
                    aiProcessingStatus,
                    escalationFlag,
                    humanReviewStatus,
                    platform,
                    postUrl: `https://example.org/reports/${reportNumber.toLowerCase()}`,
                    imageUrls: [],
                    targetGroupsUser: [targetGroup],
                    isDirectRisk: escalationFlag ? 'yes' : sampleIndex % 3 === 0 ? 'unknown' : 'no',
                    finalPath,
                    createdAt,
                },
            });

            inserted += 1;
        }
    }

    console.log(`Seeded ${inserted} radar demo reports.`);
}

main()
    .catch((error) => {
        console.error('Failed to seed radar demo data:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
