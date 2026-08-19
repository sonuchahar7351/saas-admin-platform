import { Injectable } from '@nestjs/common';
import {
  CampaignGoalReachedException,
  CampaignExpiredException,
  CampaignGoalAndExpiryException,
} from '../../common/exceptions/app-exceptions';

export interface CampaignStatusInput {
  status: string;
  goalAmount: number;
  raisedAmount: number;
  expiryDate: Date;
}

export interface CampaignStatusEvaluation {
  isGoalReached: boolean;
  isExpired: boolean;
  shouldAutoComplete: boolean;
  completionReason: 'GOAL_REACHED' | 'EXPIRED' | 'BOTH' | null;
  goalWarning: boolean;
  expiryWarning: boolean;
  progressPercent: number;
  daysRemaining: number;
  canAcceptDonations: boolean;
}

// Every place in the app that needs to know "is this campaign done / near done / donatable"
// calls this ONE function. Webhooks, the cron sweep, donation creation, admin reactivation,
// and (later) Morph campaigns all evaluate through here — nowhere else re-implements this math.
@Injectable()
export class CampaignStatusService {
  private goalWarningThreshold = Number(
    process.env.CAMPAIGN_GOAL_WARNING_THRESHOLD || 90,
  );
  private expiryWarningDays = Number(
    process.env.CAMPAIGN_EXPIRY_WARNING_DAYS || 3,
  );

  evaluate(campaign: CampaignStatusInput): CampaignStatusEvaluation {
    const now = new Date();
    const isGoalReached = campaign.raisedAmount >= campaign.goalAmount;
    const isExpired = now >= campaign.expiryDate;

    const progressPercent =
      campaign.goalAmount > 0
        ? Math.min(
            100,
            Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
          )
        : 0;

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (campaign.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    let completionReason: CampaignStatusEvaluation['completionReason'] = null;
    if (isGoalReached && isExpired) completionReason = 'BOTH';
    else if (isGoalReached) completionReason = 'GOAL_REACHED';
    else if (isExpired) completionReason = 'EXPIRED';

    // only auto-complete campaigns that are actually live — never resurrect a DELETED
    // campaign into COMPLETED just because its stale numbers happen to satisfy the math
    const shouldAutoComplete =
      campaign.status === 'ACTIVE' && (isGoalReached || isExpired);

    return {
      isGoalReached,
      isExpired,
      shouldAutoComplete,
      completionReason,
      goalWarning:
        !isGoalReached && progressPercent >= this.goalWarningThreshold,
      expiryWarning: !isExpired && daysRemaining <= this.expiryWarningDays,
      progressPercent,
      daysRemaining,
      canAcceptDonations:
        campaign.status === 'ACTIVE' && !isGoalReached && !isExpired,
    };
  }

  // used specifically by the reactivation flow — throws the exact spec'd exception
  // for whichever condition(s) are still blocking, so the message is always precise
  assertCanReactivate(campaign: CampaignStatusInput) {
    const evaluation = this.evaluate({ ...campaign, status: 'COMPLETED' }); // evaluate as if still completed — we're checking whether the underlying numbers still block reactivation
    if (evaluation.isGoalReached && evaluation.isExpired)
      throw new CampaignGoalAndExpiryException();
    if (evaluation.isGoalReached) throw new CampaignGoalReachedException();
    if (evaluation.isExpired) throw new CampaignExpiredException();
  }
}
