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
import { UpdatesService } from './updates.service';
import {
  CreateUpdateDto,
  UpdateUpdateDto,
  CreateGlimpseDto,
  AddGlimpseImagesDto,
} from './dto/updates.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('updates')
export class UpdatesController {
  constructor(private service: UpdatesService) {}

  @Public()
  @Get('public')
  findPublicByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('updates', 'read')
  @Get()
  findByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('updates', 'write')
  @Post()
  create(@Body() dto: CreateUpdateDto) {
    return this.service.create(dto);
  }

  @RequirePermission('updates', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUpdateDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('updates', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @RequirePermission('updates', 'write')
  @Post('generate-ai')
  generate(@Body() body: { campaignTitle: string; context: string }) {
    return this.service.generateWithAi(body.campaignTitle, body.context);
  }

  // ---- Glimpses ----

  @RequirePermission('updates', 'write')
  @Post('glimpses')
  createGlimpse(@Body() dto: CreateGlimpseDto) {
    return this.service.createGlimpse(dto);
  }

  @RequirePermission('updates', 'delete')
  @Delete('glimpses/:id')
  deleteGlimpse(@Param('id') id: string) {
    return this.service.deleteGlimpse(id);
  }

  @RequirePermission('updates', 'write')
  @Post('glimpses/:id/images')
  addGlimpseImages(@Param('id') id: string, @Body() dto: AddGlimpseImagesDto) {
    return this.service.addGlimpseImages(id, dto.mediaIds);
  }

  @RequirePermission('updates', 'delete')
  @Delete('glimpse-images/:id')
  removeGlimpseImage(@Param('id') id: string) {
    return this.service.removeGlimpseImage(id);
  }
}
