/*
  Warnings:

  - Added the required column `tenantId` to the `TenantOrg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantOrg" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TenantOrg" ADD CONSTRAINT "TenantOrg_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
