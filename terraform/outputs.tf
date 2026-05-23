# ========================================
# 出力値
# ========================================

# S3 バケット
output "frontend_bucket_id" {
  description = "フロントエンド用S3バケットID"
  value       = module.s3.frontend_bucket_id
}

output "csv_temp_bucket_id" {
  description = "CSV一時保存用S3バケットID"
  value       = module.s3.csv_temp_bucket_id
}

# CloudFront
output "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューションID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_url" {
  description = "CloudFront ディストリビューションURL"
  value       = module.cloudfront.distribution_url
}

# DynamoDB
output "dynamodb_table_name" {
  description = "DynamoDB テーブル名"
  value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  description = "DynamoDB テーブル ARN"
  value       = module.dynamodb.table_arn
}

# Cognito
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = module.cognito.user_pool_arn
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID（SPA用）"
  value       = module.cognito.client_id
}

output "cognito_domain_base_url" {
  description = "Cognito User Pool Domain ベースURL"
  value       = module.cognito.domain_base_url
}

# テスト用S3バケット
output "terraform_state_test_bucket_id" {
  description = "Terraform状態管理テスト用S3バケットID"
  value       = aws_s3_bucket.terraform_state_test.id
}

# API Gateway
output "api_gateway_url" {
  description = "API Gateway のベース URL"
  value       = module.api_gateway.base_url
}

