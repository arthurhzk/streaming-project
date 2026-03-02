locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

module "storage" {
  source = "../../modules/storage"

  bucket_name = var.bucket_name
  tags        = local.common_tags
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
}

module "s3" {
  source = "../../modules/s3"

  bucket_name = var.bucket_name
  tags        = local.common_tags
}