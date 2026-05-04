# 開発タスクリスト — 家計管理アプリ

> AI が迷わず実行できるよう、各ステップを具体的なコマンド・ファイル単位で記述しています。  
> 上から順に実行してください。

---

## STEP 1: プロジェクト初期セットアップ

- [x] リポジトリルートに `terraform/`、`backend/`、`frontend/` ディレクトリを作成する
- [x] `backend/package.json` を作成し、依存パッケージ（`@aws-sdk/client-dynamodb`、`@aws-sdk/lib-dynamodb`、`esbuild`、`typescript`）を定義する
- [x] `backend/tsconfig.json` を作成する（`target: ES2022`、`module: NodeNext`）
- [x] `frontend/` に Vite + React + TypeScript テンプレートを生成する（`npm create vite@latest`）
- [x] `frontend/` に Tailwind CSS、React Query、React Hook Form、Zod を追加インストールする
- [x] `frontend/tailwind.config.js` と `frontend/postcss.config.js` を設定する（Vite テンプレート生成後に手動作成）
- [x] ルートに `.gitignore` を作成し、`node_modules/`、`.terraform/`、`*.tfstate*`、`.env` を除外する

---

## STEP 2: Terraform — 基盤リソース (S3 + CloudFront)

- [x] `terraform/main.tf` に `terraform` ブロックと `provider "aws"` を記述する（`region = "ap-northeast-1"`）
- [ ] `terraform/variables.tf` にプロジェクト名・環境変数を定義する
- [x] `terraform/modules/s3/main.tf` を作成し、以下を定義する（main.tf に統合）
  - [x] フロントエンド静的ホスティング用 S3 バケット（パブリックアクセスブロック有効）
  - [x] CSV 一時保存用 S3 バケット（ライフサイクルルール: 7日で自動削除）
- [x] CloudFront ディストリビューションを定義する（OAC 使用）
- [x] CloudFront URL と S3 バケット名を terraform/main.tf に output として記述
- [ ] `terraform init` → `terraform validate` → `terraform plan` を実行して構文を確認する
  - **⚠️ 注記**: terraform コマンドが「認識されない」エラーが発生しました。システムに Terraform がインストールされていません。インストール完了後に実行してください。

---

## STEP 3: Terraform — DynamoDB + Cognito

- [ ] `terraform/modules/dynamodb/main.tf` を作成し、`KakeiTable` を定義する
  - [ ] `PK`（HASH）、`SK`（RANGE）を `String` 型で設定する
  - [ ] `billing_mode = "PAY_PER_REQUEST"` で無料枠に収める設定にする
  - [ ] `point_in_time_recovery` を有効にする
- [ ] `terraform/modules/cognito/main.tf` を作成し、Cognito User Pool を定義する
  - [ ] メール検証を必須にする
  - [ ] パスワードポリシーを設定する（最小8文字・大小英数字記号）
  - [ ] Cognito User Pool Client（SPA 用、シークレットなし）を作成する
- [ ] `terraform/outputs.tf` に User Pool ID、Client ID を追加出力する
- [ ] `terraform plan` を実行して差分を確認する

---

## STEP 4: Terraform — Lambda + API Gateway

- [ ] `terraform/modules/lambda/main.tf` を作成し、以下の Lambda 関数を定義する
  - [ ] `kakei-transactions`（ハンドラ: `dist/handlers/transactions.handler`）
  - [ ] `kakei-categories`（ハンドラ: `dist/handlers/categories.handler`）
  - [ ] `kakei-csv-import`（ハンドラ: `dist/handlers/csv-import.handler`）
- [ ] 各 Lambda に IAM ロールを定義する（DynamoDB 対象テーブルのみの最小権限）
- [ ] `terraform/modules/api_gateway/main.tf` を作成し、REST API を定義する
  - [ ] Cognito Authorizer を設定する
  - [ ] 全エンドポイント（`/transactions`、`/categories`、`/csv/upload-url`）を定義する
  - [ ] CORS 設定を追加する（フロントエンドドメインのみ許可）
- [ ] `terraform apply` を実行してすべての AWS リソースをデプロイする
- [ ] `terraform output` で各エンドポイント URL・ID を確認する

---

## STEP 5: バックエンド実装 — 共通ライブラリ + 型定義

- [ ] `backend/src/types/index.ts` を作成し、`Transaction`・`Category` 型を定義する
- [ ] `backend/src/lib/dynamo.ts` を作成し、DynamoDB クライアントとヘルパー関数（`put`・`query`・`update`・`delete`）を実装する
- [ ] `backend/src/lib/response.ts` を作成し、CORS ヘッダー付きレスポンスヘルパーを実装する
- [ ] `backend/src/lib/auth.ts` を作成し、JWT からユーザー ID を取得するヘルパーを実装する
- [ ] `backend/package.json` の `build` スクリプトに `esbuild` コマンドを追加する（`--bundle --platform=node --target=node20`）

---

## STEP 6: バックエンド実装 — Lambda ハンドラ

