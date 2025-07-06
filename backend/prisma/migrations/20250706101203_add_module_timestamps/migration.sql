/*
  Warnings:

  - Added the required column `updatedAt` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
  ALTER TABLE "Module" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
  ALTER TABLE "Module" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
