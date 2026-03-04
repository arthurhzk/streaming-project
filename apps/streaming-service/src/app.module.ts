import { Module } from '@nestjs/common';
import { HealthModule } from '@streaming-service/health/health.module';
import { StreamModule } from '@streaming-service/modules/stream/stream.module';

@Module({
  imports: [HealthModule, StreamModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
