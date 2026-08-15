-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('CREATED', 'ACTIVE', 'PAUSED', 'HALTED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "recurringDonationId" TEXT;

-- CreateTable
CREATE TABLE "recurring_plan_cache" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "razorpayPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_plan_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_donations" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "tipPercentage" INTEGER NOT NULL DEFAULT 0,
    "status" "RecurringStatus" NOT NULL DEFAULT 'CREATED',
    "razorpayPlanId" TEXT NOT NULL,
    "razorpaySubscriptionId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurring_plan_cache_razorpayPlanId_key" ON "recurring_plan_cache"("razorpayPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_plan_cache_campaignId_amount_frequency_key" ON "recurring_plan_cache"("campaignId", "amount", "frequency");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_donations_razorpaySubscriptionId_key" ON "recurring_donations"("razorpaySubscriptionId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_recurringDonationId_fkey" FOREIGN KEY ("recurringDonationId") REFERENCES "recurring_donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "billing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
