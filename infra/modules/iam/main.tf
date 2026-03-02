resource "aws_iam_user" "video_service" {
  name = "${var.project_name}-video-service-${var.environment}"
  path = "/"
}

# -------------------------------------------------------
# DynamoDB policy
# -------------------------------------------------------

resource "aws_iam_policy" "video_service_dynamodb" {
  name        = "${var.project_name}-video-service-dynamodb-${var.environment}"
  description = "Allows video-service to read and write to the videos DynamoDB table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowTableAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*",
        ]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "video_service_dynamodb" {
  user       = aws_iam_user.video_service.name
  policy_arn = aws_iam_policy.video_service_dynamodb.arn
}

# -------------------------------------------------------
# S3 policy
# -------------------------------------------------------

resource "aws_iam_policy" "video_service_s3" {
  name        = "${var.project_name}-video-service-s3-${var.environment}"
  description = "Allows video-service to read and write to the videos S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
        ]
        Resource = "${var.s3_bucket_arn}/*"
      },
      {
        Sid    = "AllowPresignedUrls"
        Effect = "Allow"
        Action = [
          "s3:GeneratePresignedUrl",
        ]
        Resource = "${var.s3_bucket_arn}/*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "video_service_s3" {
  user       = aws_iam_user.video_service.name
  policy_arn = aws_iam_policy.video_service_s3.arn
}

# -------------------------------------------------------
# Access key
# -------------------------------------------------------

resource "aws_iam_access_key" "video_service" {
  user = aws_iam_user.video_service.name
}