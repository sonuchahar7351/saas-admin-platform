import { Module } from '@nestjs/common';
import { UpdatesController } from './updates.controller';
import { UpdatesService } from './updates.service';
import { UpdatesRepository } from './updates.repository';
import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AiModule, MediaModule],
  controllers: [UpdatesController],
  providers: [UpdatesService, UpdatesRepository],
})
export class UpdatesModule {}
