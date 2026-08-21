-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "isMorph" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentCampaignId" TEXT;

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "sourceCampaignId" TEXT;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_parentCampaignId_fkey" FOREIGN KEY ("parentCampaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_sourceCampaignId_fkey" FOREIGN KEY ("sourceCampaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
