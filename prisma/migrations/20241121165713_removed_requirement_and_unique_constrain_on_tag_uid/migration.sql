-- DropIndex
DROP INDEX "tags_uid_key";

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "uid" DROP NOT NULL;
