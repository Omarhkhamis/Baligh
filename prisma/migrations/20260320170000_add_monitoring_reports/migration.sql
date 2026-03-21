-- CreateEnum
CREATE TYPE "MonitoringSeverity" AS ENUM ('CALM', 'ELEVATED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MonitoringReportStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "MonitoringReport" (
    "id" UUID NOT NULL,
    "dateFrom" TIMESTAMPTZ(6) NOT NULL,
    "dateTo" TIMESTAMPTZ(6) NOT NULL,
    "autoSeverity" "MonitoringSeverity" NOT NULL,
    "finalSeverity" "MonitoringSeverity" NOT NULL,
    "statsJson" JSON NOT NULL,
    "timelineJson" JSON NOT NULL,
    "platformsJson" JSON NOT NULL,
    "categoriesJson" JSON NOT NULL,
    "rawReportsJson" JSON,
    "commentaryTitle" TEXT,
    "commentaryContent" TEXT,
    "authorId" UUID,
    "status" "MonitoringReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "publishedAt" TIMESTAMPTZ(6),

    CONSTRAINT "MonitoringReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringReport_status_publishedAt_idx" ON "MonitoringReport"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "MonitoringReport_dateFrom_dateTo_idx" ON "MonitoringReport"("dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "MonitoringReport_authorId_idx" ON "MonitoringReport"("authorId");

-- AddForeignKey
ALTER TABLE "MonitoringReport" ADD CONSTRAINT "MonitoringReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
