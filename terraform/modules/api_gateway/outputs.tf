# API Gateway モジュール出力定義

output "base_url" {
  description = "API Gateway のデプロイステージのベースURL"
  value       = aws_api_gateway_stage.api.invoke_url
}
