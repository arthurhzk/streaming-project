import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StreamController } from '@streaming-service/modules/stream/stream.controller';
import { StreamService } from '@streaming-service/modules/stream/stream.service';
import { S3Service } from '@streaming-service/modules/stream/s3.service';
import { CloudFrontService } from '@streaming-service/modules/stream/cloudfront.service';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  controllers: [StreamController],
  providers: [StreamService, S3Service, CloudFrontService],
})
export class StreamModule {}
