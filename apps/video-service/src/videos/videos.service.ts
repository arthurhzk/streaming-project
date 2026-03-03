import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createS3Client, createDynamoDBDocumentClient, createDynamoDBClient } from '@repo/aws-sdk';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import env from '@video-service/config/env';

export interface VideoMetadata {
  id: string;
  ownerId: string;
  slug: string | null;
  category: string | null;
  s3Key: string;
  filename: string;
  size: number;
  duration: number | null;
  createdAt: string;
}

@Injectable()
export class VideosService {
  private readonly s3 = createS3Client({ region: env.AWS_REGION as string });
  private readonly dynamo = createDynamoDBDocumentClient(
    createDynamoDBClient({ region: env.AWS_REGION as string }),
  );

  async upload(
    file: Express.Multer.File,
    ownerId: string,
    slug?: string,
    category?: string,
    duration?: number,
  ): Promise<VideoMetadata> {
    const id = randomUUID();
    const ext = file.originalname?.split('.').pop() ?? 'bin';
    const s3Key = `videos/${ownerId}/${id}.${ext}`;

    await this.s3
      .send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME as string,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      )
      .catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to upload video to S3');
      });

    const createdAt = new Date().toISOString();
    const item: VideoMetadata = {
      id,
      ownerId,
      slug: slug ?? null,
      category: category ?? null,
      s3Key,
      filename: file.originalname ?? 'unknown',
      size: file.size ?? 0,
      duration: duration ?? null,
      createdAt,
    };

    await this.dynamo
      .send(
        new PutCommand({
          TableName: env.DYNAMODB_TABLE_NAME as string | undefined,
          Item: item,
        }),
      )
      .catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to save video metadata');
      });

    return item;
  }

  async getById(id: string): Promise<VideoMetadata> {
    const result = await this.dynamo.send(
      new GetCommand({
        TableName: env.DYNAMODB_TABLE_NAME as string,
        Key: { id },
      }),
    );

    const raw = (result as unknown as { Item?: Record<string, unknown> }).Item;
    if (!raw) {
      throw new NotFoundException('Video not found');
    }

    return {
      id: raw.id as string,
      ownerId: raw.ownerId as string,
      slug: (raw.slug as string | null) ?? null,
      category: (raw.category as string | null) ?? null,
      s3Key: raw.s3Key as string,
      filename: (raw.filename as string) ?? 'unknown',
      size: (raw.size as number) ?? 0,
      duration: (raw.duration as number | null) ?? null,
      createdAt: raw.createdAt as string,
    };
  }
}
