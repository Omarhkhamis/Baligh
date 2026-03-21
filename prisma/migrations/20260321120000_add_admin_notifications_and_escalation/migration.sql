ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'ANALYST';

ALTER TABLE "LegalReport"
ADD COLUMN "escalationFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "humanReviewStatus" TEXT NOT NULL DEFAULT 'pending';

CREATE TABLE "AdminNotification" (
    "id" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reportNumber" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminNotification_recipientId_isRead_createdAt_idx"
ON "AdminNotification"("recipientId", "isRead", "createdAt");

CREATE INDEX "AdminNotification_reportNumber_idx"
ON "AdminNotification"("reportNumber");

ALTER TABLE "AdminNotification"
ADD CONSTRAINT "AdminNotification_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
