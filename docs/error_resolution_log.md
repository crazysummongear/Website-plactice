# 2026年5月6日 エラー解消ログ

## 概要
本日のセッションで発生した複数のエラーと、その解消方法をまとめたドキュメントです。

---

## エラー1: Git ブランチの競合

### 🔴 エラー内容
```
Your branch is behind 'origin/main' by 4 commits
```

**原因**: 別のIDEで作成されたコードがリモートにプッシュされており、ローカルのmainブランチが遅れていた。

### ✅ 解消方法

1. **ローカルの変更を退避**
   ```powershell
   git stash push -m "Kiro session: Lambda env vars fix and Cognito lifecycle"
   ```
   - 今回のセッションで修正した内容（AWS_REGION削除、Cognito lifecycle追加）を一時保存

2. **リモートの最新コードを取り込み**
   ```powershell
   git pull origin main
   ```
   - リモートの4つのコミットをローカルに統合

3. **未追跡ファイルの削除**
   ```powershell
   Remove-Item -Path "terraform/modules/api_gateway/outputs.tf", "terraform/modules/api_gateway/variables.tf", "terraform/modules/lambda/outputs.tf" -Force
   ```
   - リモートから新しいバージョンを取得するため、競合する未追跡ファイルを削除

### 📝 学習ポイント
- 複数のIDEで同じリポジトリを編集する場合、定期的に `git pull` でリモートの変更を確認する必要がある
- `git stash` は変更を一時保存し、後で復元できる便利な機能

---

## エラー2: Lambda 環境変数の `AWS_REGION` エラー

### 🔴 エラー内容
```
Error: Invalid or missing required argument "AWS_REGION"
AWS_REGION is a reserved key and cannot be set manually in Lambda environment variables
```

**原因**: Lambda関数の環境変数に `AWS_REGION` を手動で設定しようとしたが、これはLambdaが自動的に設定する予約済みキー。

### ✅ 解消方法

**修正前**:
```hcl
environment {
  variables = {
    TABLE_NAME  = var.dynamodb_table_name
    BUCKET_NAME = var.csv_bucket_name
    AWS_REGION  = "ap-northeast-1"  # ❌ エラー
  }
}
```

**修正後**:
```hcl
environment {
  variables = {
    TABLE_NAME  = var.dynamodb_table_name
    BUCKET_NAME = var.csv_bucket_name
    # AWS_REGION は削除（Lambdaが自動設定）
  }
}
```

### 📝 学習ポイント
- Lambda関数は以下の環境変数を自動的に設定する:
  - `AWS_REGION`
  - `AWS_LAMBDA_FUNCTION_NAME`
  - `AWS_LAMBDA_LOG_GROUP_NAME`
  - `AWS_LAMBDA_LOG_STREAM_NAME`
- これらは手動で設定してはいけない

---

## エラー3: Cognito User Pool スキーマ変更エラー

### 🔴 エラー内容
```
Error: cannot modify or remove schema items
Cognito User Pool schema is immutable after creation
```

**原因**: Cognito User Poolは既にAWSに存在しており、スキーマは作成後変更不可。Terraformが既存リソースのスキーマを変更しようとした。

### ✅ 解消方法

**修正前**:
```hcl
resource "aws_cognito_user_pool" "kakei" {
  name = "kakei-user-pool-${var.environment}"
  
  schema {
    name              = "email"
    attribute_data_type = "String"
    required          = true
    mutable           = true
  }
  
  # ❌ スキーマ変更を試みる
}
```

**修正後**:
```hcl
resource "aws_cognito_user_pool" "kakei" {
  name = "kakei-user-pool-${var.environment}"
  
  schema {
    name              = "email"
    attribute_data_type = "String"
    required          = true
    mutable           = true
  }
  
  # ✅ ライフサイクル設定を追加
  lifecycle {
    ignore_changes = [schema]
  }
}
```

### 📝 学習ポイント
- Terraformの `lifecycle` ブロックで、特定の属性の変更を無視できる
- `ignore_changes = [schema]` により、スキーマの変更を無視し、他の属性の更新は許可
- 既存リソースを管理する場合、不変属性は `ignore_changes` で対応

---

## エラー4: Terraform ネストされた `for` ループの構文エラー

### 🔴 エラー内容
```
Error: Invalid 'for' expression
Key expression is required when building an object.
```

**原因**: Terraformのネストされた `for` ループの構文が間違っていた。

### ✅ 解消方法

**修正前**:
```hcl
for_each = {
  for r_name, r in local.resources :
  for m in r.methods : "${r_name}-${m}" => {  # ❌ 構文エラー
    resource_id = aws_api_gateway_resource.api_resources[r_name].id
    http_method = m
  }
}
```

**修正後**:
```hcl
for_each = {
  for item in flatten([
    for r_name, r in local.resources : [
      for m in r.methods : {
        key         = "${r_name}-${m}"
        resource_id = aws_api_gateway_resource.api_resources[r_name].id
        http_method = m
      }
    ]
  ]) : item.key => item
}
```

### 📝 学習ポイント
- Terraformのネストされた `for` ループは複雑
- `flatten()` 関数を使用して、ネストされたリストを平坦化する必要がある
- 最終的に `key => value` の形式にマッピングする必要がある

---

## エラー5: AWS SSO 認証トークン期限切れ

### 🔴 エラー内容
```
Error: No valid credential sources found
Token has expired and refresh failed
```

