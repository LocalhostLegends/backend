variable "aws_region" {
  description = "AWS region for Terraform remote state infrastructure"
  type        = string
}

variable "terraform_state_bucket_name" {
  description = "S3 bucket name for Terraform remote state"
  type        = string
}