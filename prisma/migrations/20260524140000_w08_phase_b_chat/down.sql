-- ============================================================================
-- ROLLBACK for 20260524140000_w08_phase_b_chat (reference only; Prisma does not
-- auto-run down migrations). Reverses Phase B chat + ingestion-column changes.
-- Note: enum values added via ALTER TYPE ADD VALUE ('docx') cannot be dropped
-- in PostgreSQL without recreating the type — left in place intentionally.
-- ============================================================================

DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "ChatThread" CASCADE;

ALTER TABLE "StudyDocument" DROP COLUMN IF EXISTS "pages";
ALTER TABLE "StudyDocument" DROP COLUMN IF EXISTS "status";

DROP TYPE IF EXISTS "ChatRole";
DROP TYPE IF EXISTS "SourceStatus";
