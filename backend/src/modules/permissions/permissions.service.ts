import { Injectable } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private repo: PermissionsRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  assign(userId: string, permissionId: string, grantedById: string) {
    return this.repo.assignToUser(userId, permissionId, grantedById);
  }

  revoke(userId: string, permissionId: string) {
    return this.repo.revokeFromUser(userId, permissionId);
  }

  getUserPermissions(userId: string) {
    return this.repo.findUserPermissions(userId);
  }
}
