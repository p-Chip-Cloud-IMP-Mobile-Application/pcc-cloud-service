-- AlterTable
ALTER TABLE "DocumentConfig" ADD COLUMN     "isPrimary" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "MTICDocument" ADD COLUMN     "isPrimary" BOOLEAN DEFAULT false;
