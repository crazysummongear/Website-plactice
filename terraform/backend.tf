terraform {
  # ローカルバックエンド（開発環境用）
  # 本番環境では以下のコメントを解除し、S3 バックエンドに変更
  # backend "s3" {
  #   profile        = "dev"
  #   bucket         = "kakei-terraform-state-dev"
  #   key            = "kakei/terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}