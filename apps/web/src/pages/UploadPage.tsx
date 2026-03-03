import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Progress } from '@web/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@web/components/ui/form';
import { VideoDropzone } from '@web/components/VideoDropzone';
import { useVideoUpload } from '@web/hooks/useVideoUpload';

const metadataFormSchema = z.object({
  slug: z.string().optional(),
  category: z.string().optional(),
  duration: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: 'Duration must be a non-negative number',
    }),
});

type MetadataFormValues = z.infer<typeof metadataFormSchema>;

function getFilenameFromS3Key(s3Key: string): string {
  const parts = s3Key.split('/');
  return parts[parts.length - 1] ?? s3Key;
}

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const { state, selectedFile, progress, metadata, error, selectFile, upload, reset } =
    useVideoUpload();

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      slug: '',
      category: '',
      duration: undefined,
    },
  });

  function onMetadataSubmit(values: MetadataFormValues) {
    const duration = values.duration ? Number(values.duration) : undefined;
    const meta =
      values.slug || values.category || duration != null
        ? {
            slug: values.slug || undefined,
            category: values.category || undefined,
            duration,
          }
        : undefined;
    upload(meta);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Upload Video</CardTitle>
          <CardDescription>Upload your video and add optional metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === 'idle' && (
            <VideoDropzone
              onFileSelect={selectFile}
              disabled={false}
              isDragging={isDragging}
              onDragStateChange={setIsDragging}
            />
          )}

          {state === 'ready' && selectedFile && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium text-muted-foreground">Selected file</p>
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onMetadataSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="my-video-slug" {...field} />
                        </FormControl>
                        <FormDescription>URL-friendly identifier (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Tutorial, Vlog" {...field} />
                        </FormControl>
                        <FormDescription>Video category (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            placeholder="e.g. 120"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Video duration in seconds (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={reset} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Upload
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {state === 'uploading' && (
            <div className="space-y-2">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="truncate text-sm font-medium">{selectedFile?.name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
          )}

          {state === 'success' && metadata && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Upload complete</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">ID</dt>
                    <dd className="font-mono truncate">{metadata.id}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Filename</dt>
                    <dd className="truncate">
                      {metadata.filename ?? getFilenameFromS3Key(metadata.s3Key)}
                    </dd>
                  </div>
                  {metadata.slug && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Slug</dt>
                      <dd className="truncate">{metadata.slug}</dd>
                    </div>
                  )}
                  {metadata.category && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="truncate">{metadata.category}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{new Date(metadata.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
              <Button onClick={reset} variant="outline" className="w-full">
                Upload another
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Upload failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={reset} variant="outline" className="w-full">
                Try again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
