import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<VideoMetadata> {
    const id = randomUUID();
    const ext = file.originalname?.split('.').pop() ?? 'bin';
    const s3Key = `videos/${ownerId}/${id}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME as string,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const createdAt = new Date().toISOString();
    const item = {
      id,
      ownerId,
      slug: slug ?? null,
      category: category ?? null,
      s3Key,
      createdAt,
    };

    await this.dynamo.send(
      new PutCommand({
        TableName: env.DYNAMODB_TABLE_NAME as string | undefined,
        Item: item,
      }),
    );

    return item;
  }

  async getById(id: string): Promise<VideoMetadata> {
    const result = await this.dynamo.send(
      new GetCommand({
        TableName: env.DYNAMODB_TABLE_NAME as string,
        Key: { id },
      }),
    );

    const item = (result as unknown as { Item?: VideoMetadata }).Item;
    if (!item) {
      throw new NotFoundException('Video not found');
    }

    return item;
  }
}
