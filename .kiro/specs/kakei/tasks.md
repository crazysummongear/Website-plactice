# kakei — 実装タスクリスト

**プロジェクト名**: kakei（家計管理アプリ）  
**作成日**: 2026年5月4日

---

## タスク形式の説明

- `- [ ]` = 未着手
- `- [x]` = 完了
- `- [-]` = 進行中
- `- [~]` = キュー中
- `*` または `\*` = オプションタスク（実装不要な場合あり）

---

## PHASE 1: MVP（3ヶ月）

### STEP 1: AWS 認証設定

- [x] 1.1 AWS Identity Center を有効化
  - [x] 1.1.1 Root ユーザーでコンソールにログイン
  - [x] 1.1.2 IAM Identity Center を開く
  - [x] 1.1.3 有効化ボタンをクリック
  - [x] 1.1.4 ユーザーを追加（メールアドレス設定）
  - [x] 1.1.5 権限セット「Admin-Permission」を作成
  - [x] 1.1.6 ユーザーに権限を割り当て
  - [x] 1.1.7 SSO 開始 URL をメモ

- [x] 1.2 AWS CLI SSO プロファイルを設定
  - [x] 1.2.1 `aws configure sso --profile dev` を実行
  - [x] 1.2.2 SSO 開始 URL を入力
  - [x] 1.2.3 リージョンを `ap-northeast-1` に設定
  - [x] 1.2.4 プロファイル名を `dev` に設定

- [x] 1.3 認証を確認
  - [x] 1.3.1 `aws sso login --profile dev` を実行
  - [x] 1.3.2 `aws sts get-caller-identity --profile dev` で疎通確認

**完了条件**: `aws sts get-caller-identity --profile dev` が正常に返る ✅ 完了

---

### STEP 2: Terraform — インフラ基盤

- [x] 2.0 Terraform モジュール構造の作成
  - [x] 2.0.1 `terraform/modules/` ディレクトリを作成
  - [x] 2.0.2 各サービス用サブディレクトリを作成（s3, cloudfront, cognito, dynamodb, lambda, api_gateway）
  - [x] 2.0.3 S3モジュール・CloudFrontモジュールを実装
  - [x] 2.0.4 `terraform/outputs.tf` を作成

- [x] 2.1 Terraform 初期化
  - [x] 2.1.1 `terraform init` を実行
  - [x] 2.1.2 `.terraform.lock.hcl` が生成されることを確認

- [x] 2.2 S3 バケット定義
  - [x] 2.2.1 フロントエンド用 S3 バケットを定義
  - [x] 2.2.2 CSV 一時保存用 S3 バケットを定義
  - [x] 2.2.3 バージョニング・暗号化・パブリックアクセスブロックを設定
  - [x] 2.2.4 S3 ライフサイクルポリシーを設定（CSV用：7日後削除）

- [x] 2.3 CloudFront ディストリビューション定義
  - [x] 2.3.1 OAC（Origin Access Control）を設定
  - [x] 2.3.2 S3 をオリジンとして設定
  - [x] 2.3.3 キャッシュポリシーを設定
  - [x] 2.3.4 HTTPS 強制設定
  - [x] 2.3.5 SPA対応（404/403 → index.html）

- [x] 2.4 Terraform 検証・デプロイ
  - [x] 2.4.1 `terraform validate` を実行
  - [x] 2.4.2 `terraform plan` で差分を確認
  - [x] 2.4.3 `terraform apply` でリソースを作成（12リソース作成完了）
  - [x] 2.4.4 CloudFront URL を確認

**完了条件**: CloudFront URL にアクセスして 403 エラーが返る（フロントエンド未デプロイのため） ✅ 完了

**作成されたリソース**:
- フロントエンド用S3バケット: `kakei-frontend-dev-839706991336`
- CSV一時保存用S3バケット: `kakei-csv-temp-dev-839706991336`
- CloudFront ディストリビューション: `E2LK33Q7R6I7R5`
- CloudFront URL: `https://drwpbnzy3pzzt.cloudfront.net`

---

### STEP 3: Terraform — DynamoDB + Cognito

