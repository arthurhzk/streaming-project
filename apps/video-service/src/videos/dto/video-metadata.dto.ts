export class VideoMetadataDto {
  id!: string;
  ownerId!: string;
  slug!: string | null;
  category!: string | null;
  s3Key!: string;
  createdAt!: string;
}
