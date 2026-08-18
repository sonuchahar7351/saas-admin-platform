import { Injectable, Logger } from '@nestjs/common';
import { DonationsRepository } from './donations.repository';

const VELOCITY_WINDOW_MIN = 15;
const VELOCITY_THRESHOLD = 4; // 4+ donation attempts from one email in 15 min
const CARD_TESTING_WINDOW_MIN = 10;
const CARD_TESTING_THRESHOLD = 3; // 3+ FAILED attempts in 10 min
const IP_FANOUT_WINDOW_MIN = 30;
const IP_FANOUT_THRESHOLD = 3; // 3+ distinct donor identities from one IP in 30 min
const AMOUNT_ANOMALY_MULTIPLIER = 8; // 8x a campaign's average PAID donation

@Injectable()
export class FraudDetectionService {
  private logger = new Logger(FraudDetectionService.name);

  constructor(private repo: DonationsRepository) {}

  // runs right after order creation — read-only checks, never blocks the actual donation flow
  async evaluate(
    donationId: string,
    campaignId: string,
    donorEmail: string,
    amountPaise: number,
    ipAddress?: string,
  ) {
    try {
      await Promise.all([
        this.checkVelocity(donationId, donorEmail),
        this.checkCardTesting(donationId, donorEmail, ipAddress),
        this.checkIpFanout(donationId, ipAddress),
        this.checkAmountAnomaly(donationId, campaignId, amountPaise),
      ]);
    } catch (err) {
      // fraud checks are advisory — a bug here must never break donation creation itself
      this.logger.error(
        `Fraud evaluation failed for donation ${donationId}`,
        err,
      );
    }
  }

  private async checkVelocity(donationId: string, email: string) {
    const count = await this.repo.countRecentByEmail(
      email,
      VELOCITY_WINDOW_MIN,
    );
    if (count >= VELOCITY_THRESHOLD) {
      await this.repo.createFraudFlag({
        donationId,
        ruleCode: 'VELOCITY',
        severity: count >= VELOCITY_THRESHOLD * 2 ? 'HIGH' : 'MEDIUM',
        details: {
          count,
          windowMinutes: VELOCITY_WINDOW_MIN,
          threshold: VELOCITY_THRESHOLD,
        },
      });
    }
  }

  private async checkCardTesting(
    donationId: string,
    email: string,
    ipAddress?: string,
  ) {
    const count = await this.repo.countRecentFailedByEmailOrIp(
      email,
      ipAddress,
      CARD_TESTING_WINDOW_MIN,
    );
    if (count >= CARD_TESTING_THRESHOLD) {
      await this.repo.createFraudFlag({
        donationId,
        ruleCode: 'CARD_TESTING',
        severity: 'HIGH', // this pattern is the strongest signal of the four
        details: {
          failedCount: count,
          windowMinutes: CARD_TESTING_WINDOW_MIN,
          threshold: CARD_TESTING_THRESHOLD,
        },
      });
    }
  }

  private async checkIpFanout(donationId: string, ipAddress?: string) {
    if (!ipAddress) return;
    const distinct = await this.repo.countDistinctDonorsFromIp(
      ipAddress,
      IP_FANOUT_WINDOW_MIN,
    );
    if (distinct.length >= IP_FANOUT_THRESHOLD) {
      await this.repo.createFraudFlag({
        donationId,
        ruleCode: 'IP_FANOUT',
        severity: 'MEDIUM', // could genuinely be a family/office — never HIGH on its own
        details: {
          distinctDonors: distinct.length,
          windowMinutes: IP_FANOUT_WINDOW_MIN,
          threshold: IP_FANOUT_THRESHOLD,
        },
      });
    }
  }

  private async checkAmountAnomaly(
    donationId: string,
    campaignId: string,
    amountPaise: number,
  ) {
    const stats = await this.repo.getCampaignAverageDonation(campaignId);
    if (!stats._avg.amount || stats._count < 5) return; // not enough history to judge "normal" yet — avoid false positives on new campaigns
    if (amountPaise >= stats._avg.amount * AMOUNT_ANOMALY_MULTIPLIER) {
      await this.repo.createFraudFlag({
        donationId,
        ruleCode: 'AMOUNT_ANOMALY',
        severity: 'LOW', // often just a generous legitimate donor — informational, not alarming
        details: {
          amount: amountPaise,
          campaignAverage: Math.round(stats._avg.amount),
          multiplier: AMOUNT_ANOMALY_MULTIPLIER,
        },
      });
    }
  }
}
