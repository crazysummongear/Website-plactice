# Cognito モジュール用変数定義

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
