-- AlterTable: add isPackage column to Service
ALTER TABLE "Service" ADD COLUMN "isPackage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: PackageItem
CREATE TABLE "PackageItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique constraint
CREATE UNIQUE INDEX "PackageItem_packageId_serviceId_key" ON "PackageItem"("packageId", "serviceId");

-- AddForeignKey: PackageItem -> Service (package side)
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PackageItem -> Service (service side)
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
