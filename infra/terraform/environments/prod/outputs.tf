output "backup_bucket_name" {
  description = "Name of the S3 backup bucket"
  value       = aws_s3_bucket.db_backups.bucket
}

output "backup_bucket_arn" {
  description = "ARN of the S3 backup bucket"
  value       = aws_s3_bucket.db_backups.arn
}

output "github_backup_access_key_id" {
  description = "Access key ID for GitHub Actions backup user"
  value       = aws_iam_access_key.github_backup.id
}

output "github_backup_secret_access_key" {
  description = "Secret access key for GitHub Actions backup user"
  value       = aws_iam_access_key.github_backup.secret
  sensitive   = true
}