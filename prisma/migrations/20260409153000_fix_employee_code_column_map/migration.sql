-- Rename incorrect employee code column to match Prisma mapping without data loss.
ALTER TABLE "EMPLOYEES" RENAME COLUMN "POSITION_CODE" TO "EMPLOYEE_CODE";
