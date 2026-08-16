import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../../modules/email/email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private logger = new Logger(EmailProcessor.name);

  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'password-reset':
        await this.emailService.sendPasswordResetEmail(
          job.data.email,
          job.data.resetLink,
        );
        break;
      case 'certificate-approved':
        await this.emailService.sendCertificateEmail(
          job.data.email,
          job.data.donorName,
          job.data.certificateUrl,
        );
        break;
      case 'certificate-rejected':
        await this.emailService.sendApplicationRejectedEmail(
          job.data.email,
          job.data.donorName,
          job.data.reason,
        );
        break;
      default:
        this.logger.warn(`Unknown email job type: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} (${job.name}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    // after all retries exhausted — this is where you'd hook an alert (Sentry, etc.) in a real production setup
    this.logger.error(
      `Email job ${job.id} (${job.name}) failed permanently: ${err.message}`,
    );
  }
}
