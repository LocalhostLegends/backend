resource "aws_s3_bucket" "db_backups" {
  bucket = var.backup_bucket_name

  tags = {
    Project     = "HRTech"
    Environment = "prod"
    ManagedBy   = "Terraform"
    Purpose     = "database-backups"
  }
}

resource "aws_s3_bucket_public_access_block" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  rule {
    id     = "cleanup-old-backups"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_iam_user" "github_backup" {
  name = "hrtech-github-backup-alex"

  tags = {
    Project     = "HRTech"
    Environment = "prod"
    ManagedBy   = "Terraform"
    Purpose     = "github-actions-db-backups"
  }
}

resource "aws_iam_policy" "github_backup_s3" {
  name        = "hrtech-github-backup-s3-policy"
  description = "Allow GitHub Actions backup user to upload database backups to S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.db_backups.arn,
          "${aws_s3_bucket.db_backups.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "github_backup_attach" {
  user       = aws_iam_user.github_backup.name
  policy_arn = aws_iam_policy.github_backup_s3.arn
}

resource "aws_iam_access_key" "github_backup" {
  user = aws_iam_user.github_backup.name
}