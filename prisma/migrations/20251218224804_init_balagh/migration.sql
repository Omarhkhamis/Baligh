-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('PRESS_RELEASES', 'EVENTS', 'MEDIA', 'ANNOUNCEMENTS', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStudyCategory" AS ENUM ('MONTHLY_REPORT', 'RESEARCH', 'INFOGRAPHIC', 'POLICY_BRIEF', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" UUID NOT NULL,
    "name" JSON NOT NULL,
    "role" JSON NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisLog" (
    "id" UUID NOT NULL,
    "inputText" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "confidenceScore" DECIMAL(5,4) NOT NULL,
    "detectedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiScores" JSON,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AnalysisLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" UUID NOT NULL,
    "analysisLogId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "contactEmail" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalReport" (
    "id" UUID NOT NULL,
    "analysisLogId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LegalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" UUID NOT NULL,
    "title" JSON NOT NULL,
    "body" JSON NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportStudy" (
    "id" UUID NOT NULL,
    "title" JSON NOT NULL,
    "body" JSON NOT NULL,
    "category" "ReportStudyCategory" NOT NULL,
    "documentUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReportStudy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_sortOrder_idx" ON "TeamMember"("sortOrder");

-- CreateIndex
CREATE INDEX "AnalysisLog_riskLevel_idx" ON "AnalysisLog"("riskLevel");

-- CreateIndex
CREATE INDEX "AnalysisLog_createdAt_idx" ON "AnalysisLog"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_analysisLogId_idx" ON "FeedbackSubmission"("analysisLogId");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_status_idx" ON "FeedbackSubmission"("status");

-- CreateIndex
CREATE INDEX "LegalReport_analysisLogId_idx" ON "LegalReport"("analysisLogId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "ReportStudy_category_idx" ON "ReportStudy"("category");

-- CreateIndex
CREATE INDEX "ReportStudy_publishedAt_idx" ON "ReportStudy"("publishedAt");

-- AddForeignKey
ALTER TABLE "FeedbackSubmission" ADD CONSTRAINT "FeedbackSubmission_analysisLogId_fkey" FOREIGN KEY ("analysisLogId") REFERENCES "AnalysisLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalReport" ADD CONSTRAINT "LegalReport_analysisLogId_fkey" FOREIGN KEY ("analysisLogId") REFERENCES "AnalysisLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
