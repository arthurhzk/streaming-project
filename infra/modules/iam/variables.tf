variable "project_name" {
  type        = string
  description = "Project name used as prefix for resource names"
}

variable "environment" {
  type        = string
  description = "Environment (e.g. dev, staging, prod)"
}

variable "dynamodb_table_arn" {
  type        = string
  description = "ARN of the DynamoDB table the video service needs access to"
}

variable "s3_bucket_arn" {
  type        = string
  description = "ARN of the videos S3 bucket"
}