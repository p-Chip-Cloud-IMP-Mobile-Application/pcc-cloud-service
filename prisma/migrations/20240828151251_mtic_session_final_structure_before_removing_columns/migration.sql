/*
  Warnings:

  - Added the required column `tenantUserId` to the `MTICSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MTICDocument" ADD COLUMN     "mticSessionId" TEXT,
ALTER COLUMN "mticLogId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MTICSession" ADD COLUMN     "tenantUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MTICSession" ADD CONSTRAINT "MTICSession_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "TenantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICDocument" ADD CONSTRAINT "MTICDocument_mticSessionId_fkey" FOREIGN KEY ("mticSessionId") REFERENCES "MTICSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
