import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import env from '@streaming-service/config/env';
import { S3Service } from '@streaming-service/modules/stream/s3.service';
import { CloudFrontService } from '@streaming-service/modules/stream/cloudfront.service';
import { createLogger } from '@repo/logger';

const logger = createLogger('streaming-service');

export interface StreamSessionDto {
  manifestUrl: string;
  thumbnailUrl?: string;
  expiresAt: string;
}

interface VideoMetadataResponse {
  manifestKey?: string;
  s3Key?: string;
  thumbnailKey?: string;
  status?: string;
}

@Injectable()
export class StreamService {
  constructor(
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
    private readonly cloudfrontService: CloudFrontService,
  ) {}

  async getStreamSession(videoId: string): Promise<StreamSessionDto> {
    let video: VideoMetadataResponse;
    try {
      const response = await firstValueFrom(
        this.httpService.get<VideoMetadataResponse>(
          `${env.VIDEO_SERVICE_URL.replace(/\/$/, '')}/videos/${videoId}`,
          { timeout: 5000 },
        ),
      );
      video = response.data;
    } catch (err) {
      logger.error(
        { err, videoId, correlationId: (err as { correlationId?: string })?.correlationId },
        'Failed to fetch video metadata from video-service',
      );
      throw new ServiceUnavailableException('Unable to fetch video metadata');
    }

    const status = video.status ?? 'READY';
    if (status !== 'READY') {
      throw new NotFoundException('Video not available');
    }

    const manifestKey = video.manifestKey ?? video.s3Key;
    if (!manifestKey) {
      throw new NotFoundException('Video not available');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const result: StreamSessionDto = {
      manifestUrl: this.cloudfrontService.buildUrl(manifestKey),
      expiresAt,
    };

    if (video.thumbnailKey) {
      result.thumbnailUrl = this.cloudfrontService.buildUrl(video.thumbnailKey);
    }

    return result;
  }

  async getPresignedUrl(key: string): Promise<{ url: string; expiresAt: string }> {
    const url = await this.s3Service.getPresignedUrl(key);
    const expiresAt = new Date(Date.now() + env.PRESIGNED_URL_EXPIRES_IN * 1000).toISOString();
    return { url, expiresAt };
  }
}
