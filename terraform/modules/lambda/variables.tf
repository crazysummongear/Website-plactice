# Lambda モジュール用変数定義

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "kakei"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "dev"
}

variable "dynamodb_table_name" {
  description = "DynamoDB テーブル名"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "DynamoDB テーブル ARN"
  type        = string
}

variable "csv_bucket_name" {
  description = "CSV 一時保存用 S3 バケット名"
  type        = string
}

variable "csv_bucket_arn" {
  description = "CSV 一時保存用 S3 バケット ARN"
  type        = string
}

variable "api_gateway_execution_arn" {
  description = "API Gateway 実行 ARN"
  type        = string
}
