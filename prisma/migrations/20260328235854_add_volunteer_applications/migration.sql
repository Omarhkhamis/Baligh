CREATE TABLE "VolunteerApplication" (
    "id" UUID NOT NULL,
    "locale" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "volunteerArea" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "weeklyHours" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VolunteerApplication_createdAt_idx" ON "VolunteerApplication"("createdAt");
CREATE INDEX "VolunteerApplication_volunteerArea_idx" ON "VolunteerApplication"("volunteerArea");
