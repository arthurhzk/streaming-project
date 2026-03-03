# Backend configuration - uses local state by default.
# For production, configure remote state (e.g. S3 + DynamoDB):
#
# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "streaming-project/dev/terraform.tfstate"
#     region         = "ap-southeast-2"
#     dynamodb_table = "terraform-state-lock"
#   }
# }
