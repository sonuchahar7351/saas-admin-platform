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
import { FeatureCampaignDto } from './dto/feature-campaign.dto';
import { QueryPublicCampaignsDto } from './dto/query-public-campaigns.dto';
import { QueryAdminCampaignsDto } from './dto/query-admin-campaigns.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private service: CampaignsService,
    @InjectQueue('campaign-status') private campaignStatusQueue: Queue,
  ) {}

  // public storefront browsing — active/completed only, no auth
  @Public()
  @Get('public')
  findPublic(@Query() query: QueryPublicCampaignsDto) {
    return this.service.findPublicPaginated(query);
  }

  @Public()
  @Get('public/featured')
  findFeatured() {
    return this.service.findFeatured();
  }

  @RequirePermission('campaigns', 'write')
  @Post('sweep-status-now')
  async sweepNow() {
    await this.campaignStatusQueue.add('sweep-campaigns', {});
    return { message: 'Sweep queued' };
  }

  @Public()
  @Get('public/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }

  @RequirePermission('campaigns', 'read')
  @Get()
  findAll(@Query() query: QueryAdminCampaignsDto) {
    return this.service.findAllAdmin(query);
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

  @RequirePermission('campaigns', 'write')
  @Patch(':id/feature')
  setFeatured(@Param('id') id: string, @Body() dto: FeatureCampaignDto) {
    return this.service.setFeatured(id, dto);
  }
}
