# デプロイ完了サマリー

**日付**: 2026年5月6日  
**プロジェクト**: kakei（家計管理アプリ）  
**完了度**: 60%（STEP 1-6 完了）

---

## 🎉 今回完了したこと

### STEP 4: Lambda + API Gateway のデプロイ

前回のセッションで発生していた **2つのTerraformエラー** を修正し、Lambda関数とAPI Gatewayを正常にデプロイしました。

#### 修正した問題

1. **Lambda環境変数エラー**
   - **問題**: `AWS_REGION` は予約済みキーのため、Lambda環境変数に手動設定できない
   - **解決**: 3つのLambda関数すべてから `AWS_REGION` を削除（Lambdaが自動設定）

2. **Cognito User Pool スキーマエラー**
   - **問題**: Cognito User Poolのスキーマは作成後変更不可
   - **解決**: `lifecycle { ignore_changes = [schema] }` を追加してスキーマ変更を無視

#### デプロイ結果

✅ **24個のリソースを作成**:
- Lambda関数 × 3
- API Gateway エンドポイント × 7
- IAM ロール・ポリシー × 4
- Lambda権限 × 4
- API Gateway デプロイメント・ステージ × 2
- Cognito Authorizer × 1
- その他統合リソース × 3

---

## 📦 作成されたAWSリソース一覧

### Lambda関数（3つ）
| 関数名 | ハンドラ | メモリ | タイムアウト |
|--------|----------|--------|--------------|
| `kakei-transactions-dev` | `handlers/transactions.handler` | 128MB | 10秒 |
| `kakei-categories-dev` | `handlers/categories.handler` | 128MB | 10秒 |
| `kakei-csv-import-dev` | `handlers/csv-import.handler` | 128MB | 10秒 |

**環境変数**:
- `TABLE_NAME`: `KakeiTable`
- `BUCKET_NAME`: `kakei-csv-temp-dev-839706991336`

### API Gateway
- **API ID**: `8uugz9nauk`
- **エンドポイント**: `https://8uugz9nauk.execute-api.ap-northeast-1.amazonaws.com/dev`
- **ステージ**: `dev`
- **認証**: Cognito User Pools Authorizer（全エンドポイントに適用）

#### エンドポイント一覧
| メソッド | パス | Lambda関数 | 説明 |
|----------|------|------------|------|
| GET | `/transactions` | `kakei-transactions-dev` | 収支一覧取得 |
| POST | `/transactions` | `kakei-transactions-dev` | 収支作成 |
| PUT | `/transactions/{id}` | `kakei-transactions-dev` | 収支更新 |
| DELETE | `/transactions/{id}` | `kakei-transactions-dev` | 収支削除 |
| GET | `/categories` | `kakei-categories-dev` | カテゴリ一覧取得 |
| POST | `/categories` | `kakei-categories-dev` | カテゴリ作成 |
| POST | `/csv/upload-url` | `kakei-csv-import-dev` | CSV用Presigned URL発行 |

### その他のリソース（既存）
- **DynamoDB**: `KakeiTable`
- **Cognito User Pool**: `ap-northeast-1_CVGCgVANa`
- **Cognito Client**: `9h4g3m651mrs65vta59u3qb4u`
- **S3 バケット**: `kakei-frontend-dev-839706991336`, `kakei-csv-temp-dev-839706991336`
- **CloudFront**: `https://drwpbnzy3pzzt.cloudfront.net`

---

## 🏗️ アーキテクチャ概要

```
[ユーザー]
    ↓
[CloudFront] → [S3: フロントエンド]
    ↓
[API Gateway] ← [Cognito: 認証]
    ↓
[Lambda × 3]
    ↓
[DynamoDB: KakeiTable]
    ↓
[S3: CSV一時保存]
```

### データフロー

1. **認証フロー**
   - ユーザー → Cognito User Pool → JWT トークン発行
   - フロントエンド → API Gateway（JWT検証） → Lambda

2. **収支管理フロー**
   - フロントエンド → API Gateway → Lambda → DynamoDB