- [ ] 3.1 DynamoDB テーブル定義
  - [ ] 3.1.1 `KakeiTable` を定義（PK: USER#userId、SK: TX#date#txId）
  - [ ] 3.1.2 `billing_mode = "PAY_PER_REQUEST"` を設定
  - [ ] 3.1.3 Point-in-Time Recovery を無効化（コスト削減）
  - [ ] 3.1.4* GSI（type-date-index）を定義（コスト削減のため実装しない）

- [ ] 3.2 Cognito User Pool 定義
  - [ ] 3.2.1 User Pool を作成
  - [ ] 3.2.2 メール検証を必須に設定
  - [ ] 3.2.3 パスワードポリシーを設定（最小12文字）
  - [ ] 3.2.4 User Pool Client（SPA 用、シークレットなし）を作成
  - [ ] 3.2.5 Callback URL を設定（localhost:5173）

- [ ] 3.3 Terraform 検証・デプロイ
  - [ ] 3.3.1 `terraform validate` を実行
  - [ ] 3.3.2 `terraform plan` で差分を確認
  - [ ] 3.3.3 `terraform apply` でリソースを作成
  - [ ] 3.3.4 User Pool ID・Client ID を確認

**完了条件**: DynamoDB テーブル・Cognito User Pool が AWS コンソールで確認できる

---

### STEP 4: Terraform — Lambda + API Gateway

- [ ] 4.1 Lambda IAM ロール定義
  - [ ] 4.1.1 Lambda 実行ロールを作成
  - [ ] 4.1.2 DynamoDB テーブルへのアクセス権限を付与（最小権限）
  - [ ] 4.1.3 S3 バケットへのアクセス権限を付与

- [ ] 4.2 Lambda 関数定義
  - [ ] 4.2.1 `kakei-transactions` 関数を定義
  - [ ] 4.2.2 `kakei-categories` 関数を定義
  - [ ] 4.2.3 `kakei-csv-import` 関数を定義
  - [ ] 4.2.4 環境変数（TABLE_NAME、BUCKET_NAME）を設定
  - [ ] 4.2.5 メモリを128MB、タイムアウトを10秒に設定（コスト最適化）

- [ ] 4.3 API Gateway 定義
  - [ ] 4.3.1 REST API を作成
  - [ ] 4.3.2 Cognito Authorizer を設定
  - [ ] 4.3.3 `/transactions` リソースを定義（GET、POST、PUT、DELETE）
  - [ ] 4.3.4 `/categories` リソースを定義（GET、POST）
  - [ ] 4.3.5 `/csv/upload-url` リソースを定義（POST）
  - [ ] 4.3.6 CORS を設定（フロントエンドドメイン許可）

- [ ] 4.4 Terraform 検証・デプロイ
  - [ ] 4.4.1 `terraform validate` を実行
  - [ ] 4.4.2 `terraform plan` で差分を確認
  - [ ] 4.4.3 `terraform apply` でリソースを作成
  - [ ] 4.4.4 API Gateway URL を確認

**完了条件**: API Gateway エンドポイントが AWS コンソールで確認できる

---

### STEP 5: バックエンド実装 — 共通ライブラリ

- [ ] 5.1 型定義ファイル作成
  - [ ] 5.1.1 `backend/src/types/index.ts` を作成
  - [ ] 5.1.2 `Transaction` 型を定義
  - [ ] 5.1.3 `Category` 型を定義
  - [ ] 5.1.4 `ApiResponse` 型を定義

- [ ] 5.2 DynamoDB ヘルパー実装
  - [ ] 5.2.1 `backend/src/lib/dynamo.ts` を作成
  - [ ] 5.2.2 DynamoDB クライアントを初期化
  - [ ] 5.2.3 `put()` メソッドを実装
  - [ ] 5.2.4 `query()` メソッドを実装
  - [ ] 5.2.5 `update()` メソッドを実装
  - [ ] 5.2.6 `delete()` メソッドを実装

- [ ] 5.3 レスポンスヘルパー実装
  - [ ] 5.3.1 `backend/src/lib/response.ts` を作成
  - [ ] 5.3.2 `successResponse()` 関数を実装
  - [ ] 5.3.3 `errorResponse()` 関数を実装
  - [ ] 5.3.4 CORS ヘッダーを設定

- [ ] 5.4 認証ヘルパー実装
  - [ ] 5.4.1 `backend/src/lib/auth.ts` を作成
  - [ ] 5.4.2 `getUserId()` 関数を実装
  - [ ] 5.4.3 JWT トークン検証ロジックを実装

