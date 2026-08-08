import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import type { MulterFile } from '../../common/types/multer-file.type';
import { BulkDeleteDto } from './dto/bulk-delete.dto';

@Controller('media')
export class MediaController {
  constructor(private service: MediaService) {}

  @RequirePermission('media', 'write')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: MulterFile,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: any,
  ) {
    return this.service.upload(file, dto, user.userId);
  }

  @RequirePermission('media', 'read')
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(category, search);
  }

  @RequirePermission('media', 'delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @RequirePermission('media', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @RequirePermission('media', 'write')
  @Post('bulk-upload')
  @UseInterceptors(FilesInterceptor('files', 20))
  bulkUpload(
    @UploadedFiles() files: MulterFile[],
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: any,
  ) {
    return this.service.bulkUpload(files, dto, user.userId);
  }

  @RequirePermission('media', 'delete')
  @Post('bulk-delete')
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.service.bulkDelete(dto.ids);
  }
}
