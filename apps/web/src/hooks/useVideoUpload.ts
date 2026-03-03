import { useState, useCallback } from 'react';
import { useAuth } from '@web/contexts/use-auth';
import {
  uploadVideo,
  type VideoMetadata,
  type UploadVideoMetadata,
} from '@web/services/videoService';

const ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime', // mov
  'video/x-msvideo', // avi
  'video/webm',
];
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm'];

function isVideoFile(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export type UploadState = 'idle' | 'ready' | 'uploading' | 'success' | 'error';

export function useVideoUpload() {
  const { userId } = useAuth();
  const [state, setState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((file: File) => {
    if (!isVideoFile(file)) {
      setError('Invalid file type. Only video files are allowed (mp4, mov, avi, webm).');
      setState('error');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setState('ready');
  }, []);

  const upload = useCallback(
    async (formMetadata?: UploadVideoMetadata) => {
      if (!userId) {
        setError('You must be logged in to upload videos.');
        setState('error');
        return;
      }

      const file = selectedFile;
      if (!file) {
        setError('No file selected.');
        setState('error');
        return;
      }

      setState('uploading');
      setProgress(0);
      setError(null);
      setMetadata(null);

      try {
        const result = await uploadVideo(file, userId, {
          metadata: formMetadata,
          onProgress: setProgress,
        });
        setMetadata(result);
        setState('success');
        setProgress(100);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : err instanceof Error
              ? err.message
              : 'Upload failed. Please try again.';
        setError(String(message));
        setState('error');
      }
    },
    [userId, selectedFile],
  );

  const reset = useCallback(() => {
    setState('idle');
    setSelectedFile(null);
    setProgress(0);
    setMetadata(null);
    setError(null);
  }, []);

  return { state, selectedFile, progress, metadata, error, selectFile, upload, reset };
}
