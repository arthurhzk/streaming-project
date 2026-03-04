# streaming-service

NestJS service that serves video content via presigned S3 URLs and CloudFront HLS manifests.

## Responsibilities

- **Stream sessions** — Fetch video metadata from video-service, validate availability, and return CloudFront URLs for HLS manifests (.m3u8) and thumbnails
- **Presigned URLs** — Generate time-limited S3 presigned URLs for direct object access (e.g. segment downloads)
- **CloudFront URLs** — Build signed/public URLs for HLS manifests and thumbnails served via CloudFront

## Run Locally

```bash
pnpm dev
```

Default port: 3010

## Environment Variables

| Variable                   | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `PORT`                     | Server port (default: 3010)                    |
| `AWS_REGION`               | AWS region (default: ap-southeast-2)           |
| `AWS_ACCESS_KEY_ID`        | AWS access key                                 |
| `AWS_SECRET_ACCESS_KEY`    | AWS secret key                                 |
| `S3_BUCKET_NAME`           | S3 bucket for video storage                    |
| `CLOUDFRONT_URL`           | CloudFront distribution URL                    |
| `VIDEO_SERVICE_URL`        | Base URL of video-service                      |
| `PRESIGNED_URL_EXPIRES_IN` | Presigned URL expiry in seconds (default: 900) |

## API Endpoints

### GET `/stream/:videoId`

Returns a stream session with URLs to play the video. Fetches metadata from video-service, validates the video is `READY`, and builds CloudFront URLs for the HLS manifest and optional thumbnail.

**Response**

```json
{
  "manifestUrl": "https://d123.cloudfront.net/videos/abc123/master.m3u8",
  "thumbnailUrl": "https://d123.cloudfront.net/videos/abc123/thumb.jpg",
  "expiresAt": "2025-03-03T12:30:00.000Z"
}
```

- `manifestUrl` — CloudFront URL for the HLS manifest
- `thumbnailUrl` — CloudFront URL for the thumbnail (omitted if not available)
- `expiresAt` — Session expiry (15 minutes from request)

**Errors**

- `404` — Video not found or not available (status ≠ READY)
- `503` — Unable to reach video-service

---

### GET `/stream/:videoId/presigned`

Returns a presigned S3 URL for direct object access (e.g. HLS segment fetches).

**Query params**

| Param | Required | Description   |
| ----- | -------- | ------------- |
| `key` | Yes      | S3 object key |

**Response**

```json
{
  "url": "https://bucket.s3.region.amazonaws.com/path/to/segment.ts?X-Amz-...",
  "expiresAt": "2025-03-03T12:30:00.000Z"
}
```

**Errors**

- `400` — Missing `key` query param
- `503` — S3 presigned URL generation failed

---

### GET `/health`

Health check endpoint.

**Response**

```json
{
  "status": "ok"
}
```
