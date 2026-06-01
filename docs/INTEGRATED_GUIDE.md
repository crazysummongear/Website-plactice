# 統合ガイド - kakei プロジェクト完全マニュアル

**プロジェクト名**: kakei（家計管理アプリ）  
**作成日**: 2026年5月30日  
**目的**: すべてのドキュメントを統合し、開発者が必要な情報をワンストップで得られるようにする

---

## 📚 このガイドについて

このドキュメントは、kakei プロジェクトの **23個のドキュメント** を統合した、**完全なマニュアル** です。

### 対象者

- 新規開発者
- プロジェクトマネージャー
- アーキテクト
- QA・テスト担当者
- デプロイ・運用担当者

### 読む時間

- **クイック版**: 30分（セクション 1-3）
- **標準版**: 2時間（セクション 1-6）
- **完全版**: 4時間（全セクション）

---

## 🎯 成功の方程式

```
成功 = 明確な要件 × 充実したドキュメント × テスト戦略 × シンプル設計
```

このガイドは、この方程式の各要素を実装するための、実践的なマニュアルです。

---

## 📖 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [アーキテクチャ](#2-アーキテクチャ)
3. [開発環境セットアップ](#3-開発環境セットアップ)
4. [開発フロー](#4-開発フロー)
5. [テスト戦略](#5-テスト戦略)
6. [デプロイメント](#6-デプロイメント)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [ドキュメント一覧](#8-ドキュメント一覧)

---

## 1. プロジェクト概要

### 1.1 プロジェクト目標

**kakei** は、35歳 FIRE 達成を目標とした、個人向け家計管理・資産管理アプリです。

#### MVP（最小実行可能製品）の機能

- ✅ ユーザー認証（メール・パスワード）
- ✅ 収支記録（日付・カテゴリ・金額・メモ）
- ✅ ダッシュボード表示（月別サマリー、カテゴリ別内訳）
- ✅ CSV インポート
- ✅ カテゴリ管理

#### 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| **フロントエンド** | React + TypeScript | 18.x |
| **バックエンド** | Lambda + Node.js | 18.x |
| **データベース** | DynamoDB | - |
| **認証** | Cognito（Mock Mode） | - |
| **インフラ** | AWS + Terraform | 1.5+ |
| **テスト** | Vitest + Playwright | 1.0+, 1.40+ |

### 1.2 プロジェクト進捗

| カテゴリ | 完了度 | 状態 |
|---------|--------|------|
| インフラ | 100% | ✅ 完了 |
| バックエンド | 60% | ⏳ 進行中 |
| フロントエンド | 75% | ⏳ 進行中 |
| テスト | 60% | ⏳ 進行中 |
| ドキュメント | 95% | ✅ 充実 |
| **全体** | **70%** | ✅ 順調 |

### 1.3 成功指標

| 指標 | 目標 | 達成度 |
|------|------|--------|
| プロジェクト完了度 | 70% | ✅ 70% |
| テスト完了度 | 60% | ✅ 60% |
| ドキュメント完了度 | 90% | ✅ 95% |
| コスト削減 | $5/月 | ✅ 達成 |

---

## 2. アーキテクチャ

### 2.1 システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    ユーザー                              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────┐          ┌──────▼──────┐
   │ Desktop  │          │   Mobile    │
   │ Browser  │          │   Browser   │
   └────┬─────┘          └──────┬──────┘
        │                       │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │   CloudFront (CDN)    │
        │  https://drwpbnzy...  │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │   S3 (Static Files)   │
        │  kakei-frontend-dev   │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────────────┐
        │   React Application           │
        │  - LoginPage                  │
        │  - DashboardPage              │
        │  - TransactionListPage        │
        │  - CsvImportPage              │
        └───────────┬───────────────────┘
                    │
        ┌───────────▼──────────────────────┐
        │   API Gateway                    │
        │  https://8uugz9nauk.execute...   │
        └───────────┬──────────────────────┘
                    │
        ┌───────────┴──────────────────┐
        │                              │
   ┌────▼──────────┐         ┌────────▼────────┐
   │ Lambda Funcs  │         │  Cognito        │
   │ - transactions│         │  User Pool      │
   │ - categories  │         │  ap-northeast-1 │
   │ - csv-import  │         │  _CVGCgVANa     │
   └────┬──────────┘         └────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   DynamoDB                  │
        │   KakeiTable                │
        │   PK: USER#userId           │
        │   SK: TX#date#txId          │
        └─────────────────────────────┘
```

### 2.2 データモデル

#### User テーブル

```
PK: USER#{userId}
SK: PROFILE

{
  userId: string,
  email: string,
  createdAt: string,
  updatedAt: string
}
```

#### Transaction テーブル

```
PK: USER#{userId}
SK: TX#{date}#{txId}

{
  id: string,
  userId: string,
  date: string (YYYY-MM-DD),
  category: string,
  amount: number,
  incomeExpense: "INCOME" | "EXPENSE",
  memo: string,
  createdAt: string,
  updatedAt: string
}
```

### 2.3 API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| POST | /auth/login | ログイン |
| POST | /auth/logout | ログアウト |
| GET | /transactions | 収支一覧取得 |
| POST | /transactions | 収支作成 |
| PUT | /transactions/{id} | 収支更新 |
| DELETE | /transactions/{id} | 収支削除 |
| GET | /categories | カテゴリ一覧取得 |
| POST | /categories | カテゴリ作成 |
| POST | /csv/upload-url | CSV アップロード URL 取得 |

---

## 3. 開発環境セットアップ

### 3.1 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- AWS CLI 2.x 以上
- Terraform 1.5 以上
- Git

### 3.2 セットアップ手順

#### ステップ1: リポジトリクローン

```bash
git clone https://github.com/your-org/kakei.git
cd kakei
```

#### ステップ2: 環境変数設定

```bash
# フロントエンド
cd frontend
cp .env.example .env.local
# .env.local を編集
# VITE_MOCK_AUTH=true
# VITE_API_URL=http://localhost:3000

# バックエンド
cd ../backend
cp .env.example .env
# .env を編集
```

#### ステップ3: 依存関係インストール

```bash
# フロントエンド
cd frontend
npm install

# バックエンド
cd ../backend
npm install
```

#### ステップ4: 開発サーバー起動

```bash
# ターミナル1: フロントエンド
cd frontend
npm run dev
# http://localhost:5173

# ターミナル2: バックエンド（オプション）
cd backend
npm run dev
```

### 3.3 AWS セットアップ

#### ステップ1: AWS SSO ログイン

```bash
aws sso login --profile dev
```

#### ステップ2: Terraform 初期化

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

#### ステップ3: 環境変数確認

```bash
# CloudFront URL
terraform output cloudfront_url

# API Gateway URL
terraform output api_gateway_url

# DynamoDB テーブル名
terraform output dynamodb_table_name
```

---

## 4. 開発フロー

### 4.1 新機能開発の流れ

#### ステップ1: 要件定義

```markdown
## ユーザーストーリー

### US-001: 収支検索機能
**As a** ユーザー
**I want to** 日付範囲で収支を検索したい
**So that** 特定期間の収支を確認できる

#### 受け入れ基準
- [ ] 開始日と終了日を指定できる
- [ ] 指定期間の収支が表示される
- [ ] 検索結果が日付順にソートされている
```

#### ステップ2: ドキュメント作成

```markdown
## 設計ドキュメント

### API エンドポイント
GET /transactions?startDate=2026-05-01&endDate=2026-05-31

### フロントエンド
- TransactionFilterForm コンポーネント
- 日付ピッカー（開始日・終了日）
- 検索ボタン

### テストケース
- 有効な日付範囲で検索
- 無効な日付範囲でエラー表示
- 検索結果が空の場合
```

#### ステップ3: テスト実装

```typescript
// frontend/src/pages/TransactionListPage.test.tsx
describe('TransactionListPage', () => {
  it('should filter transactions by date range', async () => {
    // テスト実装
  });
});
```

#### ステップ4: 実装

```typescript
// frontend/src/components/TransactionFilterForm.tsx
export function TransactionFilterForm() {
  // 実装
}
```

#### ステップ5: テスト実行

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

#### ステップ6: PR 作成・レビュー

```bash
git checkout -b feature/transaction-search
git add .
git commit -m "feat: add transaction search by date range"
git push origin feature/transaction-search
gh pr create
```

### 4.2 コード規約

#### ファイル命名規則

```
コンポーネント: PascalCase.tsx
  LoginPage.tsx
  TransactionForm.tsx

ユーティリティ: camelCase.ts
  formatCurrency.ts
  validateEmail.ts

テスト: {name}.test.ts
  LoginPage.test.tsx
  formatCurrency.test.ts

スタイル: {name}.module.css
  LoginPage.module.css
```

#### コード規約

```typescript
// ✅ 良い例
export function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input data-testid="email-input" {...register('email')} />
      <button data-testid="login-button" type="submit">ログイン</button>
    </form>
  );
}

// ❌ 悪い例
export default function LoginPage() {
  // data-testid がない
  // 複雑なロジック
}
```

---

## 5. テスト戦略

### 5.1 テストピラミッド

```
        /\
       /  \      E2E テスト（10%）
      /────\     Playwright
     /      \    
    /────────\   統合テスト（20%）
   /          \  React Testing Library
  /────────────\ 
 /              \ 単体テスト（70%）
/────────────────\ Vitest
```

### 5.2 テスト実行

```bash
# 単体テスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2E テスト
npm run test:e2e

# 全テスト
npm run test

# カバレッジ
npm run test:coverage
```

### 5.3 data-testid 命名規則

```typescript
// ボタン
data-testid="login-button"
data-testid="submit-button"

// 入力フィールド
data-testid="email-input"
data-testid="password-input"

// エラーメッセージ
data-testid="email-error"
data-testid="password-error"

// ナビゲーション
data-testid="dashboard-nav-link"
data-testid="transactions-nav-link"

// カード
data-testid="income-card"
data-testid="expense-card"
```

---

## 6. デプロイメント

### 6.1 フロントエンドデプロイ

```bash
# ビルド
cd frontend
npm run build

# S3 にアップロード
aws s3 sync dist/ s3://kakei-frontend-dev-839706991336 --delete --profile dev

# CloudFront キャッシュ無効化
aws cloudfront create-invalidation \
  --distribution-id E2LK33Q7R6I7R5 \
  --paths "/*" \
  --profile dev
```

### 6.2 バックエンドデプロイ

```bash
# ビルド
cd backend
npm run build

# Lambda にデプロイ
terraform apply -target=aws_lambda_function.transactions --profile dev
```

### 6.3 デプロイチェックリスト

- [ ] 全テストが成功している
- [ ] ビルドエラーがない
- [ ] ドキュメントが更新されている
- [ ] 環境変数が正しく設定されている
- [ ] CloudFront キャッシュが無効化されている
- [ ] 本番環境で動作確認

---

## 7. トラブルシューティング

### 7.1 よくある問題

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| テストがタイムアウト | ナビゲーション遅延 | `Promise.all()` で click と waitForURL を同時実行 |
| 要素が見つからない | セレクタが不安定 | `data-testid` 属性を使用 |
| Mock Mode が効かない | 環境変数未設定 | `.env.local` に `VITE_MOCK_AUTH=true` を設定 |
| Playwright ブラウザエラー | ブラウザ未インストール | `npx playwright install` を実行 |

### 7.2 デバッグ方法

```bash
# Playwright デバッグモード
npm run test:e2e:debug

# Vitest UI モード
npm run test:unit:ui

# ブラウザ表示
npm run test:e2e -- --headed

# スローモーション
npm run test:e2e -- --slow-mo=1000
```

---

## 8. ドキュメント一覧

### 8.1 全ドキュメント（23ファイル）

#### 基本ドキュメント（6ファイル）

1. **README.md** - プロジェクト概要、セットアップ手順
2. **architecture.md** - システムアーキテクチャ、インフラ構成
3. **design_philosophy.md** - 設計哲学、原則、パターン
4. **development_fundamentals.md** - 開発の基礎、ベストプラクティス
5. **modern_architecture_reference.md** - モダンアーキテクチャ参考資料
6. **repository_policy.md** - リポジトリポリシー、ブランチ戦略

#### 設計・要件ドキュメント（2ファイル）

7. **application_design_checklist.md** - アプリケーション設計チェックリスト
8. **ai_driven_development_guide.md** - AI駆動開発ガイド

#### テストドキュメント（6ファイル）

9. **testing_strategy.md** - テスト戦略全体
10. **testing_tools_and_frameworks.md** - テストツール・フレームワーク詳細
11. **e2e_test_specification.md** - E2Eテスト仕様書
12. **test_design_best_practices.md** - テスト設計ベストプラクティス
13. **unit_test_specification.md** - ユニットテスト仕様書
14. **integration_test_specification.md** - 統合テスト仕様書

#### デプロイ・運用ドキュメント（2ファイル）

15. **deployment_summary.md** - デプロイメント概要
16. **phase3_auto_integration_cost_estimate.md** - Phase 3 コスト見積もり

#### API・エンドポイントドキュメント（1ファイル）

17. **endpoints.md** - API エンドポイント一覧

#### 進捗管理ドキュメント（1ファイル）

18. **current_status_and_next_steps.md** - 現状と次のステップ

#### ドキュメント管理ドキュメント（5ファイル）

19. **DOCUMENTATION_INDEX.md** - ドキュメント総まとめ
20. **DOCUMENTATION_SUMMARY.md** - ドキュメント作成完了サマリー
21. **SUCCESS_EQUATION_GUIDE.md** - 成功の方程式ガイド
22. **INTEGRATED_GUIDE.md** - このファイル（統合ガイド）

### 8.2 ドキュメント検索ガイド

| 目的 | 参照ドキュメント |
|------|-----------------|
| プロジェクト全体を理解したい | README.md, architecture.md |
| 新機能を実装したい | application_design_checklist.md, design_philosophy.md |
| テストを書きたい | testing_tools_and_frameworks.md, e2e_test_specification.md |
| デプロイしたい | deployment_summary.md, endpoints.md |
| AI駆動開発を理解したい | ai_driven_development_guide.md, SUCCESS_EQUATION_GUIDE.md |

---

## 🎯 クイックスタート

### 5分で始める

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/kakei.git
cd kakei

# 2. 環境変数設定
cd frontend
cp .env.example .env.local
echo "VITE_MOCK_AUTH=true" >> .env.local

# 3. 依存関係インストール
npm install

# 4. 開発サーバー起動
npm run dev

# 5. ブラウザで確認
# http://localhost:5173
```

### 30分で理解する

1. **README.md** を読む（5分）
2. **architecture.md** を読む（10分）
3. **development_fundamentals.md** を読む（10分）
4. 開発環境をセットアップ（5分）

### 2時間で習得する

1. **INTEGRATED_GUIDE.md** を読む（30分）
2. **testing_tools_and_frameworks.md** を読む（30分）
3. **application_design_checklist.md** を読む（30分）
4. 簡単な機能を実装してみる（30分）

---

## 📞 サポート

### よくある質問

**Q: どのドキュメントから読み始めればいい？**
A: README.md から始めて、このファイル（INTEGRATED_GUIDE.md）を読むことをお勧めします。

**Q: テストについて学びたい場合は？**
A: testing_tools_and_frameworks.md → e2e_test_specification.md の順で読むことをお勧めします。

**Q: 新機能を実装する場合は？**
A: application_design_checklist.md を確認してから、design_philosophy.md と testing_strategy.md を参照してください。

---

**最終更新**: 2026年5月30日

**推奨対象**: 全開発者、プロジェクトマネージャー

