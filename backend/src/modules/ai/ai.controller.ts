import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuditLogsRepository } from '../audit-logs/audit-logs.repository';
import { Roles } from '../../common/decorators/role.decorator';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { GenerateStoryDto } from './dto/generate-story.dto';
import { textToTipTapJson } from '../../common/utils/text-to-tiptap';

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

  @RequirePermission('campaigns', 'write')
  @Post('generate-campaign-story')
  async generateCampaignStory(@Body() dto: GenerateStoryDto) {
    const text = await this.aiService.generateCampaignStory(dto);
    return { story: textToTipTapJson(text) };
  }
}
