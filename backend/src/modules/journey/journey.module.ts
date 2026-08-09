import { Module } from '@nestjs/common';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { JourneyRepository } from './journey.repository';
import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AiModule, MediaModule],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyRepository],
})
export class JourneyModule {}
