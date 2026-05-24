-- W08 PHASE B (pre-step): extend SourceType with 'docx'.
-- Isolated in its own migration so the new enum value is committed before any
-- later migration uses it (PostgreSQL forbids using a value added by
-- ALTER TYPE ... ADD VALUE within the same transaction).
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'docx';
