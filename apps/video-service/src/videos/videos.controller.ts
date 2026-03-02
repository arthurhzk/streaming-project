import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from '@video-service/videos/videos.service';
import { UploadVideoDto } from '@video-service/videos/dto/upload-video.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadVideoDto) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.videosService.upload(file, dto.ownerId, dto.slug, dto.category);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.videosService.getById(id);
  }
}
