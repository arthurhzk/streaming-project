variable "aws_region" {
  type        = string
  description = "AWS region for resources"
  default     = "us-east-1"
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket"
}

variable "environment" {
  type        = string
  description = "Environment (e.g. dev, staging, prod)"
}

variable "project_name" {
  type        = string
  description = "Project name used as prefix for all resource names"
}
