-- DropForeignKey
ALTER TABLE "tag_histories" DROP CONSTRAINT "tag_histories_tagId_fkey";

-- AddForeignKey
ALTER TABLE "tag_histories" ADD CONSTRAINT "tag_histories_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
