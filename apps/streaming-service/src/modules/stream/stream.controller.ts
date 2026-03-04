import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { StreamService } from '@streaming-service/modules/stream/stream.service';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':videoId')
  async getStreamSession(@Param('videoId') videoId: string) {
    return this.streamService.getStreamSession(videoId);
  }

  @Get(':videoId/presigned')
  async getPresignedUrl(@Param('videoId') _videoId: string, @Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Query param "key" is required');
    }
    return this.streamService.getPresignedUrl(key);
  }
}
