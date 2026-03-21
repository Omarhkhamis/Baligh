import crypto from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const ENCRYPTION_PREFIX = 'enc:v1';
const ALLOWED_PLATFORMS = new Set(['facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other']);
const ALLOWED_RISKS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function parseArgs(argv) {
    const options = {
        dryRun: false,
        riskLevels: ['HIGH', 'CRITICAL'],
        limit: null,
        analysisId: null,
    };

    for (const arg of argv) {
        if (arg === '--dry-run') {
            options.dryRun = true;
            continue;
        }

        if (arg === '--all') {
            options.riskLevels = [...ALLOWED_RISKS];
            continue;
        }

        if (arg.startsWith('--risk-levels=')) {
            const values = arg
                .slice('--risk-levels='.length)
                .split(',')
                .map((value) => value.trim().toUpperCase())
                .filter((value) => ALLOWED_RISKS.includes(value));

            if (values.length > 0) {
                options.riskLevels = Array.from(new Set(values));
            }

            continue;
        }

        if (arg.startsWith('--limit=')) {
            const parsed = Number.parseInt(arg.slice('--limit='.length), 10);
            if (Number.isFinite(parsed) && parsed > 0) {
                options.limit = parsed;
            }
            continue;
        }

        if (arg.startsWith('--analysis-id=')) {
            const value = arg.slice('--analysis-id='.length).trim();
            if (value) {
                options.analysisId = value;
            }
        }
    }

    return options;
}

function getColumnEncryptionKey() {
    const value = process.env.COLUMN_ENCRYPTION_KEY?.trim();
    if (!value) {
        throw new Error('COLUMN_ENCRYPTION_KEY is required for decrypting and re-encrypting analysis data.');
    }

    return crypto.createHash('sha256').update(value).digest();
}

function isEncryptedValue(value) {
    return typeof value === 'string' && value.startsWith(`${ENCRYPTION_PREFIX}:`);
}

