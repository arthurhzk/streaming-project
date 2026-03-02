resource "aws_dynamodb_table" "videos" {
  name         = "${var.project_name}-videos-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "ownerId"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "s3_path"
    type = "S"
  }

  global_secondary_index {
    name            = "ownerId-createdAt-index"
    hash_key        = "ownerId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "slug-index"
    hash_key        = "slug"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "category-createdAt-index"
    hash_key        = "category"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = var.tags
}
