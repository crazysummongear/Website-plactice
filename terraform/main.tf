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