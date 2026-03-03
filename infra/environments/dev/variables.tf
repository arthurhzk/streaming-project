variable "aws_region" {
  type        = string
  description = "AWS region for resources"
  default     = "ap-southeast-2"
}

variable "environment" {
  type        = string
  description = "Environment (e.g. dev, staging, prod)"
}

variable "project_name" {
  type        = string
  description = "Project name used as prefix for all resource names"
}
