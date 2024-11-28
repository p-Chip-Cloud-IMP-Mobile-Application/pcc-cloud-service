-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_tagTemplateId_fkey";

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "templateVariantId" TEXT,
ALTER COLUMN "tagTemplateId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TagTemplateVariant" (
    "id" TEXT NOT NULL,
    "templateVariantId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "tagHistoryId" TEXT NOT NULL,

    CONSTRAINT "TagTemplateVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tagTemplateId_fkey" FOREIGN KEY ("tagTemplateId") REFERENCES "TagTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_templateVariantId_fkey" FOREIGN KEY ("templateVariantId") REFERENCES "TemplateVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_templateVariantId_fkey" FOREIGN KEY ("templateVariantId") REFERENCES "TemplateVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_tagHistoryId_fkey" FOREIGN KEY ("tagHistoryId") REFERENCES "tag_histories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