3. **CSVインポートフロー**
   - フロントエンド → API Gateway → Lambda（Presigned URL発行）
   - フロントエンド → S3（直接アップロード）
   - S3イベント → Lambda → DynamoDB

---

## 💰 コスト最適化設定

| 項目 | 設定 | 理由 |
|------|------|------|
| Lambda メモリ | 128MB | 最小メモリで十分（個人利用） |
| Lambda タイムアウト | 10秒 | 短時間処理のみ |
| DynamoDB | PAY_PER_REQUEST | 低トラフィック向け |
| DynamoDB PITR | 無効 | バックアップ不要（学習用） |
| CloudFront | PriceClass_100 | 北米・ヨーロッパのみ |
| S3 ライフサイクル | 7日後削除（CSV用） | 一時ファイルの自動削除 |

**月額コスト見積もり**: 約 **$0.27/月**（目標: $5以内）

---

## ✅ 完了したSTEP

| STEP | タイトル | 状態 |
|------|----------|------|
| 1 | AWS 認証設定 | ✅ 完了 |
| 2 | Terraform — インフラ基盤（S3 + CloudFront） | ✅ 完了 |
| 3 | Terraform — DynamoDB + Cognito | ✅ 完了 |
| 4 | Terraform — Lambda + API Gateway | ✅ 完了 |
| 5 | バックエンド — 共通ライブラリ | ✅ 完了 |
| 6 | バックエンド — Lambda ハンドラ | ✅ 完了 |

---

## 🚀 次のステップ（STEP 7-10）

### STEP 7: フロントエンド — 認証
- Cognito認証関数実装（サインアップ・ログイン・ログアウト）
- 認証状態管理フック
- ログイン画面・サインアップ画面
- 認証ガード（PrivateRoute）

### STEP 8: フロントエンド — 収支機能
- API呼び出し関数実装
- React Query フック
- ダッシュボード（月別サマリー・グラフ）
- 収支一覧ページ
- 収支入力フォーム

### STEP 9: フロントエンド — CSV インポート
- CSV API関数実装
- CSVインポートページ
- CSVプレビュー
- カラムマッピング
- カテゴリ管理ページ

### STEP 10: デプロイ・動作確認
- フロントエンドビルド・S3デプロイ
- E2Eテスト
- ログ・モニタリング確認
- ドキュメント作成

---

## 📝 技術スタック

### インフラ
- **IaC**: Terraform
- **クラウド**: AWS（ap-northeast-1）
- **認証**: AWS SSO（開発環境）

### バックエンド
- **ランタイム**: Node.js 20.x
- **言語**: TypeScript
- **ビルドツール**: esbuild
- **データベース**: DynamoDB
- **ストレージ**: S3

### フロントエンド（予定）
- **フレームワーク**: React + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Query
- **フォーム**: React Hook Form + Zod

---

## 🔧 開発コマンド

### Terraform
```powershell
# 初期化
terraform -chdir=terraform init

# 検証
terraform -chdir=terraform validate

# プラン確認
$env:AWS_PROFILE = "dev"; terraform -chdir=terraform plan

# デプロイ
$env:AWS_PROFILE = "dev"; terraform -chdir=terraform apply -auto-approve

# リソース削除
$env:AWS_PROFILE = "dev"; terraform -chdir=terraform destroy
```

### バックエンド
```powershell
# ビルド
cd backend
npm run build

# Lambda関数をZIPに圧縮
# （esbuildが自動的に dist/ に出力）
```

### AWS CLI
```powershell
# SSO ログイン
aws sso login --profile dev

# Lambda関数一覧
aws lambda list-functions --profile dev --query "Functions[?starts_with(FunctionName, 'kakei-')].FunctionName"

# API Gateway一覧
aws apigateway get-rest-apis --profile dev
```

---

## 📚 参考ドキュメント

- [設計思想](./design_philosophy.md) - なぜこの構成を選んだのか
- [モダンアーキテクチャ参考](./modern_architecture_reference.md) - 技術選定の背景
- [リポジトリポリシー](./repository_policy.md) - 開発方針
- [タスク一覧](./.kiro/specs/kakei/tasks.md) - 実装タスク詳細

---

**最終更新**: 2026年5月6日
