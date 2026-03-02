variable "project_name" {
  type        = string
  description = "Project name used as prefix for resource names"
}

variable "environment" {
  type        = string
  description = "Environment (e.g. dev, staging, prod)"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the DynamoDB table"
  default     = {}
}
