import * as Sentry from '@sentry/nestjs';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../exceptions/app-exceptions';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('ExceptionsHandler');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message = isHttpException
      ? typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || 'An error occurred'
      : 'Something went wrong. Please try again.'; // never leak raw error details/stack traces for unexpected 500s

    if (status >= 500) {
      // full detail goes to logs only — never to the client
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      Sentry.captureException(exception);
    }

    const isAppException = exception instanceof AppException;

    response.status(status).json({
      statusCode: status,
      message,
      ...(isAppException && { code: (exception as AppException).code }),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
