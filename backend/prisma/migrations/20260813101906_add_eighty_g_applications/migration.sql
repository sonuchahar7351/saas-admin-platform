-- CreateEnum
CREATE TYPE "EightyGStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "eighty_g_applications" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "EightyGStatus" NOT NULL DEFAULT 'PENDING',
    "certificateUrl" TEXT,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eighty_g_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eighty_g_applications_donationId_key" ON "eighty_g_applications"("donationId");

-- AddForeignKey
ALTER TABLE "eighty_g_applications" ADD CONSTRAINT "eighty_g_applications_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eighty_g_applications" ADD CONSTRAINT "eighty_g_applications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eighty_g_applications" ADD CONSTRAINT "eighty_g_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
