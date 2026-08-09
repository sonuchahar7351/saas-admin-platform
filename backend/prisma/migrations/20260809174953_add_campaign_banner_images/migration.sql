-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "bannerImageIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
