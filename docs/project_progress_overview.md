# kakei プロジェクト進捗概要

**最終更新**: 2026年5月24日  
**プロジェクト**: 35歳 FIRE 達成を目標とした資産管理アプリ  
**全体進捗**: 約 53% 完了（129/242 タスク）

---

## 📊 アーキテクチャ全体図

```
┌─────────────────────────────────────────────────────────────────┐
│                         ユーザー                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                              │
│              https://drwpbnzy3pzzt.cloudfront.net                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  S3 (静的ホスティング)                            │
│         React + TypeScript + Tailwind CSS                        │
│         - LoginPage (✅ 完了)                                     │
│         - SignupPage (✅ 完了)                                    │
│         - Dashboard (🔄 進行中)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cognito User Pool (認証)                            │
│         - メール/パスワード認証 (✅ 完了)                          │
│         - メール検証フロー (✅ 完了)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Gateway (REST API)                              │
│         - /transactions (GET, POST, PUT, DELETE)                 │
│         - /categories (GET, POST)                                │
│         - /csv/upload-url (POST)                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lambda 関数                                    │
│         - kakei-transactions (✅ 完了)                            │
│         - kakei-categories (✅ 完了)                              │
│         - kakei-csv-import (✅ 完了)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DynamoDB (NoSQL DB)                             │
│         Table: KakeiTable                                        │
│         PK: USER#userId, SK: TX#date#txId                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ 完了した主要機能

### 1. **インフラ基盤（Wave 1-3）** ✅ 100% 完了

#### STEP 1: AWS 認証設定
- ✅ AWS Identity Center 有効化
- ✅ SSO プロファイル設定（`dev`）
- ✅ AWS CLI 認証確認

#### STEP 2: Terraform — S3 + CloudFront
- ✅ フロントエンド用 S3 バケット: `kakei-frontend-dev-839706991336`
- ✅ CSV 一時保存用 S3 バケット: `kakei-csv-temp-dev-839706991336`
- ✅ CloudFront ディストリビューション: `E2LK33Q7R6I7R5`
- ✅ OAC（Origin Access Control）設定
- ✅ SPA 対応（404/403 → index.html）

#### STEP 3: Terraform — DynamoDB + Cognito
- ✅ DynamoDB テーブル: `KakeiTable`
  - PK: `USER#userId`
  - SK: `TX#date#txId`
  - Billing Mode: PAY_PER_REQUEST（コスト最適化）
- ✅ Cognito User Pool: `kakei-user-pool-dev`
  - User Pool ID: `ap-northeast-1_CVGCgVANa`
  - Client ID: `9h4g3m651mrs65vta59u3qb4u`
  - メール検証必須
  - パスワードポリシー: 最小12文字

---

### 2. **バックエンド実装（Wave 4-6）** ✅ 100% 完了

#### STEP 4: Terraform — Lambda + API Gateway
- ✅ Lambda IAM ロール（最小権限）
- ✅ Lambda 関数定義（3つ）
  - `kakei-transactions`
  - `kakei-categories`
  - `kakei-csv-import`
- ✅ API Gateway REST API
- ✅ Cognito Authorizer 設定
- ✅ CORS 設定

#### STEP 5: バックエンド共通ライブラリ
- ✅ 型定義（`Transaction`, `Category`, `ApiResponse`）
- ✅ DynamoDB ヘルパー（`put`, `query`, `update`, `delete`）
- ✅ レスポンスヘルパー（`successResponse`, `errorResponse`）
- ✅ 認証ヘルパー（JWT トークン検証）

#### STEP 6: Lambda ハンドラ実装
- ✅ `transactions.ts`: 収支管理 CRUD
- ✅ `categories.ts`: カテゴリ管理
- ✅ `csv-import.ts`: CSV インポート（Presigned URL）

---

### 3. **フロントエンド認証（Wave 7）** ✅ 100% 完了
