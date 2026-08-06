import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { NgosService } from './ngo.service';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';

@Controller('ngo')
export class NgosController {
  constructor(private service: NgosService) {}

  @Public()
  @Get('public')
  findPublic() {
    return this.service.findAll(true);
  }

  @RequirePermission('ngos', 'read')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermission('ngos', 'write')
  @Post()
  create(@Body() dto: CreateNgoDto) {
    return this.service.create(dto);
  }

  @RequirePermission('ngos', 'write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNgoDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('ngos', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
