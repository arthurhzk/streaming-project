# video-service

NestJS service that handles video uploads to S3 and stores/retrieves video metadata in DynamoDB.

## Responsibilities

- Upload video files to AWS S3
- Persist and retrieve video metadata in DynamoDB

## Run Locally

```bash
pnpm dev
```

Default port: 3002

## Environment Variables

| Variable                | Description                       |
| ----------------------- | --------------------------------- |
| `PORT`                  | Server port (default: 3002)       |
| `AWS_REGION`            | AWS region (default: us-east-1)   |
| `AWS_ACCESS_KEY_ID`     | AWS access key                    |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                    |
| `S3_BUCKET_NAME`        | S3 bucket for video storage       |
| `DYNAMODB_TABLE_NAME`   | DynamoDB table for video metadata |

## API Endpoints

| Method | Path             | Description                                                                                               |
| ------ | ---------------- | --------------------------------------------------------------------------------------------------------- |
| POST   | `/videos/upload` | Upload video to S3, persist metadata to DynamoDB. Multipart form: `file`, `ownerId`, `slug?`, `category?` |
| GET    | `/videos/:id`    | Retrieve video metadata from DynamoDB                                                                     |
