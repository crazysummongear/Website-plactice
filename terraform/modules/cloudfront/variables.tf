variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "s3_bucket_id" {
  description = "フロントエンド用S3バケットID"
  type        = string
}

variable "s3_bucket_arn" {
  description = "フロントエンド用S3バケットARN"
  type        = string
}

variable "s3_bucket_domain_name" {
  description = "フロントエンド用S3バケットドメイン名"
  type        = string
}
