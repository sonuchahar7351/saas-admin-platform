import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReceiptsService } from '../../modules/receipts/receipts.service';

@Processor('receipts')
export class ReceiptsProcessor extends WorkerHost {
  private logger = new Logger(ReceiptsProcessor.name);

  constructor(private receiptsService: ReceiptsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === 'generate') {
      await this.receiptsService.generateForDonation(job.data.donationId);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Receipt generated for donation ${job.data.donationId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Receipt generation failed permanently for donation ${job.data.donationId}: ${err.message}`,
    );
  }
}
