import { api } from '@web/lib/api';

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

export interface UploadVideoMetadata {
  slug?: string;
  category?: string;
  duration?: number;
}

export async function uploadVideo(
  file: File,
  ownerId: string,
  options?: { metadata?: UploadVideoMetadata; onProgress?: (percent: number) => void },
): Promise<VideoMetadata> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ownerId', ownerId);

  const meta = options?.metadata;
  if (meta?.slug) formData.append('slug', meta.slug);
  if (meta?.category) formData.append('category', meta.category);
  if (meta?.duration != null) formData.append('duration', String(meta.duration));

  const res = await api.post<VideoMetadata>('/videos/upload', formData, {
    onUploadProgress: (e) => {
      if (e.total && e.total > 0 && options?.onProgress) {
        options.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return res.data;
}
