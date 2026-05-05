# S3 バケット定義モジュール

# フロントエンド用 S3 バケット
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${var.environment}-${data.aws_caller_identity.current.account_id}"

  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name        = "${var.project_name}-frontend-${var.environment}"
    Purpose     = "Frontend hosting"
    Environment = var.environment
  }
}

# フロントエンド用バケット：バージョニング有効化
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# フロントエンド用バケット：サーバー側暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# フロントエンド用バケット：パブリックアクセスブロック
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CSV 一時保存用 S3 バケット
resource "aws_s3_bucket" "csv_temp" {
  bucket = "${var.project_name}-csv-temp-${var.environment}-${data.aws_caller_identity.current.account_id}"

  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name        = "${var.project_name}-csv-temp-${var.environment}"
    Purpose     = "CSV temporary storage"
    Environment = var.environment
  }
}

# CSV用バケット：バージョニング有効化
resource "aws_s3_bucket_versioning" "csv_temp" {
  bucket = aws_s3_bucket.csv_temp.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CSV用バケット：サーバー側暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "csv_temp" {
  bucket = aws_s3_bucket.csv_temp.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CSV用バケット：パブリックアクセスブロック
resource "aws_s3_bucket_public_access_block" "csv_temp" {
  bucket = aws_s3_bucket.csv_temp.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CSV用バケット：ライフサイクルポリシー（7日後自動削除）
resource "aws_s3_bucket_lifecycle_configuration" "csv_temp" {
  bucket = aws_s3_bucket.csv_temp.id

  rule {
    id     = "delete-old-csv-files"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      days = 7
    }
  }
}

# データソース
data "aws_caller_identity" "current" {}
