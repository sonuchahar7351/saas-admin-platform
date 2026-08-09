import { Module } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';
import { TestimonialsRepository } from './testimonials.reopsitory';

@Module({
  imports: [AiModule, MediaModule],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository],
})
export class TestimonialsModule {}
