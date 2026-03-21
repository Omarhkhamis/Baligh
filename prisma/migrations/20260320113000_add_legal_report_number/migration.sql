ALTER TABLE "LegalReport"
ADD COLUMN "reportNumber" TEXT;

CREATE UNIQUE INDEX "LegalReport_reportNumber_key"
ON "LegalReport"("reportNumber");
