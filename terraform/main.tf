# テスト用 S3 バケット（Terraform 状態管理用に転用予定）
resource "aws_s3_bucket" "terraform_state_test" {
  bucket = "kakei-terraform-state-test-${data.aws_caller_identity.current.account_id}"

  lifecycle {
    prevent_destroy = false
  }
}

# テスト用バケット：バージョニング有効化
resource "aws_s3_bucket_versioning" "terraform_state_test" {
  bucket = aws_s3_bucket.terraform_state_test.id

  versioning_configuration {
    status = "Enabled"
  }
}

# テスト用バケット：サーバー側暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_test" {
  bucket = aws_s3_bucket.terraform_state_test.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# テスト用バケット：パブリックアクセスブロック
resource "aws_s3_bucket_public_access_block" "terraform_state_test" {
  bucket = aws_s3_bucket.terraform_state_test.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ========================================
# モジュール呼び出し
# ========================================

# S3 バケット（フロントエンド用・CSV用）
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# CloudFront ディストリビューション
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name          = var.project_name
  environment           = var.environment
  s3_bucket_id          = module.s3.frontend_bucket_id
  s3_bucket_arn         = module.s3.frontend_bucket_arn
  s3_bucket_domain_name = module.s3.frontend_bucket_domain_name
}

# DynamoDB テーブル
module "dynamodb" {
  source = "./modules/dynamodb"

  environment = var.environment
}

# Cognito User Pool
module "cognito" {
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment
}

# Lambda 関数
module "lambda" {
  source = "./modules/lambda"

  project_name        = var.project_name
  environment         = var.environment
  dynamodb_table_name = module.dynamodb.table_name
  dynamodb_table_arn  = module.dynamodb.table_arn
  csv_bucket_name     = module.s3.csv_temp_bucket_id
  csv_bucket_arn      = module.s3.csv_temp_bucket_arn
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"

  project_name                   = var.project_name
  environment                    = var.environment
  cognito_user_pool_arn          = module.cognito.user_pool_arn
  transactions_lambda_arn        = module.lambda.transactions_lambda_arn
  transactions_lambda_name       = module.lambda.transactions_lambda_name
  transactions_lambda_invoke_arn = module.lambda.transactions_lambda_invoke_arn
  categories_lambda_arn          = module.lambda.categories_lambda_arn
  categories_lambda_name         = module.lambda.categories_lambda_name
  categories_lambda_invoke_arn   = module.lambda.categories_lambda_invoke_arn
  csv_import_lambda_arn          = module.lambda.csv_import_lambda_arn
  csv_import_lambda_name         = module.lambda.csv_import_lambda_name
  csv_import_lambda_invoke_arn   = module.lambda.csv_import_lambda_invoke_arn
}