- [ ] `backend/src/handlers/transactions.ts` を実装する
  - [ ] `GET /transactions`：ユーザー収支一覧取得（Query + フィルタ）
  - [ ] `POST /transactions`：収支登録（UUID 生成・バリデーション）
  - [ ] `PUT /transactions/{id}`：収支更新
  - [ ] `DELETE /transactions/{id}`：収支削除
- [ ] `backend/src/handlers/categories.ts` を実装する
  - [ ] `GET /categories`：カテゴリ一覧取得
  - [ ] `POST /categories`：カテゴリ登録
- [ ] `backend/src/handlers/csv-import.ts` を実装する
  - [ ] `POST /csv/upload-url`：S3 Presigned URL 発行
  - [ ] S3 イベントトリガーで CSV をパース → DynamoDB に一括書き込み
- [ ] `npm run build` を実行してビルドエラーがないことを確認する
- [ ] ビルド成果物（`dist/`）を Lambda へデプロイする（`terraform apply` または AWS CLI）

---

## STEP 7: フロントエンド実装 — 認証画面

- [ ] `frontend/src/api/auth.ts` を作成し、Cognito の認証関数（サインアップ・ログイン・ログアウト・パスワードリセット）を実装する
- [ ] `frontend/src/hooks/useAuth.ts` を作成し、認証状態管理カスタムフックを実装する
- [ ] `frontend/src/pages/LoginPage.tsx` を実装する（React Hook Form + Zod バリデーション）
- [ ] `frontend/src/pages/SignupPage.tsx` を実装する（確認コード入力フロー含む）
- [ ] `frontend/src/components/PrivateRoute.tsx` を作成し、未認証時のリダイレクトを実装する
- [ ] `frontend/src/App.tsx` にルーティング（React Router）を設定する

---

## STEP 8: フロントエンド実装 — 収支機能

- [ ] `frontend/src/api/transactions.ts` を作成し、API 呼び出し関数を実装する（JWT を Authorization ヘッダーに付与）
- [ ] `frontend/src/hooks/useTransactions.ts` を作成し、React Query を使ったデータ取得 / 更新フックを実装する
- [ ] `frontend/src/pages/DashboardPage.tsx` を実装する（月次サマリー・カレンダー表示）
- [ ] `frontend/src/pages/TransactionListPage.tsx` を実装する（一覧・検索・フィルタ）
- [ ] `frontend/src/components/TransactionForm.tsx` を実装する（収支入力フォーム）
- [ ] `frontend/src/components/TransactionCard.tsx` を実装する（収支カード表示）
- [ ] Tailwind CSS でスマホファーストのレスポンシブデザインを適用する

---

## STEP 9: フロントエンド実装 — CSV インポート + 仕上げ

- [ ] `frontend/src/api/csv.ts` を作成し、Presigned URL 取得 → S3 へファイルアップロードする関数を実装する
- [ ] `frontend/src/pages/CsvImportPage.tsx` を実装する（ファイル選択・アップロード進捗表示）
- [ ] `frontend/src/pages/CategoryPage.tsx` を実装する（カテゴリ管理）
- [ ] `frontend/src/components/BottomNavigation.tsx` を実装する（スマホ向けナビゲーション）
- [ ] `frontend/src/components/ErrorBoundary.tsx` を実装する
- [ ] `frontend/.env.production` に API Gateway URL・Cognito パラメータを設定する
- [ ] `npm run build` でプロダクションビルドを生成する

---

## STEP 10: デプロイ・動作確認・後片付け

- [ ] `aws s3 sync frontend/dist/ s3://<bucket-name> --delete` でフロントエンドを S3 にデプロイする
- [ ] CloudFront キャッシュを無効化する（`aws cloudfront create-invalidation --paths "/*"`）
- [ ] CloudFront URL にブラウザでアクセスし、ログイン → 収支入力 → 一覧表示の E2E フローを確認する
- [ ] CSV ファイルをアップロードし、DynamoDB にデータが取り込まれることを確認する
- [ ] AWS コンソールで Lambda のエラーログ（CloudWatch Logs）を確認する
- [ ] `terraform output` で出力値をまとめて `docs/endpoints.md` に記録する
- [ ] 不要なリソースを削除する場合は `terraform destroy` を実行する
- [ ] README.md をルートに作成し、セットアップ手順・アーキテクチャ概要を記述する

---

## 進捗サマリー

| STEP | タイトル | 状態 |
|------|----------|------|
| 1 | プロジェクト初期セットアップ | ✅ 完了 |
| 2 | Terraform — S3 + CloudFront | ⏳ 部分完了（Terraform コマンドインストール待ち） |
| 3 | Terraform — DynamoDB + Cognito | ⬜ 未着手 |
| 4 | Terraform — Lambda + API Gateway | ⬜ 未着手 |
| 5 | バックエンド共通ライブラリ | ⬜ 未着手 |
| 6 | バックエンド Lambda ハンドラ | ⬜ 未着手 |
| 7 | フロントエンド 認証画面 | ⬜ 未着手 |
| 8 | フロントエンド 収支機能 | ⬜ 未着手 |
| 9 | フロントエンド CSV + 仕上げ | ⬜ 未着手 |
| 10 | デプロイ・動作確認 | ⬜ 未着手 |
