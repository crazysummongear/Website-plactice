variable "aws_profile" {
  description = "AWS CLI プロファイル名（環境変数 AWS_PROFILE で指定可能）"
  type        = string
  default     = "dev"
  nullable    = true
}

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

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}
