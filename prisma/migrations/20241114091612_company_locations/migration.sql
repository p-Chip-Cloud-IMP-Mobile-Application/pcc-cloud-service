-- CreateTable
CREATE TABLE "ComapnyLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "ComapnyLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComapnyLocation" ADD CONSTRAINT "ComapnyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComapnyLocation" ADD CONSTRAINT "ComapnyLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
