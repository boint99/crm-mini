/*
  Warnings:

  - You are about to drop the column `NEW_COLUMN` on the `POSITIONS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EMPLOYEES" ALTER COLUMN "BIRTH_DATE" DROP NOT NULL;

-- AlterTable
ALTER TABLE "POSITIONS" DROP COLUMN "NEW_COLUMN";
