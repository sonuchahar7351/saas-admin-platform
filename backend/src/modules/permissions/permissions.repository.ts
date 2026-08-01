import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany();
  }

  assignToUser(userId: string, permissionId: string, grantedById: string) {
    return this.prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: {},
      create: { userId, permissionId, grantedById },
    });
  }

  revokeFromUser(userId: string, permissionId: string) {
    const result = this.prisma.userPermission.deleteMany({
      where: { userId, permissionId },
    });
    return result;
  }

  findUserPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  }
}
