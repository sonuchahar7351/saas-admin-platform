import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuditLogsRepository } from '../audit-logs/audit-logs.repository';
import { Roles } from '../../common/decorators/role.decorator';

@Controller('ai')
@Roles('SUPER_ADMIN')
export class AiController {
  constructor(
    private aiService: AiService,
    private auditRepo: AuditLogsRepository,
  ) {}

  @Get('audit-summary')
  async getAuditSummary() {
    const recentLogs = await this.auditRepo.findAll({ page: 1, limit: 50 });
    const summary = await this.aiService.generateAuditSummary(recentLogs);
    return { summary };
  }
}
