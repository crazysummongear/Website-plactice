# DynamoDB テーブル定義モジュール
# Single Table Design: KakeiTable
# PK: USER#userId
# SK: TX#date#txId (Transaction) / CAT#categoryId (Category)
#
# テーブル設計:
# - パーティションキー (PK): USER#<userId>
# - ソートキー (SK): TX#<YYYY-MM-DD>#<transactionId> または CAT#<categoryId>
# - 課金モード: PAY_PER_REQUEST (オンデマンド)
# - PITR: 無効化 (コスト削減のため)
# - GSI: 使用しない (コスト削減のため、アプリケーション側でフィルタリング)

resource "aws_dynamodb_table" "kakei_table" {
  name           = "KakeiTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  # 属性スキーマ
  attribute {
    name = "PK"
    type = "S"  # String: USER#<userId>
  }

  attribute {
    name = "SK"
    type = "S"  # String: TX#<date>#<txId> または CAT#<categoryId>
  }

  # Point-in-Time Recovery: 無効化 (コスト削減)
  # 個人学習用のため、自動バックアップは不要
  # 必要に応じて手動エクスポートを実施
  point_in_time_recovery {
    enabled = false
  }

  # タグ
  tags = {
    Name        = "kakei-table"
    Environment = var.environment
    Project     = "kakei"
    CostCenter  = "personal-learning"
  }
}
