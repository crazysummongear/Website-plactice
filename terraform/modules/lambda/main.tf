# Lambda 関数定義モジュール

# ========================================
# データソース（アーカイブ作成）
# ========================================
data "archive_file" "transactions_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/dist/handlers/transactions.js"
  output_path = "${path.module}/files/transactions.zip"
}

data "archive_file" "categories_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/dist/handlers/categories.js"
  output_path = "${path.module}/files/categories.zip"
}

data "archive_file" "csv_import_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/dist/handlers/csv-import.js"
  output_path = "${path.module}/files/csv-import.zip"
}

# ========================================
# IAM ロール（Lambda 実行用）
# ========================================
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-lambda-exec-role"
    Environment = var.environment
  }
}

# AWS管理ポリシーの適用（CloudWatch Logs出力用）
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# カスタム IAM ポリシー（DynamoDB & S3 アクセス用）
resource "aws_iam_policy" "lambda_resources_policy" {
  name        = "${var.project_name}-lambda-resources-policy-${var.environment}"
  description = "Lambda functions access policy for DynamoDB and S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # DynamoDB へのアクセス許可
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      },
      # S3 CSV 一時保存バケットへのアクセス許可
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "${var.csv_bucket_arn}",
          "${var.csv_bucket_arn}/*"
        ]
      }
    ]
  })
}

# カスタムポリシーのアタッチ
resource "aws_iam_role_policy_attachment" "lambda_resources" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_resources_policy.arn
}

# ========================================
# Lambda 関数定義
# ========================================

# 1. Transactions Lambda
resource "aws_lambda_function" "transactions" {
  filename         = data.archive_file.transactions_zip.output_path
  function_name    = "${var.project_name}-transactions-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "transactions.handler"
  source_code_hash = data.archive_file.transactions_zip.output_base64sha256
  runtime          = "nodejs20.x"
  memory_size      = 128
  timeout          = 10

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
    }
  }

  tags = {
    Name        = "${var.project_name}-transactions-${var.environment}"
    Environment = var.environment
  }
}

# 2. Categories Lambda
resource "aws_lambda_function" "categories" {
  filename         = data.archive_file.categories_zip.output_path
  function_name    = "${var.project_name}-categories-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "categories.handler"
  source_code_hash = data.archive_file.categories_zip.output_base64sha256
  runtime          = "nodejs20.x"
  memory_size      = 128
  timeout          = 10

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
    }
  }

  tags = {
    Name        = "${var.project_name}-categories-${var.environment}"
    Environment = var.environment
  }
}

# 3. CSV Import Lambda
resource "aws_lambda_function" "csv_import" {
  filename         = data.archive_file.csv_import_zip.output_path
  function_name    = "${var.project_name}-csv-import-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "csv-import.handler"
  source_code_hash = data.archive_file.csv_import_zip.output_base64sha256
  runtime          = "nodejs20.x"
  memory_size      = 128
  timeout          = 10

  environment {
    variables = {
      TABLE_NAME  = var.dynamodb_table_name
      BUCKET_NAME = var.csv_bucket_name
    }
  }

  tags = {
    Name        = "${var.project_name}-csv-import-${var.environment}"
    Environment = var.environment
  }
}

# ========================================
# S3 バケット通知の紐付け
# ========================================

# S3 から Lambda を呼び出す許可
resource "aws_lambda_permission" "csv_import_s3" {
  statement_id  = "AllowS3InvokeCsvImport"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.csv_import.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.csv_bucket_arn
}

# S3 バケット通知（CSVファイルアップロード検知）
resource "aws_s3_bucket_notification" "csv_temp_notification" {
  bucket = var.csv_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.csv_import.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".csv"
  }

  depends_on = [aws_lambda_permission.csv_import_s3]
}
