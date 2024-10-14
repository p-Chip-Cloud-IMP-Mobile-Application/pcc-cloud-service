-- CreateEnum
CREATE TYPE "Action" AS ENUM ('register', 'search', 'document');

-- AlterTable
ALTER TABLE "MTICDocument" ADD COLUMN     "mTPLogId" TEXT;

-- CreateTable
CREATE TABLE "MTPLog" (
    "id" TEXT NOT NULL,
    "mticId" TEXT NOT NULL,
    "mticSessionId" TEXT NOT NULL,
    "action" "Action" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTPLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MTPLog" ADD CONSTRAINT "MTPLog_mticId_fkey" FOREIGN KEY ("mticId") REFERENCES "MTIC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTPLog" ADD CONSTRAINT "MTPLog_mticSessionId_fkey" FOREIGN KEY ("mticSessionId") REFERENCES "MTICSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTICDocument" ADD CONSTRAINT "MTICDocument_mTPLogId_fkey" FOREIGN KEY ("mTPLogId") REFERENCES "MTPLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
