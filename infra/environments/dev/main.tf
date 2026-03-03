data "aws_caller_identity" "current" {}

locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
  # S3 bucket names must be globally unique - include account ID
  bucket_name = "${var.project_name}-videos-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "iam" {
  source = "../../modules/iam"

  project_name       = var.project_name
  environment        = var.environment
  dynamodb_table_arn = module.dynamodb.table_arn
  s3_bucket_arn      = module.s3.bucket_arn
}

module "s3" {
  source = "../../modules/s3"

  bucket_name = local.bucket_name
  tags        = local.common_tags
}