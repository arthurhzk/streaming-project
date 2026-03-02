import { Module } from '@nestjs/common';
import { VideosController } from '@video-service/videos/videos.controller';
import { VideosService } from '@video-service/videos/videos.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
