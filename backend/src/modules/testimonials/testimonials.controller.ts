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
import { TestimonialsService } from './testimonials.service';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private service: TestimonialsService) {}

  @Public()
  @Get('public')
  findPublic(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('testimonials', 'read')
  @Get()
  findByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('testimonials', 'write')
  @Post()
  create(@Body() dto: CreateTestimonialDto) {
    return this.service.create(dto);
  }

  @RequirePermission('testimonials', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('testimonials', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @RequirePermission('testimonials', 'write')
  @Post('generate-ai')
  generate(@Body() body: { campaignTitle: string; personaContext: string }) {
    return this.service.generateWithAi(body.campaignTitle, body.personaContext);
  }
}
