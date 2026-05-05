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

# テスト用S3バケット
output "terraform_state_test_bucket_id" {
  description = "Terraform状態管理テスト用S3バケットID"
  value       = aws_s3_bucket.terraform_state_test.id
}
