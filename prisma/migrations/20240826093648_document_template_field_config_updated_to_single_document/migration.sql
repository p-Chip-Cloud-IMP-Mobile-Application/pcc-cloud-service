/*
  Warnings:

  - You are about to drop the column `templateFields` on the `DocumentTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentTemplate" DROP COLUMN "templateFields",
ADD COLUMN     "templateFieldConfig" JSONB NOT NULL DEFAULT '[{}]';
