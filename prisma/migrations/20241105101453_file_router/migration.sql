/*
  Warnings:

  - You are about to drop the column `picture` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "picture",
ADD COLUMN     "pictureId" TEXT;

-- CreateTable
CREATE TABLE "Files" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "fileName" TEXT NOT NULL,
    "blobName" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Files_blobName_key" ON "Files"("blobName");

-- CreateIndex
CREATE UNIQUE INDEX "Files_blobUrl_key" ON "Files"("blobUrl");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
