import { IsOptional, IsString } from 'class-validator';

export class UploadVideoDto {
  @IsString()
  ownerId!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
