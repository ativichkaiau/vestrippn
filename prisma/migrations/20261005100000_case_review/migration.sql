CREATE TABLE "CaseReview" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "step" INTEGER NOT NULL DEFAULT 0,
  "dueAt" TIMESTAMP(3),
  "lastResult" TEXT NOT NULL,
  "lastRunAt" TIMESTAMP(3) NOT NULL,
  "misses" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CaseReview_userId_caseId_key" ON "CaseReview"("userId", "caseId");
CREATE INDEX "CaseReview_userId_dueAt_idx" ON "CaseReview"("userId", "dueAt");

ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ClinicalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
