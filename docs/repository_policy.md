# リポジトリ運用方針

**作成日**: 2026年5月4日  
**最終更新**: 2026年5月4日  
**プロジェクト**: kakei（35歳 FIRE 達成を目標とした個人向け資産管理アプリ）

---

## 目次

1. [ブランチ・コミット運用](#1-ブランチコミット運用)
2. [AWS 秘匿情報の管理方針](#2-aws-秘匿情報の管理方針)
3. [ディレクトリ構造の定義](#3-ディレクトリ構造の定義)
4. [次ステップ：Issue #1 AWS SSO 認証設定](#4-次ステップissue-1-aws-sso-認証設定)

---

## 1. ブランチ・コミット運用

### 1.1 採用戦略：GitHub Flow（個人開発シンプル版）

個人開発かつ長期運用を前提とするため、**シンプルさと追跡可能性**を両立した GitHub Flow を採用します。  
Git Flow のような複雑なブランチ階層は避け、`main` を常にデプロイ可能な状態に保ちます。

#### ブランチ構成

| ブランチ名 | 役割 | 直接コミット |
|-----------|------|------------|
| `main` | 本番・リリース対象。常に動作可能な状態を維持 | ❌ 禁止（PR 必須） |
| `feature/<issue番号>-<概要>` | 機能追加・バグ修正・ドキュメント更新 | ✅ 可 |

> **補足**: `develop` ブランチは廃止します。個人開発では `feature → main` の直接マージで十分です。  
> 複数機能を並行開発する場合も、各 `feature` ブランチを独立させることで競合を最小化します。

#### ブランチ命名規則

```
feature/<issue番号>-<kebab-case-概要>

例:
  feature/1-aws-sso-setup
  feature/3-terraform-dynamodb
  feature/7-login-page-cognito
```

#### 日々の開発フロー

```bash
# 1. main を最新化してから feature ブランチを切る
git checkout main
git pull origin main
git checkout -b feature/1-aws-sso-setup

# 2. 実装・コミット（細かく積む）
git add <変更ファイル>
git commit -m "🔧 config: AWS SSO プロファイル設定を追加"

# 3. リモートにプッシュ
git push -u origin feature/1-aws-sso-setup

# 4. GitHub で Pull Request を作成し、main へマージ

# 5. マージ後、ローカルの feature ブランチを削除
git checkout main
git pull origin main
git branch -d feature/1-aws-sso-setup
```

---

### 1.2 コミットメッセージ規則

#### 形式

```
<絵文字> <タイプ>: <件名（命令形・50文字以内）>

<本文（任意）: 変更の背景・理由を記述>

<フッター（任意）: Closes #<issue番号>、Breaking Change など>
```

#### タイプ一覧

| 絵文字 | タイプ | 用途 |
|--------|--------|------|
| ✨ | `feat` | 新機能追加 |
| 🐛 | `fix` | バグ修正 |
| 📝 | `docs` | ドキュメント作成・更新 |
| 🎨 | `style` | コードフォーマット（動作変更なし） |
| ♻️ | `refactor` | リファクタリング（機能変更なし） |
| ✅ | `test` | テスト追加・修正 |
| 🚀 | `chore` | ビルド・依存関係・CI 設定変更 |
| 🔧 | `config` | Terraform・環境設定ファイル更新 |
| 🔒 | `security` | セキュリティ関連の修正・強化 |
| 💰 | `cost` | コスト最適化・AWS 設定変更 |

#### コミットメッセージ例

```
🔧 config: AWS SSO dev プロファイルを Identity Center で設定

- aws configure sso で dev プロファイルを作成
- sso_start_url / sso_account_id / sso_role_name を設定
- aws sts get-caller-identity で疎通確認済み

Closes #1
```

```
✨ feat: Cognito User Pool を Terraform で定義

- メール検証必須・パスワードポリシー設定（最小12文字）
- SPA 用 User Pool Client（シークレットなし）を追加
- outputs.tf に user_pool_id / client_id を出力

Closes #3
```

---

### 1.3 Pull Request 運用

個人開発のため、PR は**自己レビュー + チェックリスト確認**で完結させます。

#### PR タイトル形式

```
[#<issue番号>] <変更内容の概要>

例: [#1] AWS SSO (Identity Center) 認証設定
```

#### PR マージ前チェックリスト

- [ ] `terraform validate` / `terraform plan` でエラーなし（Terraform 変更時）
- [ ] `npm run build` でビルドエラーなし（フロントエンド変更時）
- [ ] `.gitignore` で秘匿情報が除外されていることを確認
- [ ] `git diff --name-only origin/main` で意図しないファイルが含まれていないことを確認
- [ ] コミットメッセージが規則に従っている

---

## 2. AWS 秘匿情報の管理方針

### 2.1 管理対象と保管場所

| 情報の種類 | 保管場所 | Git 管理 | 備考 |
|-----------|---------|---------|------|
| AWS SSO 認証情報 | `~/.aws/config`（ローカル） | ❌ 除外 | Identity Center 経由で自動更新 |
| AWS アクセスキー（非推奨） | `~/.aws/credentials`（ローカル） | ❌ 除外 | SSO 移行後は使用しない |
| Terraform tfstate | ローカル（開発中）→ S3（本番） | ❌ 除外 | リソース情報・ARN を含む |
| Terraform tfvars | ローカルのみ | ❌ 除外 | 環境固有の値を含む場合 |
| Cognito User Pool ID / Client ID | `frontend/.env.local` | ❌ 除外 | `.env.example` にキー名のみ記載 |
| API Gateway エンドポイント URL | `frontend/.env.local` | ❌ 除外 | 同上 |
| Lambda 環境変数 | Terraform で直接定義 | ✅ 管理 | 値は変数参照にする |

### 2.2 .gitignore 設定（ルート）

現在の `.gitignore` に以下が含まれていることを確認・維持します。

```gitignore
# 環境変数・秘匿情報
.env
.env.local
.env.*.local
*.tfvars
*.tfvars.json

# Terraform 状態ファイル
terraform.tfstate
terraform.tfstate.backup
.terraform/
tfplan

# AWS 認証情報（念のため）
.aws/credentials
.aws/config

# Node.js
node_modules/
dist/

# IDE
.vscode/
.idea/
*.DS_Store
```

### 2.3 tfstate の管理方針

#### 現在（開発フェーズ）
- ローカルバックエンドで管理（`terraform/` ディレクトリ内）
- `terraform.tfstate` と `tfplan` は `.gitignore` で除外済み

#### 本番移行時（STEP 3 以降）
`terraform/backend.tf` のコメントを解除し、S3 バックエンドに移行します。

```hcl
backend "s3" {
  profile        = "dev"
  bucket         = "kakei-terraform-state-<account_id>"
  key            = "kakei/terraform.tfstate"
  region         = "ap-northeast-1"
  encrypt        = true
  dynamodb_table = "kakei-terraform-lock"
}
```

移行手順：
```bash
# 1. S3 バケットと DynamoDB テーブルを先に terraform apply で作成
# 2. backend.tf のコメントを解除
# 3. terraform init -migrate-state を実行
terraform init -migrate-state
```

### 2.4 フロントエンド環境変数の管理

`.env.example` をリポジトリに含め、実際の値は `.env.local` に記載します。

```bash
# frontend/.env.example（Git 管理対象）
VITE_AWS_REGION=ap-northeast-1
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_API_GATEWAY_URL=
```

```bash
# frontend/.env.local（Git 除外）
VITE_AWS_REGION=ap-northeast-1
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

### 2.5 秘匿情報が誤ってコミットされた場合の対応

```bash
# 直前のコミットに含まれていた場合
git rm --cached <ファイルパス>
git commit --amend --no-edit
git push origin <ブランチ名> --force-with-lease

# 複数コミット前の場合（git-filter-repo を使用）
pip install git-filter-repo
git filter-repo --path <ファイルパス> --invert-paths
```

> ⚠️ **重要**: 誤ってプッシュした場合は、該当の AWS 認証情報を**即座にローテーション（無効化・再発行）**してください。  
> Git 履歴から削除しても、プッシュ済みの情報は漏洩したものとして扱います。

---

## 3. ディレクトリ構造の定義

### 3.1 現在の構造（実装済み）

```
kakei/                              # プロジェクトルート
├── .gitignore                      # Git 除外設定
├── docs/                           # 設計・運用ドキュメント
│   ├── system_design.md            # システム設計書
│   ├── aws_design.md               # AWS 権限・構成設計書
│   ├── repository_policy.md        # 本ドキュメント
│   ├── progress_status.md          # 開発進捗レポート
│   └── todo.md                     # 開発タスクリスト
├── terraform/                      # IaC（Terraform）
│   ├── provider.tf                 # AWS プロバイダー設定 ✅
│   ├── backend.tf                  # バックエンド設定（ローカル） ✅
│   ├── variables.tf                # 変数定義 ✅
│   ├── main.tf                     # テスト用 S3 バケット ✅
│   └── .terraform.lock.hcl        # プロバイダーロックファイル ✅
├── backend/                        # Lambda バックエンド（TypeScript）
│   ├── package.json                # 依存関係定義 ✅
│   └── tsconfig.json               # TypeScript 設定 ✅
└── frontend/                       # React フロントエンド（TypeScript）
    ├── src/
    │   ├── App.tsx                 # 認証状態管理 ✅
    │   ├── pages/
    │   │   ├── LoginPage.tsx       # ログイン画面（ダミー認証） ✅
    │   │   └── Dashboard.tsx       # ダッシュボード雛形 ✅
    │   └── types/
    │       └── auth.ts             # Cognito 認証型定義 ✅
    ├── package.json                ✅
    ├── vite.config.ts              ✅
    └── tailwind.config.ts          ✅
```

### 3.2 目標構造（長期運用版）

```
kakei/
├── .gitignore
├── README.md                       # セットアップ手順・アーキテクチャ概要
├── docs/
│   ├── system_design.md
│   ├── aws_design.md
│   ├── repository_policy.md
│   ├── progress_status.md
│   ├── todo.md
│   └── endpoints.md                # デプロイ後の URL・ID 一覧（Git 管理対象）
│
├── terraform/
│   ├── provider.tf
│   ├── backend.tf
│   ├── variables.tf
│   ├── main.tf                     # モジュール呼び出しのみに整理
│   ├── outputs.tf                  # 全リソースの出力値
│   └── modules/
│       ├── s3/
│       │   └── main.tf             # フロントエンド用・CSV 用バケット
│       ├── cloudfront/
│       │   └── main.tf             # CDN ディストリビューション
│       ├── dynamodb/
│       │   └── main.tf             # KakeiTable（Single Table Design）
│       ├── cognito/
│       │   └── main.tf             # User Pool + Client
│       ├── lambda/
│       │   └── main.tf             # 3 関数 + IAM ロール
│       └── api_gateway/
│           └── main.tf             # REST API + Cognito Authorizer
│
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── transactions.ts     # 収支 CRUD
│   │   │   ├── categories.ts       # カテゴリ管理
│   │   │   └── csv-import.ts       # CSV 処理
│   │   ├── lib/
│   │   │   ├── dynamo.ts           # DynamoDB ヘルパー
│   │   │   ├── response.ts         # CORS 付きレスポンスヘルパー
│   │   │   └── auth.ts             # JWT からユーザー ID 取得
│   │   └── types/
│   │       └── index.ts            # Transaction / Category 型
│   ├── dist/                       # ビルド成果物（.gitignore 対象）
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── api/
    │   │   ├── auth.ts             # Cognito 認証関数
    │   │   ├── transactions.ts     # 収支 API 呼び出し
    │   │   └── csv.ts              # Presigned URL + S3 アップロード
    │   ├── components/
    │   │   ├── PrivateRoute.tsx
    │   │   ├── TransactionForm.tsx
    │   │   ├── TransactionCard.tsx
    │   │   ├── BottomNavigation.tsx
    │   │   └── ErrorBoundary.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useTransactions.ts
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── SignupPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── TransactionListPage.tsx
    │   │   ├── CsvImportPage.tsx
    │   │   └── CategoryPage.tsx
    │   └── types/
    │       └── auth.ts
    ├── .env.example                # 環境変数テンプレート（Git 管理対象）
    ├── .env.local                  # 実際の値（.gitignore 対象）
    ├── dist/                       # ビルド成果物（.gitignore 対象）
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.ts
```

### 3.3 ディレクトリ設計の原則

| 原則 | 内容 |
|------|------|
| **関心の分離** | インフラ（terraform）・バックエンド（backend）・フロントエンド（frontend）を明確に分離 |
| **モジュール化** | Terraform はサービス単位でモジュール化し、再利用性と可読性を確保 |
| **ドキュメント集約** | 設計・運用に関するドキュメントはすべて `docs/` に集約 |
| **ビルド成果物の除外** | `dist/`、`.terraform/` などのビルド成果物は Git 管理対象外 |

---

## 4. 次ステップ：Issue #1 AWS SSO 認証設定

現在の最大のブロッカーは **AWS 認証情報が設定されていないこと** です。  
`terraform plan` を実行するために、以下の手順で AWS SSO (Identity Center) を設定します。

### 4.1 前提条件の確認

```powershell
# AWS CLI がインストールされているか確認
aws --version
# 期待値: aws-cli/2.x.x Python/3.x.x ...

# インストールされていない場合
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
```

### 4.2 AWS Identity Center の設定（コンソール操作）

1. AWS マネジメントコンソールに **Root ユーザー** でログイン
2. **IAM Identity Center** を開く（東京リージョン: `ap-northeast-1`）
3. **有効化** ボタンをクリック（初回のみ）
4. 左メニュー「**ユーザー**」→「**ユーザーを追加**」
   - ユーザー名・メールアドレスを設定
5. 左メニュー「**権限セット**」→「**権限セットを作成**」
   - 種類: 「事前定義された権限セット」
   - ポリシー: `AdministratorAccess`
   - 名前: `Admin-Permission`
6. 左メニュー「**AWSアカウント**」→ アカウントを選択 →「**ユーザーまたはグループを割り当て**」
   - 作成したユーザーに `Admin-Permission` を割り当て
7. 左メニュー「**ダッシュボード**」→「**SSO 開始 URL**」をメモ
   - 形式: `https://d-xxxxxxxxxx.awsapps.com/start`

### 4.3 AWS CLI SSO プロファイルの設定（ローカル操作）

```bash
# SSO プロファイルを対話形式で設定
aws configure sso --profile dev
```

対話形式で以下を入力します：

```
SSO session name (Recommended): kakei-dev
SSO start URL [None]: https://d-xxxxxxxxxx.awsapps.com/start  ← 手順 4.2 でメモした URL
SSO region [None]: ap-northeast-1
SSO registration scopes [sso:account:access]: （Enter でデフォルト）

# ブラウザが開き、AWS コンソールで認証を承認する

# 認証後、CLI に戻り以下を入力
CLI default client Region [None]: ap-northeast-1
CLI default output format [None]: json
CLI profile name [AdministratorAccess-xxxxxxxxxxxx]: dev  ← "dev" と入力
```

### 4.4 認証の確認

```bash
# SSO ログイン（ブラウザで認証）
aws sso login --profile dev

# 疎通確認
aws sts get-caller-identity --profile dev
```

期待される出力：
```json
{
    "UserId": "AROAXXXXXXXXXXXXXXXXX:your-username",
    "Account": "xxxxxxxxxxxx",
    "Arn": "arn:aws:sts::xxxxxxxxxxxx:assumed-role/Admin-Permission/your-username"
}
```

### 4.5 Terraform の実行確認

```bash
# 環境変数でプロファイルを指定
export AWS_PROFILE=dev   # bash/zsh
# または
$env:AWS_PROFILE = "dev"  # PowerShell

# terraform ディレクトリに移動して実行
cd terraform
terraform validate
terraform plan -out=tfplan
```

期待される出力（`terraform plan`）：
```
Plan: 4 to add, 0 to change, 0 to destroy.
# テスト用 S3 バケット（本体・バージョニング・暗号化・パブリックアクセスブロック）
```

### 4.6 Issue #1 完了の定義

以下がすべて確認できたら Issue #1 をクローズします：

- [ ] `aws sts get-caller-identity --profile dev` が正常に返る
- [ ] `terraform validate` がエラーなし
- [ ] `terraform plan` で S3 バケット 4 リソースの作成計画が表示される
- [ ] `terraform apply` でリソースが実際に作成される（任意）

### 4.7 Issue #1 完了後の次アクション

```
Issue #1 完了
    ↓
Issue #2: terraform/backend.tf を S3 バックエンドに移行
    ↓
Issue #3: Terraform — DynamoDB (KakeiTable) 定義
    ↓
Issue #4: Terraform — Cognito User Pool 定義
    ↓
Issue #5: フロントエンド Cognito 認証実装（ダミー認証を本物に置き換え）
```

---

**最終更新**: 2026年5月4日  
**次回更新予定**: Issue #1 完了後
