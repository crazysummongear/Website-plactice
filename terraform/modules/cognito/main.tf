# Cognito User Pool 定義モジュール
# STEP 3.2.1: User Pool を作成

# ========================================
# Cognito User Pool
# ========================================

resource "aws_cognito_user_pool" "kakei" {
  name = "kakei-user-pool-${var.environment}"

  # ========================================
  # パスワードポリシー
  # ========================================
  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # ========================================
  # ユーザー属性設定
  # ========================================
  schema {
    name              = "email"
    attribute_data_type = "String"
    required          = true
    mutable           = true
  }

  schema {
    name              = "name"
    attribute_data_type = "String"
    required          = false
    mutable           = true
  }

  # ========================================
  # メール検証設定
  # ========================================
  # メール検証を必須に設定（自動検証は無効化）
  # ユーザーはサインアップ後、メール検証コードを入力して検証する必要がある
  email_verification_subject = "kakei - メール検証コード"
  email_verification_message = "検証コード: {####}"

  # ========================================
  # アカウント復旧設定
  # ========================================
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # ========================================
  # MFA設定（オプション）
  # ========================================
  mfa_configuration = "OFF"  # 個人利用のため無効化（コスト削減）

  # ========================================
  # ユーザー属性の更新許可
  # ========================================
  # メール検証が必須のため、この設定は不要
  # user_attribute_update_settings {
  #   attributes_require_verification_before_update = ["email"]
  # }

  tags = {
    Name        = "kakei-user-pool"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ========================================
# Cognito User Pool Client（SPA用）
# ========================================

resource "aws_cognito_user_pool_client" "kakei_spa" {
  name                = "kakei-spa-client-${var.environment}"
  user_pool_id        = aws_cognito_user_pool.kakei.id
  generate_secret     = false  # SPA用のため、クライアントシークレットなし

  # ========================================
  # 認証フロー設定
  # ========================================
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  # ========================================
  # Callback URL設定
  # ========================================
  callback_urls = [
    "http://localhost:5173",
    "http://localhost:5173/",
    "http://localhost:5173/dashboard"
  ]

  # ========================================
  # Logout URL設定
  # ========================================
  logout_urls = [
    "http://localhost:5173",
    "http://localhost:5173/"
  ]

  # ========================================
  # CORS設定
  # ========================================
  allowed_oauth_flows = [
    "code",
    "implicit"
  ]

  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]

  allowed_oauth_flows_user_pool_client = true

  # ========================================
  # トークン設定
  # ========================================
  access_token_validity  = 1    # 1時間
  id_token_validity      = 1    # 1時間
  refresh_token_validity = 30   # 30日
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # ========================================
  # その他の設定
  # ========================================
  prevent_user_existence_errors = "ENABLED"  # セキュリティ向上
}

# ========================================
# Cognito User Pool Domain（オプション）
# ========================================

resource "aws_cognito_user_pool_domain" "kakei" {
  domain       = "kakei-${var.environment}-${data.aws_caller_identity.current.account_id}"
  user_pool_id = aws_cognito_user_pool.kakei.id
}

# ========================================
# データソース
# ========================================

data "aws_caller_identity" "current" {}
