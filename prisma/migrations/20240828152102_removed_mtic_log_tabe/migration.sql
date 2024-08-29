/*
  Warnings:

  - You are about to drop the column `mticLogId` on the `MTICDocument` table. All the data in the column will be lost.
  - You are about to drop the `MTICLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MTICDocument" DROP CONSTRAINT "MTICDocument_mticLogId_fkey";

-- DropForeignKey
ALTER TABLE "MTICLog" DROP CONSTRAINT "MTICLog_mticId_fkey";

-- DropForeignKey
ALTER TABLE "MTICLog" DROP CONSTRAINT "MTICLog_mticReaderId_fkey";

-- DropForeignKey
ALTER TABLE "MTICLog" DROP CONSTRAINT "MTICLog_mticSessionId_fkey";

-- AlterTable
ALTER TABLE "MTICDocument" DROP COLUMN "mticLogId";

-- DropTable
DROP TABLE "MTICLog";
