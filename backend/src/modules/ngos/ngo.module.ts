import { Module } from '@nestjs/common';
import { NgosController } from './ngo.controller';
import { NgosService } from './ngo.service';
import { NgosRepository } from './ngos.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [NgosController],
  providers: [NgosService, NgosRepository],
})
export class NgoModule {}
