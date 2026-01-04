/**
 * Database module - Export all database utilities
 */

// Analysis services
export { DatabaseService, setDatabaseAdapter, useInMemoryDatabase } from './service';
export type { DatabaseAdapter } from './service';

// Reports services
export { ReportsService, setReportsAdapter, useInMemoryReports } from './service';
export type { ReportsAdapter } from './service';

// Types
export type { AnalysisRecord, InitiativeReport } from './types';
export { createAnalysisRecord, createInitiativeReport } from './types';
