# Cognito モジュール用出力値

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.kakei.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.kakei.arn
}

output "user_pool_name" {
  description = "Cognito User Pool 名"
  value       = aws_cognito_user_pool.kakei.name
}

output "client_id" {
  description = "Cognito User Pool Client ID（SPA用）"
  value       = aws_cognito_user_pool_client.kakei_spa.id
}

output "domain_name" {
  description = "Cognito User Pool Domain 名"
  value       = aws_cognito_user_pool_domain.kakei.domain
}

output "domain_base_url" {
  description = "Cognito User Pool Domain ベースURL"
  value       = "https://${aws_cognito_user_pool_domain.kakei.domain}.auth.ap-northeast-1.amazoncognito.com"
}
