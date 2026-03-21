-- CreateEnum
CREATE TYPE "AiProcessingStatus" AS ENUM ('pending', 'done', 'failed');

-- CreateEnum
CREATE TYPE "HumanReviewStatus" AS ENUM ('pending', 'reviewed', 'escalated', 'closed');

-- CreateEnum
CREATE TYPE "ReportPlatform" AS ENUM ('facebook', 'telegram', 'x', 'youtube', 'instagram', 'tiktok', 'other');

-- CreateEnum
CREATE TYPE "DirectRiskAnswer" AS ENUM ('yes', 'no', 'unknown');

-- CreateEnum
CREATE TYPE "AiClassification" AS ENUM ('explicit', 'implicit', 'incitement', 'none');

-- CreateEnum
CREATE TYPE "AiSpeechType" AS ENUM ('direct', 'implicit', 'symbolic', 'false_propaganda');

-- CreateEnum
CREATE TYPE "AiConfidenceLevel" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "AiContextSensitivity" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "AiEmotionDetected" AS ENUM ('hatred', 'anger', 'contempt', 'gloating', 'fear', 'generalization', 'revenge_desire', 'other');

-- CreateEnum
CREATE TYPE "AiDehumanizationLevel" AS ENUM ('none', 'implicit', 'explicit');

-- CreateEnum
CREATE TYPE "AiGeneralizationType" AS ENUM ('individual_to_group', 'geographic', 'religious', 'ethnic', 'none');

-- CreateEnum
CREATE TYPE "AiAccountType" AS ENUM ('personal', 'media', 'political', 'religious', 'anonymous', 'military');

-- CreateEnum
CREATE TYPE "AiReachLevel" AS ENUM ('limited', 'moderate', 'wide');

-- CreateEnum
CREATE TYPE "AiContentType" AS ENUM ('text', 'image', 'video', 'meme', 'comment', 'live_stream');

-- CreateEnum
CREATE TYPE "AiLanguageRegister" AS ENUM ('formal', 'colloquial', 'symbolic', 'mixed');

-- CreateEnum
CREATE TYPE "AiConflictContext" AS ENUM ('active_conflict', 'tense', 'stable');

-- CreateEnum
CREATE TYPE "AiRecommendedPath" AS ENUM ('legal_action', 'documentation', 'monitoring', 'no_action');

-- CreateEnum
CREATE TYPE "FinalPath" AS ENUM ('legal', 'documentation', 'monitoring', 'rejected');

-- AlterTable
ALTER TABLE "AnalysisLog" ADD COLUMN     "aiAccountType" "AiAccountType",
ADD COLUMN     "aiClassification" "AiClassification",
ADD COLUMN     "aiConfidence" "AiConfidenceLevel",
ADD COLUMN     "aiConflictContext" "AiConflictContext",
ADD COLUMN     "aiContentType" "AiContentType",
ADD COLUMN     "aiContextSensitivity" "AiContextSensitivity",
ADD COLUMN     "aiDehumanizationLevel" "AiDehumanizationLevel",
ADD COLUMN     "aiEmotionsDetected" "AiEmotionDetected"[] DEFAULT ARRAY[]::"AiEmotionDetected"[],
ADD COLUMN     "aiEscalationFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiGeneralizationType" "AiGeneralizationType",
ADD COLUMN     "aiGlorificationOfViolence" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiIncitementToAction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiLanguageRegister" "AiLanguageRegister",
ADD COLUMN     "aiLegalBasis" TEXT,
ADD COLUMN     "aiNotes" TEXT,
ADD COLUMN     "aiPathSentence" TEXT,
ADD COLUMN     "aiPublisherLocation" TEXT,
ADD COLUMN     "aiReachLevel" "AiReachLevel",
ADD COLUMN     "aiRecommendedPath" "AiRecommendedPath",
ADD COLUMN     "aiSeverity" SMALLINT,
ADD COLUMN     "aiSeverityExplanation" TEXT,
ADD COLUMN     "aiSpeechType" "AiSpeechType",
ADD COLUMN     "aiSymbolicReferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiTargetGroups" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "LegalReport" ADD COLUMN     "aiProcessingStatus" "AiProcessingStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "finalPath" "FinalPath",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isDirectRisk" "DirectRiskAnswer",
ADD COLUMN     "platform" "ReportPlatform",
ADD COLUMN     "postUrl" TEXT,
ADD COLUMN     "reviewedAt" DATE,
ADD COLUMN     "reviewedById" UUID,
ADD COLUMN     "targetGroupsUser" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "LegalReport"
ALTER COLUMN "humanReviewStatus" DROP DEFAULT;

ALTER TABLE "LegalReport"
ALTER COLUMN "humanReviewStatus" TYPE "HumanReviewStatus"
USING (
    CASE
        WHEN "humanReviewStatus" = 'pending' THEN 'pending'::"HumanReviewStatus"
        WHEN "humanReviewStatus" = 'escalated' THEN 'escalated'::"HumanReviewStatus"
        WHEN "humanReviewStatus" = 'reviewed' THEN 'reviewed'::"HumanReviewStatus"
        WHEN "humanReviewStatus" = 'closed' THEN 'closed'::"HumanReviewStatus"
        WHEN "humanReviewStatus" = 'in_review' THEN 'reviewed'::"HumanReviewStatus"
        WHEN "humanReviewStatus" = 'resolved' THEN 'closed'::"HumanReviewStatus"
        ELSE 'pending'::"HumanReviewStatus"
    END
);

ALTER TABLE "LegalReport"
ALTER COLUMN "humanReviewStatus" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "LegalReport_reviewedById_idx" ON "LegalReport"("reviewedById");

-- AddForeignKey
ALTER TABLE "LegalReport" ADD CONSTRAINT "LegalReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
