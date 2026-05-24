-- ============================================================================
-- ROLLBACK for 20260524120000_w08_phase_a_das
-- Reference only (Prisma does not auto-run down migrations). Apply manually to
-- fully reverse Phase A. Drops only W08 objects; W07 is untouched.
-- The vector extension is intentionally NOT dropped (other objects may use it).
-- ============================================================================

DROP TABLE IF EXISTS "DocumentChunk" CASCADE;
DROP TABLE IF EXISTS "StudyDocument" CASCADE;
DROP TABLE IF EXISTS "UserAttempt" CASCADE;
DROP TABLE IF EXISTS "UserUsage" CASCADE;
DROP TABLE IF EXISTS "IELTSItem" CASCADE;
DROP TABLE IF EXISTS "ClinicalCase" CASCADE;

DROP TYPE IF EXISTS "AttemptItemType";
DROP TYPE IF EXISTS "IeltsSection";
DROP TYPE IF EXISTS "SourceType";

-- Optional, only if nothing else depends on pgvector:
-- DROP EXTENSION IF EXISTS vector;