**完了条件**: `npm run build` でビルドエラーなし

---

### STEP 6: バックエンド実装 — Lambda ハンドラ

- [ ] 6.1 transactions ハンドラ実装
  - [ ] 6.1.1 `backend/src/handlers/transactions.ts` を作成
  - [ ] 6.1.2 `GET /transactions` を実装（フィルタ機能付き）
  - [ ] 6.1.3 `POST /transactions` を実装（UUID 生成・バリデーション）
  - [ ] 6.1.4 `PUT /transactions/{id}` を実装
  - [ ] 6.1.5 `DELETE /transactions/{id}` を実装

- [ ] 6.2 categories ハンドラ実装
  - [ ] 6.2.1 `backend/src/handlers/categories.ts` を作成
  - [ ] 6.2.2 `GET /categories` を実装
  - [ ] 6.2.3 `POST /categories` を実装

- [ ] 6.3 csv-import ハンドラ実装
  - [ ] 6.3.1 `backend/src/handlers/csv-import.ts` を作成
  - [ ] 6.3.2 `POST /csv/upload-url` を実装（Presigned URL 発行）
  - [ ] 6.3.3 S3 イベントトリガーハンドラを実装
  - [ ] 6.3.4 CSV パース・DynamoDB 保存ロジックを実装

- [ ] 6.4 ビルド・デプロイ
  - [ ] 6.4.1 `npm run build` を実行
  - [ ] 6.4.2 ビルド成果物（`dist/`）を確認
  - [ ] 6.4.3 `terraform apply` で Lambda をデプロイ

**完了条件**: `npm run build` でビルドエラーなし、Lambda が AWS コンソールで確認できる

---

### STEP 7: フロントエンド実装 — 認証

- [ ] 7.1 Cognito 認証関数実装
  - [ ] 7.1.1 `frontend/src/api/auth.ts` を作成
  - [ ] 7.1.2 `signUp()` 関数を実装
  - [ ] 7.1.3 `confirmSignUp()` 関数を実装
  - [ ] 7.1.4 `signIn()` 関数を実装
  - [ ] 7.1.5 `signOut()` 関数を実装
  - [ ] 7.1.6 `resetPassword()` 関数を実装

- [ ] 7.2 認証状態管理フック実装
  - [ ] 7.2.1 `frontend/src/hooks/useAuth.ts` を作成
  - [ ] 7.2.2 認証状態（isAuthenticated、user、idToken）を管理
  - [ ] 7.2.3 ローカルストレージにトークンを保存

- [ ] 7.3 ログイン画面実装
  - [ ] 7.3.1 `frontend/src/pages/LoginPage.tsx` を実装
  - [ ] 7.3.2 React Hook Form + Zod でバリデーション
  - [ ] 7.3.3 エラーメッセージ表示
  - [ ] 7.3.4 サインアップリンク追加

- [ ] 7.4 サインアップ画面実装
  - [ ] 7.4.1 `frontend/src/pages/SignupPage.tsx` を実装
  - [ ] 7.4.2 メール検証コード入力フロー
  - [ ] 7.4.3 パスワード確認フィールド

- [ ] 7.5 認証ガード実装
  - [ ] 7.5.1 `frontend/src/components/PrivateRoute.tsx` を作成
  - [ ] 7.5.2 未認証時のリダイレクト処理

- [ ] 7.6 ルーティング設定
  - [ ] 7.6.1 `frontend/src/App.tsx` に React Router を統合
  - [ ] 7.6.2 ルート定義（/login、/signup、/dashboard など）

**完了条件**: `npm run build` でビルドエラーなし、ログイン画面が表示される

---

### STEP 8: フロントエンド実装 — 収支機能

- [ ] 8.1 API 呼び出し関数実装
  - [ ] 8.1.1 `frontend/src/api/transactions.ts` を作成
  - [ ] 8.1.2 `getTransactions()` 関数を実装
  - [ ] 8.1.3 `createTransaction()` 関数を実装
  - [ ] 8.1.4 `updateTransaction()` 関数を実装
  - [ ] 8.1.5 `deleteTransaction()` 関数を実装
  - [ ] 8.1.6 JWT を Authorization ヘッダーに付与

