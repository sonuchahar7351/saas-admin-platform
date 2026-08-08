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
import { ProductsService } from './products.service';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Public()
  @Get('public')
  findPublicByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId, true);
  }

  @RequirePermission('products', 'read')
  @Get()
  findByCampaign(@Query('campaignId') campaignId: string) {
    return this.service.findByCampaign(campaignId);
  }

  @RequirePermission('products', 'write')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @RequirePermission('products', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('products', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @RequirePermission('products', 'write')
  @Post('generate-ai')
  generate(@Body() body: { campaignTitle: string; categoryName: string }) {
    return this.service.generateWithAi(body.campaignTitle, body.categoryName);
  }
}
