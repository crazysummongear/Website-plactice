---

inclusion: always

# Terraform標準（Terraform Standards）

このドキュメントはTerraformを使ったインフラ管理の標準である。

すべてのTerraformプロジェクトに適用する。

---

# 基本方針

インフラはコードで管理する。

手動変更を禁止する。

変更はterraform planで差分確認してからapplyする。

---

# ディレクトリ構成

以下の構成を標準とする。

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── provider.tf
├── backend.tf
└── modules/
    ├── s3/
    ├── cloudfront/
    ├── cognito/
    ├── dynamodb/
    ├── lambda/
    └── api_gateway/
```

各リソースはモジュールに分割する。

---

# ファイル命名規則

| ファイル | 用途 |
| ------- | ---- |
| main.tf | リソース定義・モジュール呼び出し |
| variables.tf | 変数定義 |
| outputs.tf | 出力値定義 |
| provider.tf | プロバイダー設定 |
| backend.tf | バックエンド設定 |

---

# 変数管理

機密情報は変数化してterraform.tfvarsで管理する。

terraform.tfvarsはgitignoreに追加する。

デフォルト値は開発環境向けに設定する。

---

# リソース命名規則

リソース名は以下の形式とする。

```
{プロジェクト名}-{リソース種別}-{環境名}
```

例

* kakei-lambda-dev
* kakei-dynamodb-dev
* kakei-s3-frontend-dev

---

# タグ付け

全リソースに以下のタグを付与する。

```hcl
tags = {
  Project     = "プロジェクト名"
  Environment = "dev / prod"
  ManagedBy   = "terraform"
}
```

---

# 実行手順

以下の順番で実行する。

1. terraform init
2. terraform validate
3. terraform plan
4. terraform apply

planの差分を必ず確認してからapplyする。

---

# バックエンド

tfstateはS3バックエンドで管理する。

ローカル管理は開発初期のみ許可する。

本番環境ではS3 + DynamoDB（ロック）を使用する。

---

# モジュール設計

モジュールは単一責任とする。

モジュール間の依存はoutputsで渡す。

モジュール内でハードコードを禁止する。

---

# コスト管理

リソース作成前にコスト試算を行う。

不要なリソースはterraform destroyで削除する。

開発環境では最小スペックを使用する。

---

# 設計レビュー必須項目

実装前に以下を確認すること。

| 項目 | 確認 |
| ---- | ---- |
| モジュール分割 | 必須 |
| 変数化 | 必須 |
| タグ付け | 必須 |
| コスト試算 | 必須 |
| tfstate管理方針 | 必須 |
| 命名規則 | 必須 |
