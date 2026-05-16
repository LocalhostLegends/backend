variable "aws_region" {
  description = "AWS region for production infrastructure"
  type        = string
}

variable "backup_bucket_name" {
  description = "S3 bucket name for database backups"
  type        = string
}