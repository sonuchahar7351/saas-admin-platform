import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { AiModule } from '../ai/ai.module';
import { MediaRepository } from '../media/media.repository';

@Module({
  imports: [AiModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, MediaRepository],
})
export class ProductsModule {}
