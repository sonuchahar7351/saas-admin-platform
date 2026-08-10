/*
  Warnings:

  - Added the required column `billingId` to the `donations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('AMOUNT', 'PRODUCT');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "featureImageDesktopId" TEXT,
ADD COLUMN     "featureImageMobileId" TEXT,
ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "isAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "billingId" TEXT NOT NULL,
ADD COLUMN     "donationType" "DonationType" NOT NULL DEFAULT 'AMOUNT';

-- CreateTable
CREATE TABLE "billing" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "streetAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_products" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "donation_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipts_donationId_key" ON "receipts"("donationId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "billing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_products" ADD CONSTRAINT "donation_products_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_products" ADD CONSTRAINT "donation_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
