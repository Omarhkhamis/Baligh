/**
 * Database Service - Abstract layer for database operations
 * This service can be connected to any database (Supabase, Firebase, MongoDB, PostgreSQL, etc.)
 */

import { AnalysisRecord, createAnalysisRecord, InitiativeReport, createInitiativeReport } from './types';
import { prisma } from '@/lib/prisma';

/**
 * Database adapter interface - implement this for your chosen database
 */
export interface DatabaseAdapter {
    saveAnalysis(record: AnalysisRecord): Promise<string>;  // Returns record ID
    getAnalysis(id: string): Promise<AnalysisRecord | null>;
    getAllAnalyses(limit?: number, offset?: number): Promise<AnalysisRecord[]>;
    updateFeedback(id: string, feedback: AnalysisRecord['user_feedback']): Promise<void>;
}

/**
 * In-memory adapter for testing (replace with real adapter later)
 * This stores data in memory only - data is lost when server restarts
 */
class InMemoryAdapter implements DatabaseAdapter {
    private records: Map<string, AnalysisRecord> = new Map();
    private counter = 0;

    async saveAnalysis(record: AnalysisRecord): Promise<string> {
        const id = `analysis_${++this.counter}_${Date.now()}`;
        this.records.set(id, { ...record, id });
        console.log(`[Database] Saved analysis record: ${id}`);
        return id;
    }

    async getAnalysis(id: string): Promise<AnalysisRecord | null> {
        return this.records.get(id) || null;
    }

    async getAllAnalyses(limit = 100, offset = 0): Promise<AnalysisRecord[]> {
        const all = Array.from(this.records.values());
        return all.slice(offset, offset + limit);
    }

    async updateFeedback(id: string, feedback: AnalysisRecord['user_feedback']): Promise<void> {
        const record = this.records.get(id);
        if (record) {
            record.user_feedback = feedback;
            this.records.set(id, record);
        }
    }
}

/**
 * Placeholder adapter that logs but doesn't store (for production without DB)
 */
class LogOnlyAdapter implements DatabaseAdapter {
    async saveAnalysis(record: AnalysisRecord): Promise<string> {
        const id = `log_${Date.now()}`;
        console.log('[Database] Analysis record (not stored):', JSON.stringify({
            id,
            classification: record.classification,
            risk_level: record.risk_level,
            speech_type: record.speech_type,
            target_group: record.target_group,
            locale: record.locale,
            created_at: record.created_at
        }, null, 2));
        return id;
    }

    async getAnalysis(): Promise<AnalysisRecord | null> {
        return null;
    }

    async getAllAnalyses(): Promise<AnalysisRecord[]> {
        return [];
    }

    async updateFeedback(): Promise<void> {
        // No-op
    }
}

class PrismaAnalysisAdapter implements DatabaseAdapter {
    private AnalysisModel!: Awaited<ReturnType<typeof prisma.analysisLog.findMany>>[number];

    private mapRisk(value: string): string {
        const normalized = (value || '').toLowerCase();
        if (normalized.includes('critical')) return 'CRITICAL';
        if (normalized.includes('high') || normalized.includes('عال')) return 'HIGH';
        if (normalized.includes('medium') || normalized.includes('متوسط')) return 'MEDIUM';
        return 'LOW';
    }

    async saveAnalysis(record: AnalysisRecord): Promise<string> {
        const created = await prisma.analysisLog.create({
            data: {
                inputText: record.input_text || '',
                classification: record.classification,
                riskLevel: this.mapRisk(record.risk_level) as any,
                confidenceScore: record.intensity_score ?? 0,
                detectedKeywords: record.detected_markers || [],
                aiScores: {
                    speech_type: record.speech_type,
                    intensity_score: record.intensity_score,
                    vulnerability_score: record.vulnerability_score,
                    context_score: record.context_score,
                    target_group: record.target_group,
                    rationale: record.rationale,
                    locale: record.locale,
                    created_at: record.created_at,
                    image_description: record.image_description,
                    has_image: record.has_image,
                },
                createdAt: record.created_at,
            },
        });
        return created.id;
    }

