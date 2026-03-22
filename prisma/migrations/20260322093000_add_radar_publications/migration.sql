CREATE TABLE "RadarPublication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "publishedById" UUID,
    "sourceDate" DATE,
    "data" JSONB NOT NULL,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "weeksWindow" INTEGER NOT NULL DEFAULT 52,
    "publishedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadarPublication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RadarPublication_publishedAt_idx"
ON "RadarPublication"("publishedAt");

CREATE INDEX "RadarPublication_sourceDate_idx"
ON "RadarPublication"("sourceDate");

CREATE INDEX "RadarPublication_publishedById_idx"
ON "RadarPublication"("publishedById");

ALTER TABLE "RadarPublication"
ADD CONSTRAINT "RadarPublication_publishedById_fkey"
FOREIGN KEY ("publishedById") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
