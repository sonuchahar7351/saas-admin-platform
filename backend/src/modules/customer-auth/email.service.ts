import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — reset link for ${to}: ${resetLink}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