    async getAnalysis(id: string): Promise<AnalysisRecord | null> {
        const found = await prisma.analysisLog.findUnique({ where: { id } });
        if (!found) return null;
        return {
            id: found.id,
            input_text: found.inputText,
            image_description: (found.aiScores as any)?.image_description ?? null,
            has_image: !!(found.aiScores as any)?.has_image,
            classification: found.classification,
            risk_level: found.riskLevel,
            speech_type: (found.aiScores as any)?.speech_type ?? null,
            intensity_score: Number((found.aiScores as any)?.intensity_score ?? found.confidenceScore ?? 0),
            vulnerability_score: Number((found.aiScores as any)?.vulnerability_score ?? 0),
            context_score: Number((found.aiScores as any)?.context_score ?? 0),
            target_group: (found.aiScores as any)?.target_group ?? null,
            detected_markers: found.detectedKeywords || [],
            rationale: (found.aiScores as any)?.rationale ?? '',
            locale: (found.aiScores as any)?.locale ?? 'ar',
            created_at: found.createdAt,
        };
    }

    async getAllAnalyses(limit = 100, offset = 0): Promise<AnalysisRecord[]> {
        const list = await prisma.analysisLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        type AnalysisModel = Awaited<ReturnType<typeof prisma.analysisLog.findMany>>[number];
        return list.map((found: AnalysisModel) => ({
            id: found.id,
            input_text: found.inputText,
            image_description: (found.aiScores as any)?.image_description ?? null,
            has_image: !!(found.aiScores as any)?.has_image,
            classification: found.classification,
            risk_level: found.riskLevel,
            speech_type: (found.aiScores as any)?.speech_type ?? null,
            intensity_score: Number((found.aiScores as any)?.intensity_score ?? found.confidenceScore ?? 0),
            vulnerability_score: Number((found.aiScores as any)?.vulnerability_score ?? 0),
            context_score: Number((found.aiScores as any)?.context_score ?? 0),
            target_group: (found.aiScores as any)?.target_group ?? null,
            detected_markers: found.detectedKeywords || [],
            rationale: (found.aiScores as any)?.rationale ?? '',
            locale: (found.aiScores as any)?.locale ?? 'ar',
            created_at: found.createdAt,
        }));
    }

    async updateFeedback(id: string, feedback: AnalysisRecord['user_feedback']): Promise<void> {
        if (!feedback) return;
        await prisma.feedbackSubmission.create({
            data: {
                analysisLogId: id,
                message: feedback.reasoning,
                contactEmail: null,
            },
        });
    }
}

// Current adapter - use Prisma by default
let currentAdapter: DatabaseAdapter = new PrismaAnalysisAdapter();

/**
 * Set the database adapter
 * Call this at app startup with your chosen database adapter
 */
export function setDatabaseAdapter(adapter: DatabaseAdapter): void {
    currentAdapter = adapter;
    console.log('[Database] Adapter set:', adapter.constructor.name);
}

/**
 * Enable in-memory storage for development/testing
 */
export function useInMemoryDatabase(): void {
    currentAdapter = new InMemoryAdapter();
    console.log('[Database] Using in-memory storage');
}

/**
 * Database service - use these functions in your API routes
 */
export const DatabaseService = {
    /**
     * Save an analysis result
     */
    async saveAnalysis(
        inputText: string | null,
        imageDescription: string | null,
        hasImage: boolean,
        apiResponse: Parameters<typeof createAnalysisRecord>[3],
        locale: string
    ): Promise<string> {
        const record = createAnalysisRecord(
            inputText,
            imageDescription,
            hasImage,
            apiResponse,
            locale
        );
        return currentAdapter.saveAnalysis(record);
    },

    /**
     * Get a specific analysis by ID
     */
    async getAnalysis(id: string): Promise<AnalysisRecord | null> {
        return currentAdapter.getAnalysis(id);
    },

    /**
     * Get all analyses (paginated)
     */
    async getAllAnalyses(limit?: number, offset?: number): Promise<AnalysisRecord[]> {
        return currentAdapter.getAllAnalyses(limit, offset);
    },

    /**
     * Add user feedback to an analysis
     */
    async addFeedback(
        analysisId: string,
        correction: string,
        reasoning: string
    ): Promise<void> {
        return currentAdapter.updateFeedback(analysisId, {
            correction,
            reasoning,
            submitted_at: new Date()
        });
    }
};

/**
 * Reports adapter interface - implement this for your chosen database
 */