**原因**: AWS SSO認証トークンが期限切れになった。

### ✅ 解消方法

```powershell
# SSO再ログイン
aws sso login --profile dev

# 認証確認
aws sts get-caller-identity --profile dev
```

**ブラウザでの認証フロー**:
1. `aws sso login --profile dev` を実行
2. ブラウザが自動的に開く
3. AWSコンソールにログイン
4. 認証完了後、ターミナルに戻る

### 📝 学習ポイント
- AWS SSO認証トークンは一定期間で期限切れになる
- `aws sso login` で再認証が必要
- Terraform実行前に認証状態を確認: `aws sts get-caller-identity --profile dev`

---

## エラー6: API Gateway リソース作成エラー

### 🔴 エラー内容
```
Error: creating API Gateway Resource: BadRequestException: Resource's path part must be specified
Error: creating API Gateway Resource: ConflictException: Another resource with the same parent already has this name
Error: creating API Gateway Resource: BadRequestException: Resource's path part only allow a-zA-Z0-9._-
```

**原因**: 複数の問題が組み合わさっていた:
1. `root` リソースに `path_part` が空文字列 (`""`) だった
2. `csv/upload-url` をネストされていないリソースとして作成しようとした（スラッシュは許可されていない）
3. 既存リソースと名前が競合していた

### ✅ 解消方法

**修正前**:
```hcl
# ❌ 問題のあるコード
resource "aws_api_gateway_resource" "root" {
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  parent_id    = aws_api_gateway_rest_api.kakei_api.root_resource_id
  path_part    = ""  # ❌ 空文字列は許可されない
}

locals {
  resources = {
    csv_import = {
      path = "csv/upload-url"  # ❌ スラッシュは許可されない
      methods = ["POST"]
    }
  }
}
```

**修正後**:
```hcl
# ✅ 修正後のコード
# root リソースは削除（不要）

# CSV upload-url をネストされたリソースとして作成
resource "aws_api_gateway_resource" "csv_upload_url" {
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  parent_id   = aws_api_gateway_rest_api.kakei_api.root_resource_id
  path_part   = "csv"
}

resource "aws_api_gateway_resource" "csv_upload_url_nested" {
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  parent_id   = aws_api_gateway_resource.csv_upload_url.id
  path_part   = "upload-url"
}
```

### 📝 学習ポイント
- API Gateway リソースの `path_part` は以下のルールに従う:
  - 空文字列は許可されない
  - スラッシュ (`/`) は許可されない
  - 英数字、ドット、アンダースコア、ハイフンのみ許可
  - ネストされたパスは複数のリソースで表現する必要がある

---

## エラー7: API Gateway Integration Response 依存関係エラー

### 🔴 エラー内容
```
Error: putting API Gateway Integration Response: NotFoundException: Invalid Integration identifier specified
```

**原因**: Integration Responseを作成する前に、対応するIntegrationが完成していなかった。Terraformの依存関係が明示的に指定されていなかった。

### ✅ 解消方法

```hcl
# Deployment に明示的な依存関係を指定
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.csv_upload_integration,
    aws_api_gateway_integration.options_integration,
    aws_api_gateway_integration.csv_upload_options_integration
  ]
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  stage_name  = var.environment
}
```

### 📝 学習ポイント
- Terraformは自動的に依存関係を推測しようとするが、複雑な場合は失敗することがある
- `depends_on` で明示的に依存関係を指定することで、リソース作成の順序を制御できる
- API Gatewayの場合、Deploymentは最後に作成され、すべてのIntegrationが完成した後に実行される必要がある

---

## 今日の成果

### ✅ 完了したこと
1. Git ブランチの同期
2. Lambda 環境変数の修正
3. Cognito User Pool のライフサイクル設定
4. Terraform 構文エラーの修正
5. AWS SSO 認証の再実施
6. API Gateway リソース構造の修正

### ⚠️ 未完了
- API Gateway Integration Response の依存関係エラー（複数のエラーが残っている）

### 📊 プロジェクト進捗
- **全体完了度**: 約 60%
- **STEP 1-6**: ✅ 完了
- **STEP 7-10**: ⬜ 未着手

---

## 次回のセッションで対応すること

1. **API Gateway の簡略化**
   - 現在のコードは複雑すぎるため、シンプルな実装に変更
   - または、既存のAPI Gatewayを使用してフロントエンド実装に進む

2. **フロントエンド実装（STEP 7-9）**
   - Cognito 認証機能
   - 収支管理画面
   - CSV インポート機能

3. **デプロイ・動作確認（STEP 10）**
   - E2E テスト
   - ログ・モニタリング確認

---

## 参考資料

### AWS Lambda
- [Lambda 環境変数](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [Lambda 予約済み環境変数](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-reserved)

### AWS Cognito
- [Cognito User Pool スキーマ](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/userguide/user-pool-lambda-custom-message.html)

### Terraform
- [Terraform for_each](https://www.terraform.io/language/meta-arguments/for_each)
- [Terraform lifecycle](https://www.terraform.io/language/meta-arguments/lifecycle)
- [Terraform depends_on](https://www.terraform.io/language/meta-arguments/depends_on)

### API Gateway
- [API Gateway リソース](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-basic-integration.html)
- [API Gateway パス部分の制限](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-basic-integration.html)

---

**作成日**: 2026年5月6日  
**セッション時間**: 約3時間  
**対応者**: Kiro AI Agent
