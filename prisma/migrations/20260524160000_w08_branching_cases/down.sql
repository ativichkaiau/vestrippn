-- ROLLBACK for 20260524160000_w08_branching_cases (reference only).
ALTER TABLE "CaseProgress" DROP COLUMN IF EXISTS "state";
