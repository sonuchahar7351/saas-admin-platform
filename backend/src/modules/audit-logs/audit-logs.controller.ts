import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import { Roles } from '../../common/decorators/role.decorator';

@Controller('audit-logs')
@Roles('SUPER_ADMIN')
export class AuditLogsController {
  constructor(private repo: AuditLogsRepository) {}

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [data, total] = await Promise.all([
      this.repo.findAll({ userId, resource, page: pageNum, limit: limitNum }),
      this.repo.count({ userId, resource }),
    ]);
    return { data, total, page: pageNum, limit: limitNum };
  }
}
