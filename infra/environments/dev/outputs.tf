output "videos_table_name" {
  value       = module.dynamodb.table_name
  description = "Name of the DynamoDB videos table"
}

output "videos_table_arn" {
  value       = module.dynamodb.table_arn
  description = "ARN of the DynamoDB videos table"
}

output "video_service_access_key_id" {
  value       = module.iam.access_key_id
  description = "Access key ID for the video service"
  sensitive   = true
}

output "video_service_secret_access_key" {
  value       = module.iam.secret_access_key
  description = "Secret access key for the video service"
  sensitive   = true
}

output "bucket_name" {
  value       = module.s3.bucket_name
  description = "Name of the S3 bucket"
}
