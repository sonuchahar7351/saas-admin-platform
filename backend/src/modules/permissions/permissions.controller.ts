import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@Roles('SUPER_ADMIN') // only Super Admin manages module assignment
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Post('assign')
  assign(@Body() dto: AssignPermissionDto, @CurrentUser() user: any) {
    return this.permissionsService.assign(
      dto.userId,
      dto.permissionId,
      user.userId,
    );
  }

  @Delete('revoke/:userId/:permissionId')
  revoke(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.revoke(userId, permissionId);
  }

  @Get('user/:userId')
  getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }
}
