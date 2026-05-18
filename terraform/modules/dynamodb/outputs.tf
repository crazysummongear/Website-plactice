# 出力値

output "table_name" {
  description = "DynamoDB テーブル名"
  value       = aws_dynamodb_table.kakei_table.name
}

output "table_arn" {
  description = "DynamoDB テーブル ARN"
  value       = aws_dynamodb_table.kakei_table.arn
}
