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

  async sendCertificateEmail(
    to: string,
    donorName: string,
    certificateUrl: string,
  ) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — 80G certificate for ${to}: ${certificateUrl}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Your 80G Certificate is ready',
      html: `<p>Dear ${donorName},</p><p>Your 80G tax exemption certificate has been approved. You can download it here:</p><p><a href="${certificateUrl}">${certificateUrl}</a></p><p>Thank you for your generous contribution.</p>`,
    });
  }

  async sendApplicationRejectedEmail(
    to: string,
    donorName: string,
    reason: string,
  ) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — 80G rejection for ${to}: ${reason}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Update on your 80G certificate application',
      html: `<p>Dear ${donorName},</p><p>We were unable to approve your 80G certificate application for the following reason:</p><p>${reason}</p><p>Please contact support if you believe this is an error.</p>`,
    });
  }

  async sendWeeklyReport(
    to: string,
    adminName: string,
    summary: any,
    topCampaigns: any[],
  ) {
    const topCampaignsHtml = topCampaigns
      .map(
        (c, i) =>
          `<li>${i + 1}. ${c.title} — ₹${(c.raisedAmount / 100).toLocaleString('en-IN')} raised</li>`,
      )
      .join('');

    const html = `
    <p>Hi ${adminName},</p>
    <p>Here's your weekly summary:</p>
    <ul>
      <li>Total donations: ₹${(summary.totalDonations / 100).toLocaleString('en-IN')}</li>
      <li>This month: ₹${(summary.monthlyDonations / 100).toLocaleString('en-IN')}</li>
      <li>Running campaigns: ${summary.runningCampaigns}</li>
      <li>New/total donors: ${summary.totalCustomers}</li>
    </ul>
    <p>Top campaigns this week:</p>
    <ol>${topCampaignsHtml}</ol>
  `;

    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — weekly report for ${to} not sent`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Your weekly GiveForward summary',
      html,
    });
  }
}
