import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsCacheService } from '../../common/permissions-cache/permissions-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private repo: PermissionsRepository,
    private cache: PermissionsCacheService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async assign(userId: string, permissionId: string, grantedById: string) {
    const result = await this.repo.assignToUser(
      userId,
      permissionId,
      grantedById,
    );
    await this.cache.invalidateUser(userId); // grant takes effect on this user's very next request, not after a TTL wait
    return result;
  }

  async revoke(userId: string, permissionId: string) {
    const result = await this.repo.revokeFromUser(userId, permissionId);
    await this.cache.invalidateUser(userId); // revoke is equally immediate — critical for a security control, not just a perf nicety
    return result;
  }

  getUserPermissions(userId: string) {
    return this.repo.findUserPermissions(userId);
  }
}
