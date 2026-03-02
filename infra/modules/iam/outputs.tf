output "access_key_id" {
  value       = aws_iam_access_key.video_service.id
  description = "Access key ID for the video service IAM user"
  sensitive   = true
}

output "secret_access_key" {
  value       = aws_iam_access_key.video_service.secret
  description = "Secret access key for the video service IAM user"
  sensitive   = true
}

output "video_service_access_key_id" {
  value     = aws_iam_access_key.video_service.id
  sensitive = true
}

output "video_service_secret_access_key" {
  value     = aws_iam_access_key.video_service.secret
  sensitive = true
}