function decryptSensitiveText(value) {
    const normalized = typeof value === 'string' ? value : '';
    if (!normalized || !isEncryptedValue(normalized)) {
        return normalized;
    }

    const [, , ivPart, tagPart, encryptedPart] = normalized.split(':');
    if (!ivPart || !tagPart || !encryptedPart) {
        return normalized;
    }

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        getColumnEncryptionKey(),
        Buffer.from(ivPart, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
}

function encryptSensitiveText(value) {
    const normalized = typeof value === 'string' ? value : '';
    if (!normalized) {
        return '';
    }

    if (isEncryptedValue(normalized)) {
        return normalized;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getColumnEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [
        ENCRYPTION_PREFIX,
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url'),
    ].join(':');
}

function decryptSensitiveStringArray(values) {
    if (!Array.isArray(values) || values.length === 0) {
        return [];
    }

    if (values.length === 1 && isEncryptedValue(values[0])) {
        try {
            const parsed = JSON.parse(decryptSensitiveText(values[0]));
            return Array.isArray(parsed)
                ? parsed.filter((value) => typeof value === 'string' && value.trim().length > 0)
                : [];
        } catch {
            return [];
        }
    }

    return values.filter((value) => typeof value === 'string' && value.trim().length > 0);
}

function encryptSensitiveStringArray(values) {
    const normalized = Array.isArray(values)
        ? values.filter((value) => typeof value === 'string' && value.trim().length > 0)
        : [];

    if (normalized.length === 0) {
        return [];
    }

    return [encryptSensitiveText(JSON.stringify(normalized))];
}

function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function uniqueStrings(values) {
    return Array.from(
        new Set(
            values
                .filter((value) => typeof value === 'string')
                .map((value) => value.trim())
                .filter(Boolean)
        )
    );
}

function normalizePlatform(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return ALLOWED_PLATFORMS.has(normalized) ? normalized : 'other';
}

function normalizeDirectRisk(analysis, scores) {
    const raw = String(
        scores.immediateDanger ||
        scores.immediateDangerLabel ||
        scores.immediate_danger ||
        scores.immediate_danger_label ||
        ''
    ).trim().toLowerCase();
    if (raw === 'yes' || raw === 'no' || raw === 'unknown') {
        return raw;
    }

    if (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL') {
        return 'yes';
    }

    if (analysis.riskLevel === 'LOW') {
        return 'no';
    }

    return 'unknown';
}

function mapFinalPath(value) {
    if (value === 'legal_action') return 'legal';
    if (value === 'documentation') return 'documentation';
    if (value === 'monitoring') return 'monitoring';
    if (value === 'no_action') return 'rejected';
    return null;
}

function extractTargetGroups(analysis, scores, detectedKeywords) {
    return uniqueStrings([
        ...(Array.isArray(analysis.aiTargetGroups) ? analysis.aiTargetGroups : []),
        ...(Array.isArray(scores.targetGroups) ? scores.targetGroups : []),
        ...(Array.isArray(scores.target_groups) ? scores.target_groups : []),
        scores.target_group_label,
        scores.target_group,
        scores.targetGroup,
        ...detectedKeywords,
    ]);
}

function extractImageUrls(scores) {
    return uniqueStrings([
        ...(Array.isArray(scores.imageUrls) ? scores.imageUrls : []),
        ...(Array.isArray(scores.image_urls) ? scores.image_urls : []),
        ...(Array.isArray(scores.reportFileUrls) ? scores.reportFileUrls : []),
        ...(Array.isArray(scores.report_file_urls) ? scores.report_file_urls : []),
        ...(Array.isArray(scores.reportImageUrls) ? scores.reportImageUrls : []),
        ...(Array.isArray(scores.report_image_urls) ? scores.report_image_urls : []),
        scores.reportFileUrl,
        scores.report_file_url,
        scores.reportImageUrl,
        scores.report_image_url,
    ]);
}

function buildDetails(analysis, inputText, scores, targetGroups) {
    const postLink = scores.postLink || scores.post_link || '';
    const lines = [
        'Backfilled from AnalysisLog.',
        `Classification: ${analysis.classification}`,
        `Risk level: ${analysis.riskLevel}`,
        postLink ? `Post link: ${postLink}` : null,
        targetGroups.length > 0 ? `Target groups: ${targetGroups.join(', ')}` : null,
        scores.rationale || scores.reasoning_ar || scores.reasoning
            ? `Reasoning: ${scores.rationale || scores.reasoning_ar || scores.reasoning}`
            : null,
        inputText ? `Content: ${inputText}` : null,
    ];

    return lines.filter(Boolean).join('\n');
}

function buildTitle(analysis, targetGroups) {
    const suffix = targetGroups[0] ? ` - ${targetGroups[0]}` : '';
    return `Imported analysis - ${analysis.classification}${suffix}`;
}

async function generateReportNumber(tx, createdAt, offset = 0) {
    const year = createdAt.getUTCFullYear();
    const prefix = `BLG-${year}-`;
    const existingCount = await tx.legalReport.count({
        where: {
            reportNumber: {
                startsWith: prefix,
            },
        },
    });

    return `${prefix}${String(existingCount + 1 + offset).padStart(4, '0')}`;
}

function isUniqueConstraintError(error) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

const args = parseArgs(process.argv.slice(2));

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const where = {
        legalReports: {
            none: {},
        },
        ...(args.analysisId ? { id: args.analysisId } : { riskLevel: { in: args.riskLevels } }),
    };

    const analyses = await prisma.analysisLog.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        ...(args.limit ? { take: args.limit } : {}),
        select: {
            id: true,
            inputText: true,
            detectedKeywords: true,
            classification: true,
            riskLevel: true,
            aiTargetGroups: true,
            aiEscalationFlag: true,
            aiRecommendedPath: true,
            createdAt: true,
            aiScores: true,
        },
    });

    const preview = analyses.slice(0, 5).map((analysis) => {
        const scores = asRecord(analysis.aiScores);
        const detectedKeywords = decryptSensitiveStringArray(analysis.detectedKeywords);
        const targetGroups = extractTargetGroups(analysis, scores, detectedKeywords);

        return {
            id: analysis.id,
            classification: analysis.classification,
            riskLevel: analysis.riskLevel,
            createdAt: analysis.createdAt.toISOString(),
            targetGroups,
            hasPostLink: Boolean(scores.postLink || scores.post_link),
        };
    });

    console.log(
        JSON.stringify(
            {
                dryRun: args.dryRun,
                riskLevels: args.analysisId ? 'single-analysis' : args.riskLevels,
                requestedLimit: args.limit,
                matchedAnalyses: analyses.length,
                preview,
            },
            null,
            2
        )
    );

    if (args.dryRun || analyses.length === 0) {
        return;
    }

    let createdCount = 0;

    for (const analysis of analyses) {
        const scores = asRecord(analysis.aiScores);
        const inputText = decryptSensitiveText(analysis.inputText);
        const detectedKeywords = decryptSensitiveStringArray(analysis.detectedKeywords);
        const targetGroups = extractTargetGroups(analysis, scores, detectedKeywords);
        const imageUrls = encryptSensitiveStringArray(extractImageUrls(scores));

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                await prisma.$transaction(async (tx) => {
                    const reportNumber = await generateReportNumber(tx, analysis.createdAt, attempt);

                    await tx.legalReport.create({
                        data: {
                            analysisLogId: analysis.id,
                            reportNumber,
                            title: buildTitle(analysis, targetGroups),
                            details: buildDetails(analysis, inputText, scores, targetGroups),
                            aiProcessingStatus: 'done',
                            escalationFlag: Boolean(analysis.aiEscalationFlag) || analysis.riskLevel === 'CRITICAL',
                            humanReviewStatus: analysis.riskLevel === 'CRITICAL' ? 'escalated' : 'pending',
                            platform: normalizePlatform(scores.platform || scores.platformLabel || scores.platform_label),
                            postUrl:
                                typeof (scores.postLink || scores.post_link) === 'string' &&
                                String(scores.postLink || scores.post_link).trim()
                                    ? String(scores.postLink || scores.post_link).trim()
                                    : null,
                            imageUrls,
                            targetGroupsUser: targetGroups,
                            isDirectRisk: normalizeDirectRisk(analysis, scores),
                            finalPath: mapFinalPath(analysis.aiRecommendedPath),
                            createdAt: analysis.createdAt,
                        },
                    });
                });

                createdCount += 1;
                if (createdCount % 20 === 0) {
                    console.log(`Created ${createdCount} legal reports...`);
                }
                break;
            } catch (error) {
                if (isUniqueConstraintError(error) && attempt < 4) {
                    continue;
                }

                throw error;
            }
        }
    }

    console.log(
        JSON.stringify(
            {
                createdCount,
                skipped: analyses.length - createdCount,
            },
            null,
            2
        )
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
