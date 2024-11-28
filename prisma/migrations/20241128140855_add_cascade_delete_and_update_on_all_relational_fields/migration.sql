-- DropForeignKey
ALTER TABLE "CompanyLocation" DROP CONSTRAINT "CompanyLocation_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyLocation" DROP CONSTRAINT "CompanyLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTemplate" DROP CONSTRAINT "DocumentTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTemplate" DROP CONSTRAINT "DocumentTemplate_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_tagTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TagDocuments" DROP CONSTRAINT "TagDocuments_documentTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "TagDocuments" DROP CONSTRAINT "TagDocuments_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplate" DROP CONSTRAINT "TagTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplate" DROP CONSTRAINT "TagTemplate_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplate" DROP CONSTRAINT "TagTemplate_imageId_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplateVariant" DROP CONSTRAINT "TagTemplateVariant_tagHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplateVariant" DROP CONSTRAINT "TagTemplateVariant_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagTemplateVariant" DROP CONSTRAINT "TagTemplateVariant_templateVariantId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateVariant" DROP CONSTRAINT "TemplateVariant_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TemplateVariant" DROP CONSTRAINT "TemplateVariant_tagTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_profileId_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_createdById_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_companyId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pictureId_fkey";

-- DropForeignKey
ALTER TABLE "readers" DROP CONSTRAINT "readers_createdById_fkey";

-- DropForeignKey
ALTER TABLE "tag_histories" DROP CONSTRAINT "tag_histories_createdById_fkey";

-- DropForeignKey
ALTER TABLE "tag_histories" DROP CONSTRAINT "tag_histories_createdLocationId_fkey";

-- DropForeignKey
ALTER TABLE "tag_histories" DROP CONSTRAINT "tag_histories_createdReaderId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_companyId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_companyLocationId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_createdById_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_createdLocationId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_createdReaderId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_tagTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_templateVariantId_fkey";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readers" ADD CONSTRAINT "readers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tagTemplateId_fkey" FOREIGN KEY ("tagTemplateId") REFERENCES "TagTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_templateVariantId_fkey" FOREIGN KEY ("templateVariantId") REFERENCES "TemplateVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_createdLocationId_fkey" FOREIGN KEY ("createdLocationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_createdReaderId_fkey" FOREIGN KEY ("createdReaderId") REFERENCES "readers"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyLocationId_fkey" FOREIGN KEY ("companyLocationId") REFERENCES "CompanyLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_histories" ADD CONSTRAINT "tag_histories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_histories" ADD CONSTRAINT "tag_histories_createdLocationId_fkey" FOREIGN KEY ("createdLocationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_histories" ADD CONSTRAINT "tag_histories_createdReaderId_fkey" FOREIGN KEY ("createdReaderId") REFERENCES "readers"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_tagTemplateId_fkey" FOREIGN KEY ("tagTemplateId") REFERENCES "TagTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplate" ADD CONSTRAINT "TagTemplate_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplate" ADD CONSTRAINT "TagTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplate" ADD CONSTRAINT "TagTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVariant" ADD CONSTRAINT "TemplateVariant_tagTemplateId_fkey" FOREIGN KEY ("tagTemplateId") REFERENCES "TagTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVariant" ADD CONSTRAINT "TemplateVariant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_templateVariantId_fkey" FOREIGN KEY ("templateVariantId") REFERENCES "TemplateVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTemplateVariant" ADD CONSTRAINT "TagTemplateVariant_tagHistoryId_fkey" FOREIGN KEY ("tagHistoryId") REFERENCES "tag_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagDocuments" ADD CONSTRAINT "TagDocuments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagDocuments" ADD CONSTRAINT "TagDocuments_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
