import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check @Public() FIRST, same as JwtAuthGuard does — a public route should
    // never be subject to a permission check, regardless of what its controller declares
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
    if (!user) return true; // no permission context to check — nothing to enforce here

    if (user.role === 'SUPER_ADMIN') return true;

    const hasPermission = await this.prisma.rolePermission.findFirst({
      where: {
        role: { name: user.role },
        permission: { resource: required.resource, action: required.action },
      },
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing permission: ${required.action} on ${required.resource}`,
      );
    }
    return true;
  }
}
