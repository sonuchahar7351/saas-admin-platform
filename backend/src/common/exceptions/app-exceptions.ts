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
