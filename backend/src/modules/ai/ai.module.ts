import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [AuditLogsModule, CampaignsModule],
  exports: [AiService],
  controllers: [AiController],
  providers: [AiService, OpenAIProvider, GeminiProvider],
})
export class AiModule {}
