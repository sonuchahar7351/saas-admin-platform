import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReceiptsQueueService {
  constructor(@InjectQueue('receipts') private receiptsQueue: Queue) {}

  queueGenerate(donationId: string) {
    return this.receiptsQueue.add(
      'generate',
      { donationId },
      {
        attempts: 5, // more retries than email — a missing receipt blocks a customer download
        backoff: { type: 'exponential', delay: 10000 }, // 10s, 20s, 40s, 80s, 160s
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
  }
}
