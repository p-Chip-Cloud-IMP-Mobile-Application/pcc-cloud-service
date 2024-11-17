/*
  Warnings:

  - The values [created,searched,updated,deleted] on the enum `TagAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TagAction_new" AS ENUM ('create', 'search', 'publish');
ALTER TABLE "tag_histories" ALTER COLUMN "action" TYPE "TagAction_new" USING ("action"::text::"TagAction_new");
ALTER TYPE "TagAction" RENAME TO "TagAction_old";
ALTER TYPE "TagAction_new" RENAME TO "TagAction";
DROP TYPE "TagAction_old";
COMMIT;
