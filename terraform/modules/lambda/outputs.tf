# Lambda モジュール出力定義

output "transactions_lambda_arn" {
  description = "transactions Lambda 関数の ARN"
  value       = aws_lambda_function.transactions.arn
}

output "transactions_lambda_name" {
  description = "transactions Lambda 関数の名前"
  value       = aws_lambda_function.transactions.function_name
}

output "transactions_lambda_invoke_arn" {
  description = "transactions Lambda 関数の Invoke ARN"
  value       = aws_lambda_function.transactions.invoke_arn
}

output "categories_lambda_arn" {
  description = "categories Lambda 関数の ARN"
  value       = aws_lambda_function.categories.arn
}

output "categories_lambda_name" {
  description = "categories Lambda 関数の名前"
  value       = aws_lambda_function.categories.function_name
}

output "categories_lambda_invoke_arn" {
  description = "categories Lambda 関数の Invoke ARN"
  value       = aws_lambda_function.categories.invoke_arn
}

output "csv_import_lambda_arn" {
  description = "csv_import Lambda 関数の ARN"
  value       = aws_lambda_function.csv_import.arn
}

output "csv_import_lambda_name" {
  description = "csv_import Lambda 関数の名前"
  value       = aws_lambda_function.csv_import.function_name
}

output "csv_import_lambda_invoke_arn" {
  description = "csv_import Lambda 関数の Invoke ARN"
  value       = aws_lambda_function.csv_import.invoke_arn
}
