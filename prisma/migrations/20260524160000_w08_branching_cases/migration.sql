-- ============================================================================
-- W08 — branching ("choose-your-path") cases: per-user run state.
-- Additive only. Case content lives in ClinicalCase.branches (JSON, no schema
-- change). This only adds run-state storage to CaseProgress.
-- ============================================================================

ALTER TABLE "CaseProgress" ADD COLUMN "state" JSONB;
