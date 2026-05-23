# API Gateway モジュール変数定義

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

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}

variable "transactions_lambda_arn" {
  description = "transactions Lambda 関数の ARN"
  type        = string
}

variable "transactions_lambda_name" {
  description = "transactions Lambda 関数の名前"
  type        = string
}

variable "transactions_lambda_invoke_arn" {
  description = "transactions Lambda 関数の Invoke ARN"
  type        = string
}

variable "categories_lambda_arn" {
  description = "categories Lambda 関数の ARN"
  type        = string
}

variable "categories_lambda_name" {
  description = "categories Lambda 関数の名前"
  type        = string
}

variable "categories_lambda_invoke_arn" {
  description = "categories Lambda 関数の Invoke ARN"
  type        = string
}

variable "csv_import_lambda_arn" {
  description = "csv_import Lambda 関数の ARN"
  type        = string
}

variable "csv_import_lambda_name" {
  description = "csv_import Lambda 関数の名前"
  type        = string
}

variable "csv_import_lambda_invoke_arn" {
  description = "csv_import Lambda 関数の Invoke ARN"
  type        = string
}
