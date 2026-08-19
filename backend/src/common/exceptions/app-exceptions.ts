import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
  ) {
    super(message, status);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string) {
    super('RESOURCE_NOT_FOUND', `${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

export class BusinessRuleViolationException extends AppException {
  constructor(code: string, message: string) {
    super(code, message, HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateResourceException extends AppException {
  constructor(message: string) {
    super('DUPLICATE_RESOURCE', message, HttpStatus.CONFLICT);
  }
}

export class CampaignGoalReachedException extends AppException {
  constructor() {
    super(
      'CAMPAIGN_GOAL_REACHED',
      'This campaign has already reached its goal. Please increase the goal amount before activating the campaign again.',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CampaignExpiredException extends AppException {
  constructor() {
    super(
      'CAMPAIGN_EXPIRED',
      'This campaign has expired. Please update the expiry date before activating the campaign again.',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CampaignGoalAndExpiryException extends AppException {
  constructor() {
    super(
      'CAMPAIGN_GOAL_AND_EXPIRY_REACHED',
      'This campaign has reached its goal and expired. Please increase the goal amount and update the expiry date before activating it again.',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CampaignNotAcceptingDonationsException extends AppException {
  constructor() {
    super(
      'CAMPAIGN_NOT_ACCEPTING_DONATIONS',
      'This campaign is no longer accepting donations.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
