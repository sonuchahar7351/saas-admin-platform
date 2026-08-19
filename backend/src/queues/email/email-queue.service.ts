import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// thin API — callers enqueue a job and return immediately; the processor does the actual sending
@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  private defaultJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 }, // 5s, 10s, 20s
    removeOnComplete: 100, // keep last 100 for inspection, don't let the queue grow unbounded
    removeOnFail: 500,
  };

  queuePasswordReset(email: string, resetLink: string) {
    return this.emailQueue.add(
      'password-reset',
      { email, resetLink },
      this.defaultJobOptions,
    );
  }

  queueCertificateApproved(
    email: string,
    donorName: string,
    certificateUrl: string,
  ) {
    return this.emailQueue.add(
      'certificate-approved',
      { email, donorName, certificateUrl },
      this.defaultJobOptions,
    );
  }

  queueCertificateRejected(email: string, donorName: string, reason: string) {
    return this.emailQueue.add(
      'certificate-rejected',
      { email, donorName, reason },
      this.defaultJobOptions,
    );
  }

  queueWeeklyReport(
    email: string,
    adminName: string,
    summary: any,
    topCampaigns: any[],
  ) {
    return this.emailQueue.add(
      'weekly-report',
      { email, adminName, summary, topCampaigns },
      this.defaultJobOptions,
    );
  }
}
