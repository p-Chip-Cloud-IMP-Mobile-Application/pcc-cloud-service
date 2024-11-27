-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "_ParentChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ParentChild_AB_unique" ON "_ParentChild"("A", "B");

-- CreateIndex
CREATE INDEX "_ParentChild_B_index" ON "_ParentChild"("B");

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_A_fkey" FOREIGN KEY ("A") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
