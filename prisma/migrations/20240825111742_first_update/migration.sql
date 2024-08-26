-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrator', 'manager', 'individual');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('read', 'write', 'delete');

-- CreateEnum
CREATE TYPE "Event" AS ENUM ('create', 'read', 'update', 'delete', 'transfer');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "defaultTenantUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantOrgUser" (
    "tenantOrgId" TEXT NOT NULL,
    "tenantUserId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantOrgUser_pkey" PRIMARY KEY ("tenantOrgId","tenantUserId")
);

-- CreateTable
CREATE TABLE "DocumentConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateFields" JSONB NOT NULL DEFAULT '[{}]',
    "documentFields" JSONB NOT NULL DEFAULT '[{}]',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentConfigId" TEXT NOT NULL,
    "templateFields" JSONB NOT NULL DEFAULT '[{}]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantOrgDoc" (
    "tenantOrgId" TEXT NOT NULL,
    "documentTemplateId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantOrgDoc_pkey" PRIMARY KEY ("tenantOrgId","documentTemplateId")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "documentTemplateId" TEXT NOT NULL,
    "tenantOrgId" TEXT NOT NULL,
    "documentFields" JSONB NOT NULL DEFAULT '[{}]',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTIC" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTIC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTICLog" (
    "id" TEXT NOT NULL,
    "mticId" TEXT NOT NULL,
    "mticReaderId" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lon" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTICLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTICReader" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTICReader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTICDocument" (
    "id" TEXT NOT NULL,
    "mticLogId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTICDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishedDocument" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "mticId" TEXT NOT NULL,
    "documentJson" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_defaultTenantUserId_key" ON "User"("defaultTenantUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_userId_tenantId_key" ON "TenantUser"("userId", "tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultTenantUserId_fkey" FOREIGN KEY ("defaultTenantUserId") REFERENCES "TenantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantOrg" ADD CONSTRAINT "TenantOrg_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TenantOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantOrgUser" ADD CONSTRAINT "TenantOrgUser_tenantOrgId_fkey" FOREIGN KEY ("tenantOrgId") REFERENCES "TenantOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantOrgUser" ADD CONSTRAINT "TenantOrgUser_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "TenantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentConfig" ADD CONSTRAINT "DocumentConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_documentConfigId_fkey" FOREIGN KEY ("documentConfigId") REFERENCES "DocumentConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantOrgDoc" ADD CONSTRAINT "TenantOrgDoc_tenantOrgId_fkey" FOREIGN KEY ("tenantOrgId") REFERENCES "TenantOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantOrgDoc" ADD CONSTRAINT "TenantOrgDoc_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantOrgId_fkey" FOREIGN KEY ("tenantOrgId") REFERENCES "TenantOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICLog" ADD CONSTRAINT "MTICLog_mticId_fkey" FOREIGN KEY ("mticId") REFERENCES "MTIC"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICLog" ADD CONSTRAINT "MTICLog_mticReaderId_fkey" FOREIGN KEY ("mticReaderId") REFERENCES "MTICReader"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICReader" ADD CONSTRAINT "MTICReader_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICDocument" ADD CONSTRAINT "MTICDocument_mticLogId_fkey" FOREIGN KEY ("mticLogId") REFERENCES "MTICLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICDocument" ADD CONSTRAINT "MTICDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedDocument" ADD CONSTRAINT "PublishedDocument_mticId_fkey" FOREIGN KEY ("mticId") REFERENCES "MTIC"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PublishedDocument" ADD CONSTRAINT "PublishedDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PublishedDocument" ADD CONSTRAINT "PublishedDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
