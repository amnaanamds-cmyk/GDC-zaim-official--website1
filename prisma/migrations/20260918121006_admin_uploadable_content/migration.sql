-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "bytes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mime" TEXT,
ADD COLUMN     "uploadedById" TEXT;

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "fileName" TEXT;

-- CreateTable
CREATE TABLE "Leader" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'user',
    "photoPath" TEXT,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteImage" (
    "slot" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("slot")
);

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteImage" ADD CONSTRAINT "SiteImage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
