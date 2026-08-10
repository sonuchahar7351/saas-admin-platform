import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

const ACTION_MAP: Record<string, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, user, params, body } = request;

    const action = ACTION_MAP[method];
    // Audit logging is for admin-panel actions only — req.user.userId only exists
    // when the request came through the admin JwtAuthGuard, not customer/guest routes.
    if (!action || !user || !user.userId) {
      return next.handle();
    }

    // derive a resource name from the controller class, e.g. "UsersController" -> "users"
    const controllerName = context
      .getClass()
      .name.replace('Controller', '')
      .toLowerCase();

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const resourceId =
            responseBody?.id ?? params?.id ?? params?.userId ?? undefined;
          this.prisma.auditLog
            .create({
              data: {
                userId: user.userId,
                action,
                resource: controllerName,
                resourceId,
                metadata: { params, body: this.sanitize(body) },
              },
            })
            .catch((err) => {
              // never let logging failure break the actual request
              console.error('Audit log write failed:', err);
            });
        },
        // note: we deliberately don't log on error here — only successful mutations
      }),
    );
  }

  private sanitize(body: any) {
    if (!body) return body;
    const clone = { ...body };
    delete clone.password; // never persist raw/hashed passwords in audit metadata
    return clone;
  }
}
