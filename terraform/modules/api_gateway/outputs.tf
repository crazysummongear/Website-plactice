# API Gateway モジュール出力定義

output "base_url" {
  description = "API Gateway のデプロイステージのベースURL"
  value       = "https://${aws_api_gateway_rest_api.kakei_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "rest_api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.kakei_api.id
}

output "api_gateway_execution_arn" {
  description = "API Gateway 実行 ARN（Lambda 権限用）"
  value       = "arn:aws:apigateway:${data.aws_region.current.name}::/restapis/${aws_api_gateway_rest_api.kakei_api.id}"
}
