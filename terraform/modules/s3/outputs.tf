output "frontend_bucket_id" {
  description = "フロントエンド用S3バケットID"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "フロントエンド用S3バケットARN"
  value       = aws_s3_bucket.frontend.arn
}

output "frontend_bucket_domain_name" {
  description = "フロントエンド用S3バケットドメイン名"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "csv_temp_bucket_id" {
  description = "CSV一時保存用S3バケットID"
  value       = aws_s3_bucket.csv_temp.id
}

output "csv_temp_bucket_arn" {
  description = "CSV一時保存用S3バケットARN"
  value       = aws_s3_bucket.csv_temp.arn
}
