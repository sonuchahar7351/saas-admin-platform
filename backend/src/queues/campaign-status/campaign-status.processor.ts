import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignStatusService } from '../../modules/campaigns/campaign-status.service';

@Processor('campaign-status')
export class CampaignStatusProcessor extends WorkerHost {
  private logger = new Logger(CampaignStatusProcessor.name);

  constructor(
    private prisma: PrismaService,
    private statusService: CampaignStatusService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'sweep-campaigns') return;

    const activeCampaigns = await this.prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
    });
    let completed = 0;

    for (const campaign of activeCampaigns) {
      const evaluation = this.statusService.evaluate({
        status: campaign.status,
        goalAmount: campaign.goalAmount,
        raisedAmount: campaign.raisedAmount,
        expiryDate: campaign.expiryDate,
      });
      if (evaluation.shouldAutoComplete) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'COMPLETED' },
        });
        completed++;
      }
    }

    this.logger.log(
      `Campaign status sweep: checked ${activeCampaigns.length}, auto-completed ${completed}`,
    );
  }
}
