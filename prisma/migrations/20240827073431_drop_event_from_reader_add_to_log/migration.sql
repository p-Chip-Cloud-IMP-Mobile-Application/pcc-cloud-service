/*
  Warnings:

  - You are about to drop the column `event` on the `MTICReader` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MTICLog" ADD COLUMN     "event" "Event" NOT NULL DEFAULT 'create';

-- AlterTable
ALTER TABLE "MTICReader" DROP COLUMN "event";
