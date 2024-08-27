-- AlterTable
ALTER TABLE "MTICDocument" ADD COLUMN     "mticId" TEXT;

-- AddForeignKey
ALTER TABLE "MTICDocument" ADD CONSTRAINT "MTICDocument_mticId_fkey" FOREIGN KEY ("mticId") REFERENCES "MTIC"("id") ON DELETE SET NULL ON UPDATE CASCADE;