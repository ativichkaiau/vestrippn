-- Additive W85 workspace upgrade. Existing records and sign-in data are retained.
ALTER TABLE "User" ADD COLUMN "curriculumInitializedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN "dueAt" TIMESTAMP(3),
  ADD COLUMN "estimatedMinutes" INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "Semester" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Course" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "semesterId" TEXT NOT NULL,
  "code" TEXT NOT NULL, "name" TEXT NOT NULL, "canvasCourseId" TEXT,
  "canvasUrl" TEXT, "notebookUrl" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Exam" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL, "scheduledAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ResearchMilestone" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3), "estimatedMinutes" INTEGER NOT NULL DEFAULT 45,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ResearchMilestone_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StudyPlanDay" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "day" TEXT NOT NULL,
  "availableMinutes" INTEGER NOT NULL DEFAULT 120,
  "completedItems" JSONB NOT NULL DEFAULT '[]', "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyPlanDay_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FocusSessionRecord" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "clientId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL, "circuit" TEXT NOT NULL, "mode" TEXT NOT NULL,
  "target" INTEGER NOT NULL, "durationSec" INTEGER NOT NULL, "laps" INTEGER NOT NULL,
  "bestLap" DOUBLE PRECISION, "title" TEXT, "agendaItemId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FocusSessionRecord_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "UserPreferences" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "values" JSONB NOT NULL DEFAULT '{}',
  "revision" INTEGER NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Semester_userId_archivedAt_idx" ON "Semester"("userId", "archivedAt");
CREATE INDEX "Course_userId_semesterId_idx" ON "Course"("userId", "semesterId");
CREATE INDEX "Exam_userId_scheduledAt_idx" ON "Exam"("userId", "scheduledAt");
CREATE INDEX "ResearchMilestone_userId_completed_dueAt_idx" ON "ResearchMilestone"("userId", "completed", "dueAt");
CREATE UNIQUE INDEX "StudyPlanDay_userId_day_key" ON "StudyPlanDay"("userId", "day");
CREATE UNIQUE INDEX "FocusSessionRecord_userId_clientId_key" ON "FocusSessionRecord"("userId", "clientId");
CREATE INDEX "FocusSessionRecord_userId_startedAt_idx" ON "FocusSessionRecord"("userId", "startedAt");
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

ALTER TABLE "Semester" ADD CONSTRAINT "Semester_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResearchMilestone" ADD CONSTRAINT "ResearchMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyPlanDay" ADD CONSTRAINT "StudyPlanDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FocusSessionRecord" ADD CONSTRAINT "FocusSessionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
