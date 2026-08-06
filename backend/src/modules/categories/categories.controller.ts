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
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';

@Controller('category')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  // used by the public campaign-browsing frontend — no auth needed, active-only
  @Public()
  @Get('public')
  findPublic() {
    return this.service.findAll(true);
  }

  @RequirePermission('categories', 'read')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermission('categories', 'write')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @RequirePermission('categories', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('categories', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
