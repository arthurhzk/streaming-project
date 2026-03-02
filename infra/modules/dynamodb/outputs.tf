output "table_name" {
  value       = aws_dynamodb_table.videos.name
  description = "Name of the DynamoDB videos table"
}

output "table_arn" {
  value       = aws_dynamodb_table.videos.arn
  description = "ARN of the DynamoDB videos table"
}
