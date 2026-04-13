/*
  Warnings:

  - You are about to drop the column `ACCOUNT_CODE` on the `ACCOUNTS` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ACCOUNT_NAME]` on the table `ACCOUNTS` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ACCOUNT_NAME` to the `ACCOUNTS` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OTP_TYPE" AS ENUM ('REGISTER', 'RESET_PASSWORD');

-- DropIndex
DROP INDEX "ACCOUNTS_ACCOUNT_CODE_key";

-- AlterTable
ALTER TABLE "ACCOUNTS" DROP COLUMN "ACCOUNT_CODE",
ADD COLUMN     "ACCOUNT_NAME" TEXT NOT NULL,
ADD COLUMN     "DELETED_AT" TIMESTAMP(6),
ADD COLUMN     "DESCRIPTION" VARCHAR(255);

-- CreateTable
CREATE TABLE "OTP_TOKENS" (
    "ID" SERIAL NOT NULL,
    "EMAIL" TEXT NOT NULL,
    "OTP_CODE" TEXT NOT NULL,
    "OTP_TYPE" "OTP_TYPE" NOT NULL,
    "EXPIRED_AT" TIMESTAMP(3) NOT NULL,
    "CREATED_AT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ACCOUNT_ID" INTEGER,

    CONSTRAINT "OTP_TOKENS_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE INDEX "OTP_TOKENS_EMAIL_idx" ON "OTP_TOKENS"("EMAIL");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_TOKENS_EMAIL_OTP_TYPE_key" ON "OTP_TOKENS"("EMAIL", "OTP_TYPE");

-- CreateIndex
CREATE UNIQUE INDEX "ACCOUNTS_ACCOUNT_CODE_key" ON "ACCOUNTS"("ACCOUNT_NAME");

-- AddForeignKey
ALTER TABLE "OTP_TOKENS" ADD CONSTRAINT "OTP_TOKENS_ACCOUNT_ID_fkey" FOREIGN KEY ("ACCOUNT_ID") REFERENCES "ACCOUNTS"("ACCOUNT_ID") ON DELETE SET NULL ON UPDATE CASCADE;
