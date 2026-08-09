import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { JourneyService } from './journey.service';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { CreateJourneyDto } from './dto/create-journey.dto';

@Controller('journey')
export class JourneyController {
  constructor(private service: JourneyService) {}

  @Public()
  @Get('public')
  findPublic(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('journey', 'read')
  @Get()
  findByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('journey', 'write')
  @Post()
  create(@Body() dto: CreateJourneyDto) {
    return this.service.create(dto);
  }

  @RequirePermission('journey', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJourneyDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('journey', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @RequirePermission('journey', 'write')
  @Post('generate-ai')
  generate(@Body() body: { campaignTitle: string; stageContext: string }) {
    return this.service.generateWithAi(body.campaignTitle, body.stageContext);
  }
}
