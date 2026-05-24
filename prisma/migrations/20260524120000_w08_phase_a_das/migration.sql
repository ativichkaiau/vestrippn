-- ============================================================================
-- W08 PHASE A — SECTOR DAS (Document & Assessment Store)
-- Purely ADDITIVE. No ALTER/DROP on any W07 table => cannot break W07 surfaces.
-- The CREATE EXTENSION below is the Step 0 gate: if pgvector is unavailable the
-- whole migration aborts in one transaction before any table is created.
-- ============================================================================

-- Step 0 gate: pgvector must be installable on this host.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('pdf', 'text', 'url');

-- CreateEnum
CREATE TYPE "IeltsSection" AS ENUM ('reading', 'listening', 'writing', 'speaking');

-- CreateEnum
CREATE TYPE "AttemptItemType" AS ENUM ('ielts', 'case');

-- CreateTable
CREATE TABLE "StudyDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "originalUrl" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "metadata" JSONB NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IELTSItem" (
    "id" TEXT NOT NULL,
    "section" "IeltsSection" NOT NULL,
    "skill" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "answerKey" JSONB NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "IELTSItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "branches" JSONB NOT NULL,
    "citations" TEXT[],

    CONSTRAINT "ClinicalCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "AttemptItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "embeddingTokens" INTEGER NOT NULL DEFAULT 0,
    "chatTokens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (user-scoped access paths)
CREATE INDEX "StudyDocument_userId_idx" ON "StudyDocument"("userId");
CREATE INDEX "DocumentChunk_userId_idx" ON "DocumentChunk"("userId");
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
CREATE INDEX "UserAttempt_userId_idx" ON "UserAttempt"("userId");
CREATE INDEX "UserAttempt_itemType_itemId_idx" ON "UserAttempt"("itemType", "itemId");
CREATE INDEX "UserUsage_userId_idx" ON "UserUsage"("userId");

-- CreateIndex (one usage row per user per billing month; enables upsert)
CREATE UNIQUE INDEX "UserUsage_userId_month_key" ON "UserUsage"("userId", "month");

-- CreateIndex (HNSW ANN index for cosine similarity; used by Phase B chat retrieval)
CREATE INDEX "DocumentChunk_embedding_hnsw_idx"
    ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "StudyDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
