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

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const required = this.reflector.getAllAndOverride<RequiredPermission>(
  //     PERMISSION_KEY,
  //     [context.getHandler(), context.getClass()],
  //   );
  //   if (!required) return true; // no permission required on this route

  //   const { user } = context.switchToHttp().getRequest();

  //   // Super Admin bypasses granular permission checks entirely
  //   if (user.role === 'SUPER_ADMIN') return true;

  //   const hasPermission = await this.prisma.rolePermission.findFirst({
  //     where: {
  //       role: { name: user.role },
  //       permission: { resource: required.resource, action: required.action },
  //     },
  //   });

  //   if (!hasPermission) {
  //     throw new ForbiddenException(
  //       `Missing permission: ${required.action} on ${required.resource}`,
  //     );
  //   }
  //   return true;
  // }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (user.role === 'SUPER_ADMIN') return true;

    // Check role-based permission OR direct user-level grant
    const [rolePermission, userPermission] = await Promise.all([
      this.prisma.rolePermission.findFirst({
        where: {
          role: { name: user.role },
          permission: { resource: required.resource, action: required.action },
        },
      }),
      this.prisma.userPermission.findFirst({
        where: {
          userId: user.userId,
          permission: { resource: required.resource, action: required.action },
        },
      }),
    ]);

    if (!rolePermission && !userPermission) {
      throw new ForbiddenException(
        `Missing permission: ${required.action} on ${required.resource}`,
      );
    }
    return true;
  }
}
