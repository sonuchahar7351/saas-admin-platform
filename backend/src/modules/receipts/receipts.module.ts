import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptsRepository } from './receipts.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptsRepository],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
