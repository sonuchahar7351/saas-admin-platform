import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EightyGService } from './eighty-g.service';
import { ApplyEightyGDto, RejectEightyGDto } from './dto/eighty-g.dto';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MulterFile } from '../../common/types/multer-file.type';

@Controller('eighty-g')
export class EightyGController {
  constructor(private service: EightyGService) {}

  @Public()
  @Post('apply')
  apply(@Body() dto: ApplyEightyGDto) {
    return this.service.apply(dto);
  }

  @Public()
  @Get('status/:donationId')
  getStatus(@Param('donationId') donationId: string) {
    return this.service.getStatus(donationId);
  }

  @RequirePermission('eightyG', 'read')
  @Get()
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
    });
  }

  @RequirePermission('eightyG', 'write')
  @Post(':id/approve')
  @UseInterceptors(FileInterceptor('certificate'))
  approve(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: any,
  ) {
    return this.service.approve(id, file, user.userId);
  }

  @RequirePermission('eightyG', 'write')
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectEightyGDto,
    @CurrentUser() user: any,
  ) {
    return this.service.reject(id, dto.reason, user.userId);
  }
}
