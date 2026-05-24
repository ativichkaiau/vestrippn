-- ============================================================================
-- W08 PHASE C — Learn (per-user clinical case progress)
-- Additive only. IELTSItem / ClinicalCase / UserAttempt already exist (Phase A).
-- ============================================================================

-- CreateTable
CREATE TABLE "CaseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseProgress_userId_idx" ON "CaseProgress"("userId");
CREATE UNIQUE INDEX "CaseProgress_userId_caseId_key" ON "CaseProgress"("userId", "caseId");

-- AddForeignKey
ALTER TABLE "CaseProgress" ADD CONSTRAINT "CaseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseProgress" ADD CONSTRAINT "CaseProgress_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ClinicalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
