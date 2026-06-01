---

inclusion: always

# AWS構成標準（AWS Architecture Standards）

このドキュメントはAWSを使ったプロジェクトにおける構成標準のハブである。

詳細な実装ルールは各 steering ファイルで管理し、このドキュメントはそれらを統合する。

---

## 📋 標準ドキュメント体系

AWS プロジェクトの実装には、以下の標準ドキュメントを参照する。

### 1. **Terraform 標準** (#[[file:terraform-standards.md]])

**対象**: インフラストラクチャコード管理

**主な内容**:
- ディレクトリ構成
- ファイル命名規則
- 変数管理
- リソース命名規則
- タグ付け
- 実行手順
- バックエンド管理
- モジュール設計

**使用場面**: Terraform コードを書く前に必ず確認

---

### 2. **Lambda 標準** (#[[file:lambda-standards.md]])

**対象**: AWS Lambda 関数の実装

**主な内容**:
- ディレクトリ構成
- ハンドラ設計
- エラーハンドリング
- 共通ライブラリ
- 型定義
- CORS ヘッダー
- 環境変数
- パフォーマンス最適化
- ビルド・デプロイ
- テスト戦略

**使用場面**: Lambda 関数を実装する前に必ず確認

---

### 3. **React 標準** (#[[file:react-standards.md]])

**対象**: フロントエンド実装

**主な内容**:
- 技術スタック
- ライブラリバージョン管理
- 状態管理ルール
- コンポーネント設計
- テスタビリティ（data-testid）
- Mock Mode 設計
- E2E 考慮事項
- フォームバリデーション
- 認証フロー

**使用場面**: React コンポーネントを実装する前に必ず確認

---

### 4. **開発標準** (#[[file:engineering-standards.md]])

**対象**: 全体的な開発プロセス

**主な内容**:
- 基本方針（設計優先）
- requirements.md 必須項目
- design.md 必須項目
- テスト設計ルール
- React 設計ルール
- ライブラリバージョン管理ルール
- フォームバリデーションルール
- E2E テスト実装ルール
- 設計レビュー必須項目

**使用場面**: 新機能開発・バグ修正の開始時に確認

---

## 🎯 AWS 構成の基本原則

### 1. Infrastructure as Code（IaC）

- AWSリソースはすべて **Terraform** で管理
- コンソールからの手動作成は禁止
- 詳細は #[[file:terraform-standards.md]] を参照

### 2. 最小権限の原則

- IAM ロールは対象リソースのみアクセス可能
- ワイルドカード（*）の使用は禁止
- 詳細は #[[file:lambda-standards.md]] の「IAM最小権限」を参照

### 3. セキュリティ第一

- HTTPS を強制
- 認証・認可を必須化
- シークレット情報は環境変数で管理
- 詳細は #[[file:engineering-standards.md]] を参照

### 4. コスト最適化

- 月額目標: $5 以内（個人・学習用途）
- 不要なリソースは即座に削除
- 詳細は #[[file:terraform-standards.md]] の「コスト管理」を参照

---

## 🔗 リソース別ガイド

### 認証・認可

| リソース | 標準 | 詳細 |
|---------|------|------|
| Cognito User Pool | AWS 標準 | パスワード最小12文字、メール検証必須 |
| IAM ロール | Lambda 標準 | 最小権限の原則を適用 |
| API Gateway Authorizer | Lambda 標準 | Cognito Authorizer を設定 |

**参照**: #[[file:lambda-standards.md]], #[[file:engineering-standards.md]]

---

### ネットワーク・配信

| リソース | 標準 | 詳細 |
|---------|------|------|
| CloudFront | Terraform 標準 | PriceClass_100、OAC 設定 |
| S3 | Terraform 標準 | パブリックアクセスブロック、暗号化 |
| API Gateway | Lambda 標準 | REST API、CORS 設定 |

**参照**: #[[file:terraform-standards.md]], #[[file:lambda-standards.md]]

---

### コンピュート

| リソース | 標準 | 詳細 |
|---------|------|------|
| Lambda | Lambda 標準 | Node.js 20.x、メモリ128MB、タイムアウト10秒 |
| 環境変数 | Lambda 標準 | リソース名は環境変数で渡す |

**参照**: #[[file:lambda-standards.md]]

---

### ストレージ

| リソース | 標準 | 詳細 |
|---------|------|------|
| DynamoDB | Terraform 標準 | PAY_PER_REQUEST、Single Table Design |
| S3 バージョニング | Terraform 標準 | フロントエンド用のみ有効 |
| ライフサイクル | Terraform 標準 | 一時ファイルは7日後削除 |

**参照**: #[[file:terraform-standards.md]]

---

## ✅ 設計レビュー必須項目

実装前に以下を確認すること。

| 項目 | 確認 | 参照 |
|------|------|------|
| IAM最小権限 | 必須 | #[[file:lambda-standards.md]] |
| HTTPS強制 | 必須 | #[[file:terraform-standards.md]] |
| CORS設定 | 必須 | #[[file:lambda-standards.md]] |
| コスト試算 | 必須 | #[[file:terraform-standards.md]] |
| タグ付け | 必須 | #[[file:terraform-standards.md]] |
| シークレット管理 | 必須 | #[[file:engineering-standards.md]] |
| テスト戦略 | 必須 | #[[file:engineering-standards.md]] |
| 状態管理 | 必須 | #[[file:react-standards.md]] |

---

## 🚀 実装フロー

```
1. 要件定義
   ↓
2. 設計レビュー（このドキュメント + 各標準を確認）
   ↓
3. 実装開始
   ├─ Terraform コード → terraform-standards.md を参照
   ├─ Lambda 関数 → lambda-standards.md を参照
   ├─ React コンポーネント → react-standards.md を参照
   └─ 全体プロセス → engineering-standards.md を参照
   ↓
4. テスト・デプロイ
```

---

## 📚 参考資料

- #[[file:terraform-standards.md]] - Terraform 実装ルール
- #[[file:lambda-standards.md]] - Lambda 実装ルール
- #[[file:react-standards.md]] - React 実装ルール
- #[[file:engineering-standards.md]] - 開発プロセス全体

---

**最終更新**: 2026年5月30日

**役割**: AWS プロジェクト標準のハブ・プラットフォーム
