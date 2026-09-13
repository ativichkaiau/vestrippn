CREATE TYPE "CoverageStatus" AS ENUM ('untouched', 'reviewed', 'tested');

CREATE TABLE "CoverageObjective" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "sourceTopicId" TEXT,
  "title" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "status" "CoverageStatus" NOT NULL DEFAULT 'untouched',
  "notes" TEXT NOT NULL DEFAULT '',
  "noteUrl" TEXT,
  "results" JSONB NOT NULL DEFAULT '[]',
  "revision" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoverageObjective_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoverageObjective_courseId_key_key" ON "CoverageObjective"("courseId", "key");
CREATE INDEX "CoverageObjective_userId_courseId_idx" ON "CoverageObjective"("userId", "courseId");
ALTER TABLE "CoverageObjective" ADD CONSTRAINT "CoverageObjective_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoverageObjective" ADD CONSTRAINT "CoverageObjective_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
