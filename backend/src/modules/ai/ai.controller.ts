import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuditLogsRepository } from '../audit-logs/audit-logs.repository';
import { Roles } from '../../common/decorators/role.decorator';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { GenerateStoryDto } from './dto/generate-story.dto';
import { textToTipTapJson } from '../../common/utils/text-to-tiptap';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { SupportChatDto } from './dto/support-chat.dto';
import { CampaignsService } from '../campaigns/campaigns.service';

@Controller('ai')
@Roles('SUPER_ADMIN')
export class AiController {
  constructor(
    private aiService: AiService,
    private auditRepo: AuditLogsRepository,
    private campaignsService: CampaignsService,
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

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // generous enough for a real conversation, tight enough to bound AI API cost from abuse
  @Post('support-chat')
  async supportChat(@Body() dto: SupportChatDto) {
    let campaignContext:
      { title: string; shortDescription: string; ngoName: string } | undefined;

    if (dto.campaignSlug) {
      const campaign = await this.campaignsService.findPublicBySlug(
        dto.campaignSlug,
      );
      if (campaign) {
        campaignContext = {
          title: campaign.title,
          shortDescription: campaign.shortDescription,
          ngoName: campaign.ngo.name,
        };
      }
    }

    const reply = await this.aiService.chatSupport(
      dto.history || [],
      dto.message,
      campaignContext,
    );
    return { reply };
  }
}
