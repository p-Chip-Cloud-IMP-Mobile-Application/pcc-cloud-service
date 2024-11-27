-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
