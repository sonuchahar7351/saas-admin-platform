import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/role.decorator';

@Controller('roles')
@Roles('SUPER_ADMIN')
export class RolesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.role.findMany({ select: { id: true, name: true } });
  }
}