export interface ReportsAdapter {
    saveReport(report: InitiativeReport): Promise<string>;
    getReport(id: string): Promise<InitiativeReport | null>;
    getReportsByStatus(status: InitiativeReport['status']): Promise<InitiativeReport[]>;
    getAllReports(limit?: number, offset?: number): Promise<InitiativeReport[]>;
    updateReportStatus(id: string, status: InitiativeReport['status'], notes?: string): Promise<void>;
}

/**
 * In-memory reports adapter for testing
 */
class InMemoryReportsAdapter implements ReportsAdapter {
    private reports: Map<string, InitiativeReport> = new Map();
    private counter = 0;

    async saveReport(report: InitiativeReport): Promise<string> {
        const id = `report_${++this.counter}_${Date.now()}`;
        this.reports.set(id, { ...report, id });
        console.log(`[Database] Saved report: ${id}`);
        return id;
    }

    async getReport(id: string): Promise<InitiativeReport | null> {
        return this.reports.get(id) || null;
    }

    async getReportsByStatus(status: InitiativeReport['status']): Promise<InitiativeReport[]> {
        return Array.from(this.reports.values()).filter(r => r.status === status);
    }

    async getAllReports(limit = 100, offset = 0): Promise<InitiativeReport[]> {
        const all = Array.from(this.reports.values());
        return all.slice(offset, offset + limit);
    }

    async updateReportStatus(id: string, status: InitiativeReport['status'], notes?: string): Promise<void> {
        const report = this.reports.get(id);
        if (report) {
            report.status = status;
            report.reviewed_at = new Date();
            if (notes) report.reviewer_notes = notes;
            this.reports.set(id, report);
        }
    }
}

/**
 * Log-only reports adapter
 */
class LogOnlyReportsAdapter implements ReportsAdapter {
    async saveReport(report: InitiativeReport): Promise<string> {
        const id = `log_report_${Date.now()}`;
        console.log('[Database] Report (not stored):', JSON.stringify({
            id,
            analysis_id: report.analysis_id,
            reporter_country: report.reporter_country,
            target_group: report.target_group_selected,
            status: report.status,
            submitted_at: report.submitted_at
        }, null, 2));
        return id;
    }

    async getReport(): Promise<InitiativeReport | null> { return null; }
    async getReportsByStatus(): Promise<InitiativeReport[]> { return []; }
    async getAllReports(): Promise<InitiativeReport[]> { return []; }
    async updateReportStatus(): Promise<void> { }
}

// Current reports adapter
let currentReportsAdapter: ReportsAdapter = new LogOnlyReportsAdapter();

/**
 * Set the reports adapter
 */
export function setReportsAdapter(adapter: ReportsAdapter): void {
    currentReportsAdapter = adapter;
    console.log('[Database] Reports adapter set:', adapter.constructor.name);
}

/**
 * Enable in-memory storage for reports
 */
export function useInMemoryReports(): void {
    currentReportsAdapter = new InMemoryReportsAdapter();
    console.log('[Database] Using in-memory reports storage');
}

/**
 * Reports Service - for initiative reports
 */
export const ReportsService = {
    /**
     * Submit a new report
     */
    async submitReport(
        analysisId: string,
        postUrl: string,
        reporterCountry: string,
        targetGroup: string,
        additionalInfo?: string
    ): Promise<string> {
        const report = createInitiativeReport(
            analysisId,
            postUrl,
            reporterCountry,
            targetGroup,
            additionalInfo
        );
        return currentReportsAdapter.saveReport(report);
    },

    /**
     * Get a specific report
     */
    async getReport(id: string): Promise<InitiativeReport | null> {
        return currentReportsAdapter.getReport(id);
    },

    /**
     * Get pending reports for review
     */
    async getPendingReports(): Promise<InitiativeReport[]> {
        return currentReportsAdapter.getReportsByStatus('pending');
    },

    /**
     * Get all reports (paginated)
     */
    async getAllReports(limit?: number, offset?: number): Promise<InitiativeReport[]> {
        return currentReportsAdapter.getAllReports(limit, offset);
    },

    /**
     * Update report status
     */
    async updateStatus(
        reportId: string,
        status: InitiativeReport['status'],
        reviewerNotes?: string
    ): Promise<void> {
        return currentReportsAdapter.updateReportStatus(reportId, status, reviewerNotes);
    }
};

// Re-export types
export type { AnalysisRecord, InitiativeReport } from './types';
export { createAnalysisRecord, createInitiativeReport } from './types';
