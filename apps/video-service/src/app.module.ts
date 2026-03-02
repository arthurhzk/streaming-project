import { Module } from '@nestjs/common';
import { VideosModule } from '@video-service/videos/videos.module';

@Module({
  imports: [VideosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
