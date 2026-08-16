import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../modules/radis/radic.module';

const ROLE_TTL_SECONDS = 600; // 10 min — role permissions almost never change at runtime, long TTL is fine
const USER_TTL_SECONDS = 300; // 5 min — safety net; explicit invalidation on assign/revoke is the real mechanism

@Injectable()
export class PermissionsCacheService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private prisma: PrismaService,
  ) {}

  private roleKey(role: string) {
    return `perm:role:${role}`;
  }
  private userKey(userId: string) {
    return `perm:user:${userId}`;
  }

  async getRolePermissions(role: string): Promise<Set<string>> {
    const cached = await this.redis.get(this.roleKey(role));
    if (cached) return new Set(JSON.parse(cached));

    const rows = await this.prisma.rolePermission.findMany({
      where: { role: { name: role } },
      include: { permission: true },
    });
    const perms = rows.map(
      (r) => `${r.permission.resource}:${r.permission.action}`,
    );
    await this.redis.set(
      this.roleKey(role),
      JSON.stringify(perms),
      'EX',
      ROLE_TTL_SECONDS,
    );
    return new Set(perms);
  }

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const cached = await this.redis.get(this.userKey(userId));
    if (cached) return new Set(JSON.parse(cached));

    const rows = await this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
    const perms = rows.map(
      (r) => `${r.permission.resource}:${r.permission.action}`,
    );
    await this.redis.set(
      this.userKey(userId),
      JSON.stringify(perms),
      'EX',
      USER_TTL_SECONDS,
    );
    return new Set(perms);
  }

  async invalidateUser(userId: string) {
    await this.redis.del(this.userKey(userId));
  }

  async invalidateRole(role: string) {
    await this.redis.del(this.roleKey(role)); // not wired to any current write path, but here for when/if role permissions become admin-editable at runtime
  }
}
