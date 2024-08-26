/*
  Warnings:

  - Added the required column `description` to the `DocumentTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentTemplate" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "templateFieldConfig" SET DEFAULT '{}';
