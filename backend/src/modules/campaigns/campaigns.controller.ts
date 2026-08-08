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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('campaigns')
export class CampaignsController {
  constructor(private service: CampaignsService) {}

  // public storefront browsing — active/completed only, no auth
  @Public()
  @Get('public')
  findPublic(@Query('categoryId') categoryId?: string) {
    return this.service.findAll({ status: 'ACTIVE', categoryId });
  }

  @Public()
  @Get('public/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }

  @RequirePermission('campaigns', 'read')
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAll({ status, categoryId });
  }

  @RequirePermission('campaigns', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @RequirePermission('campaigns', 'write')
  @Post()
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.userId);
  }

  @RequirePermission('campaigns', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('campaigns', 'write')
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.service.changeStatus(id, dto.status);
  }

  @RequirePermission('campaigns', 'write')
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.duplicate(id, user.userId);
  }

  @RequirePermission('campaigns', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
