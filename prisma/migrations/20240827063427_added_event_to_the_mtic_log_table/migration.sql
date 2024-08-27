
-- DropForeignKey
ALTER TABLE "MTICReader" DROP CONSTRAINT "MTICReader_tenantId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "documentFields" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "MTICReader" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MTICReader" ADD CONSTRAINT "MTICReader_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