- [ ] 8.2 React Query フック実装
  - [ ] 8.2.1 `frontend/src/hooks/useTransactions.ts` を作成
  - [ ] 8.2.2 `useQuery()` でデータ取得
  - [ ] 8.2.3 `useMutation()` でデータ更新
  - [ ] 8.2.4 キャッシング・同期ロジック

- [ ] 8.3 ダッシュボード実装
  - [ ] 8.3.1 `frontend/src/pages/DashboardPage.tsx` を実装
  - [ ] 8.3.2 月別サマリーカード（収入・支出・残高）
  - [ ] 8.3.3 カテゴリ別円グラフ
  - [ ] 8.3.4 月別推移折れ線グラフ

- [ ] 8.4 収支一覧ページ実装
  - [ ] 8.4.1 `frontend/src/pages/TransactionListPage.tsx` を実装
  - [ ] 8.4.2 収支一覧表示
  - [ ] 8.4.3 期間・カテゴリフィルタ
  - [ ] 8.4.4 検索機能

- [ ] 8.5 収支入力フォーム実装
  - [ ] 8.5.1 `frontend/src/components/TransactionForm.tsx` を実装
  - [ ] 8.5.2 React Hook Form + Zod バリデーション
  - [ ] 8.5.3 日付・カテゴリ・金額・メモ入力フィールド
  - [ ] 8.5.4 収入/支出ラジオボタン

- [ ] 8.6 収支カード実装
  - [ ] 8.6.1 `frontend/src/components/TransactionCard.tsx` を実装
  - [ ] 8.6.2 収支情報表示（日付・カテゴリ・金額・メモ）
  - [ ] 8.6.3 編集・削除ボタン

- [ ] 8.7 Tailwind CSS スタイリング
  - [ ] 8.7.1 スマホファーストのレスポンシブデザイン
  - [ ] 8.7.2 ダークモード対応（オプション）

**完了条件**: `npm run build` でビルドエラーなし、ダッシュボードが表示される

---

### STEP 9: フロントエンド実装 — CSV インポート

- [ ] 9.1 CSV API 関数実装
  - [ ] 9.1.1 `frontend/src/api/csv.ts` を作成
  - [ ] 9.1.2 `getPresignedUrl()` 関数を実装
  - [ ] 9.1.3 `uploadCsvToS3()` 関数を実装

- [ ] 9.2 CSV インポートページ実装
  - [ ] 9.2.1 `frontend/src/pages/CsvImportPage.tsx` を実装
  - [ ] 9.2.2 ファイル選択フィールド
  - [ ] 9.2.3 アップロード進捗表示
  - [ ] 9.2.4 成功・エラーメッセージ

- [ ] 9.3 CSV プレビュー実装
  - [ ] 9.3.1 `frontend/src/components/CsvPreview.tsx` を実装
  - [ ] 9.3.2 CSV データプレビュー表示

- [ ] 9.4 カラムマッピング実装
  - [ ] 9.4.1 `frontend/src/components/ColumnMapper.tsx` を実装
  - [ ] 9.4.2 CSV カラムを収支フィールドにマッピング

- [ ] 9.5 カテゴリ管理ページ実装
  - [ ] 9.5.1 `frontend/src/pages/CategoryPage.tsx` を実装
  - [ ] 9.5.2 カテゴリ一覧表示
  - [ ] 9.5.3 カテゴリ追加フォーム

- [ ] 9.6 ボトムナビゲーション実装
  - [ ] 9.6.1 `frontend/src/components/BottomNavigation.tsx` を実装
  - [ ] 9.6.2 スマホ向けナビゲーション（ダッシュボード・一覧・インポート・カテゴリ）

- [ ] 9.7 エラーバウンダリ実装
  - [ ] 9.7.1 `frontend/src/components/ErrorBoundary.tsx` を実装
  - [ ] 9.7.2 エラーハンドリング・フォールバック UI

**完了条件**: `npm run build` でビルドエラーなし

---

### STEP 10: デプロイ・動作確認

- [ ] 10.1 フロントエンドビルド・デプロイ
  - [ ] 10.1.1 `npm run build` でプロダクションビルド生成
  - [ ] 10.1.2 `aws s3 sync frontend/dist/ s3://<bucket-name> --delete` で S3 にデプロイ
  - [ ] 10.1.3 CloudFront キャッシュを無効化

