-- Anki daily history: one row per user per day (latest snapshot for that day).
-- Powers the reviews-per-day and streak trend charts on the Academics hub.

-- CreateTable
CREATE TABLE "AnkiHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "dueCards" INTEGER NOT NULL DEFAULT 0,
    "newCards" INTEGER NOT NULL DEFAULT 0,
    "reviewedToday" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnkiHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnkiHistory_userId_day_key" ON "AnkiHistory"("userId", "day");

-- CreateIndex
CREATE INDEX "AnkiHistory_userId_day_idx" ON "AnkiHistory"("userId", "day");

-- AddForeignKey
ALTER TABLE "AnkiHistory" ADD CONSTRAINT "AnkiHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
