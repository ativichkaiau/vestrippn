-- Research Hub multi-source: extend ResearchExtraction with source/doi/abstract/year.
-- Additive only; W07 data untouched.

ALTER TABLE "ResearchExtraction"
    ADD COLUMN "source"   TEXT,
    ADD COLUMN "doi"      TEXT,
    ADD COLUMN "abstract" TEXT,
    ADD COLUMN "year"     INTEGER;
