import { Module } from '@nestjs/common';
import { HealthModule } from '@video-service/health/health.module';
import { VideosModule } from '@video-service/videos/videos.module';

@Module({
  imports: [HealthModule, VideosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
