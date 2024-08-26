/*
  Warnings:

  - You are about to drop the column `documentFields` on the `DocumentConfig` table. All the data in the column will be lost.
  - You are about to drop the column `templateFields` on the `DocumentConfig` table. All the data in the column will be lost.
  - Added the required column `description` to the `DocumentConfig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FieldTypes" AS ENUM ('shortText', 'longText', 'dateTime', 'select', 'checkBox');

-- AlterTable
ALTER TABLE "DocumentConfig" DROP COLUMN "documentFields",
DROP COLUMN "templateFields",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fieldConfig" JSONB NOT NULL DEFAULT '[{}]';
