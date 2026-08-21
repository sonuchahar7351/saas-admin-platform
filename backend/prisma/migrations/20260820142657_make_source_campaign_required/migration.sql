/*
  Warnings:

  - Made the column `sourceCampaignId` on table `donations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_sourceCampaignId_fkey";

-- AlterTable
ALTER TABLE "donations" ALTER COLUMN "sourceCampaignId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_sourceCampaignId_fkey" FOREIGN KEY ("sourceCampaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
