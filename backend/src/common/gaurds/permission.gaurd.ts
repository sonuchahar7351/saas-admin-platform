import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsCacheService } from '../permissions-cache/permissions-cache.service';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cache: PermissionsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true;
    if (user.role === 'SUPER_ADMIN') return true;

    const key = `${required.resource}:${required.action}`;

    // both cache reads happen in parallel — no reason to serialize two independent lookups
    const [rolePerms, userPerms] = await Promise.all([
      this.cache.getRolePermissions(user.role),
      this.cache.getUserPermissions(user.userId),
    ]);

    if (!rolePerms.has(key) && !userPerms.has(key)) {
      throw new ForbiddenException(
        `Missing permission: ${required.action} on ${required.resource}`,
      );
    }
    return true;
  }
}
