import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @RequirePermission('users', 'read')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Roles('SUPER_ADMIN')
  @RequirePermission('users', 'write')
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user.userId);
  }
}
