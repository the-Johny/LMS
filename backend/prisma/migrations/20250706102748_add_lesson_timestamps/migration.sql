-- This is an empty migration.
     ALTER TABLE "Lesson" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
     ALTER TABLE "Lesson" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();