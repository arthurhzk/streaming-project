import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client } from '@repo/aws-sdk';
import env from '@streaming-service/config/env';
import { createLogger } from '@repo/logger';

const logger = createLogger('streaming-service');

@Injectable()
export class S3Service {
  private readonly client = createS3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  async getPresignedUrl(key: string, expiresIn = env.PRESIGNED_URL_EXPIRES_IN): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });
      return await getSignedUrl(
        this.client as unknown as Parameters<typeof getSignedUrl>[0],
        command,
        { expiresIn },
      );
    } catch (err) {
      logger.error(
        { err, correlationId: (err as { correlationId?: string })?.correlationId },
        'S3 presigned URL generation failed',
      );
      throw new ServiceUnavailableException('Unable to generate presigned URL');
    }
  }
}
