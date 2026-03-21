import crypto from 'crypto';

const HOURLY_REPORT_LIMIT = 10;
const DAILY_REPORT_LIMIT = 50;
const STALE_ENTRY_TTL_MS = 48 * 60 * 60 * 1000;

export const REPORT_SUBMISSION_RATE_LIMIT_MESSAGE =
    'You have reached the daily report limit. Try again tomorrow.';

type RateLimitBucket = {
    key: string;
    count: number;
};

type RateLimitEntry = {
    hourly: RateLimitBucket;
    daily: RateLimitBucket;
    updatedAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalStore = globalThis as typeof globalThis & {
    __balghReportSubmissionRateLimitStore?: RateLimitStore;
};

const rateLimitStore = globalStore.__balghReportSubmissionRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalStore.__balghReportSubmissionRateLimitStore) {
    globalStore.__balghReportSubmissionRateLimitStore = rateLimitStore;
}

function formatWindowKey(date: Date, includeHour: boolean) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    if (!includeHour) {
        return `${year}-${month}-${day}`;
    }

    const hour = String(date.getUTCHours()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}`;
}

function cleanupStaleEntries(now: number) {
    for (const [ip, entry] of rateLimitStore.entries()) {
        if (now - entry.updatedAt > STALE_ENTRY_TTL_MS) {
            rateLimitStore.delete(ip);
        }
    }
}

function anonymizeRateLimitKey(ip: string) {
    const secret =
        process.env.RATE_LIMIT_HASH_KEY?.trim() ||
        process.env.COLUMN_ENCRYPTION_KEY?.trim() ||
        'baligh-report-rate-limit';

    return crypto
        .createHmac('sha256', secret)
        .update(ip)
        .digest('hex');
}

export function getRequestIp(headers: Headers) {
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        const firstIp = forwardedFor.split(',')[0]?.trim();
        if (firstIp) {
            return firstIp;
        }
    }

    const realIp = headers.get('x-real-ip')?.trim();
    if (realIp) {
        return realIp;
    }

    const connectingIp = headers.get('cf-connecting-ip')?.trim();
    if (connectingIp) {
        return connectingIp;
    }

    return 'unknown';
}

export function consumeReportSubmissionRateLimit(ip: string, now = new Date()) {
    const normalizedIp = ip.trim() || 'unknown';
    const rateLimitKey = anonymizeRateLimitKey(normalizedIp);
    const nowMs = now.getTime();

    cleanupStaleEntries(nowMs);

    const currentHourKey = formatWindowKey(now, true);
    const currentDayKey = formatWindowKey(now, false);
    const currentEntry = rateLimitStore.get(rateLimitKey);
    const entry: RateLimitEntry = currentEntry
        ? {
            hourly: { ...currentEntry.hourly },
            daily: { ...currentEntry.daily },
            updatedAt: nowMs,
        }
        : {
            hourly: { key: currentHourKey, count: 0 },
            daily: { key: currentDayKey, count: 0 },
            updatedAt: nowMs,
        };

    if (entry.hourly.key !== currentHourKey) {
        entry.hourly = { key: currentHourKey, count: 0 };
    }

    if (entry.daily.key !== currentDayKey) {
        entry.daily = { key: currentDayKey, count: 0 };
    }

    if (entry.hourly.count >= HOURLY_REPORT_LIMIT || entry.daily.count >= DAILY_REPORT_LIMIT) {
        rateLimitStore.set(rateLimitKey, entry);
        return {
            allowed: false,
            message: REPORT_SUBMISSION_RATE_LIMIT_MESSAGE,
        };
    }

    entry.hourly.count += 1;
    entry.daily.count += 1;
    rateLimitStore.set(rateLimitKey, entry);

    return {
        allowed: true,
    };
}