- [ ] 10.2 E2E テスト
  - [ ] 10.2.1 CloudFront URL にアクセス
  - [ ] 10.2.2 サインアップ → メール検証 → ログイン フロー確認
  - [ ] 10.2.3 収支入力 → 一覧表示 フロー確認
  - [ ] 10.2.4 CSV インポート フロー確認
  - [ ] 10.2.5 ダッシュボード表示確認

- [ ] 10.3 ログ・モニタリング確認
  - [ ] 10.3.1 CloudWatch Logs で Lambda ログ確認
  - [ ] 10.3.2 API Gateway ログ確認
  - [ ] 10.3.3 エラーがないことを確認

- [ ] 10.4 ドキュメント作成
  - [ ] 10.4.1 `docs/endpoints.md` に API エンドポイント・URL をまとめる
  - [ ] 10.4.2 `README.md` をルートに作成（セットアップ手順・アーキテクチャ概要）
  - [ ] 10.4.3 `docs/deployment.md` にデプロイ手順をまとめる

- [ ] 10.5 クリーンアップ
  - [ ] 10.5.1 不要なローカルファイルを削除
  - [ ] 10.5.2 Git コミット・プッシュ

**完了条件**: CloudFront URL でアプリが正常に動作する

---

## PHASE 2: 機能拡張（6ヶ月）

### STEP 11: 予算管理・アラート

- [ ] 11.1 予算設定機能
- [ ] 11.2 支出アラート
- [ ] 11.3 予算進捗表示

### STEP 12: カテゴリ別分析

- [ ] 12.1 詳細分析ページ
- [ ] 12.2 カテゴリ別グラフ
- [ ] 12.3 支出トレンド分析

### STEP 13: 家族共有機能

- [ ] 13.1 ユーザー招待機能
- [ ] 13.2 権限管理
- [ ] 13.3 共有収支表示

---

## PHASE 3: 本格運用（12ヶ月）

### STEP 14: モバイルアプリ化

- [ ] 14.1 React Native 移行
- [ ] 14.2 iOS ビルド
- [ ] 14.3 Android ビルド

### STEP 15: AI 機能

- [ ] 15.1 支出予測モデル
- [ ] 15.2 カテゴリ自動分類
- [ ] 15.3 節約提案

### STEP 16: 資産管理機能

- [ ] 16.1 投資ポートフォリオ管理
- [ ] 16.2 資産推移グラフ
- [ ] 16.3 FIRE シミュレーション

---

## 進捗サマリー

| PHASE | STEP | タイトル | 状態 |
|-------|------|----------|------|
| 1 | 1 | AWS 認証設定 | ✅ 完了 |
| 1 | 2 | Terraform — インフラ基盤 | ✅ 完了 |
| 1 | 3 | Terraform — DynamoDB + Cognito | ⬜ 未着手 |
| 1 | 4 | Terraform — Lambda + API Gateway | ⬜ 未着手 |
| 1 | 5 | バックエンド — 共通ライブラリ | ⬜ 未着手 |
| 1 | 6 | バックエンド — Lambda ハンドラ | ⬜ 未着手 |
| 1 | 7 | フロントエンド — 認証 | ⬜ 未着手 |
| 1 | 8 | フロントエンド — 収支機能 | ⬜ 未着手 |
| 1 | 9 | フロントエンド — CSV インポート | ⬜ 未着手 |
| 1 | 10 | デプロイ・動作確認 | ⬜ 未着手 |

**全体完了度**: 約 **30%**

**📦 STEP 2で作成されたリソース**:
- フロントエンド用S3バケット: `kakei-frontend-dev-839706991336`
- CSV一時保存用S3バケット: `kakei-csv-temp-dev-839706991336`
- CloudFront ディストリビューション: `E2LK33Q7R6I7R5`
- CloudFront URL: `https://drwpbnzy3pzzt.cloudfront.net`

**💰 コスト最適化方針**:
- 月額目標: $5 以内（個人学習・個人利用）
- DynamoDB: GSI不使用、PITR無効化
- Lambda: メモリ128MB、タイムアウト10秒
- CloudFront: PriceClass_100（北米・ヨーロッパのみ）

---

**最終更新**: 2026年5月6日（コスト最適化方針を反映）
