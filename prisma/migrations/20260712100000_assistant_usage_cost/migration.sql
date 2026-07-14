-- Assistant usage/cost telemetry: token counts + estimated USD cost per call,
-- filled in after the OpenAI stream completes. All nullable (existing rows keep
-- NULLs).

ALTER TABLE "AssistantUsage" ADD COLUMN "model" TEXT;
ALTER TABLE "AssistantUsage" ADD COLUMN "promptTokens" INTEGER;
ALTER TABLE "AssistantUsage" ADD COLUMN "completionTokens" INTEGER;
ALTER TABLE "AssistantUsage" ADD COLUMN "costUsd" DOUBLE PRECISION;
