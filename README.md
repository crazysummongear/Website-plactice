# kakei — 35歳 FIRE 達成を目標とした資産管理アプリ

**プロジェクト名**: kakei（家計簿）  
**目標**: 35歳での FIRE（経済的自由）達成を支援する個人向け資産管理アプリ  
**開発スタイル**: AI 駆動開発（Kiro + Terraform IaC）

---

## 📋 クイックスタート

### 前提条件

- AWS アカウント（無料枠利用可能）
- AWS CLI v2 インストール済み
- Node.js 20.x インストール済み
- Git / GitHub アカウント

### セットアップ手順

#### 1. AWS SSO 認証設定

```bash
# SSO プロファイルを設定
aws configure sso --profile dev

# ログイン
aws sso login --profile dev

# 疎通確認
aws sts get-caller-identity --profile dev
```

詳細は [docs/repository_policy.md](docs/repository_policy.md) の「Issue #1 AWS SSO 認証設定」を参照。

#### 2. リポジトリをクローン

```bash
git clone https://github.com/crazysummongear/Website-plactice.git
cd Website-plactice
```

#### 3. Terraform でインフラをデプロイ

```bash
cd terraform
terraform init
terraform validate
terraform plan
terraform apply
```

#### 4. フロントエンドをビルド・デプロイ

```bash
cd ../frontend
npm install
npm run build
aws s3 sync dist/ s3://<bucket-name> --delete
```

#### 5. CloudFront URL にアクセス

CloudFront URL をブラウザで開き、アプリが表示されることを確認。

---

## 🏗️ アーキテクチャ概要

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| **フロントエンド** | React 18 + TypeScript + Tailwind CSS + Vite |
| **バックエンド** | AWS Lambda + Node.js 20.x + TypeScript |
| **データベース** | DynamoDB（Single Table Design） |
| **認証** | Amazon Cognito User Pool |
| **API** | API Gateway + REST |
| **ホスティング** | S3 + CloudFront |
| **IaC** | Terraform |

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント層                              │
│  React 18 + TypeScript + Tailwind CSS                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      AWS クラウド層                               │
│                                                                   │
│  CloudFront + S3 (静的ホスティング)                              │
│           ↓                                                       │
│  API Gateway (REST) + Cognito Authorizer                        │
│           ↓                                                       │
│  Lambda (transactions / categories / csv-import)                │
│           ↓                                                       │
│  DynamoDB (KakeiTable) + S3 (CSV 一時保存)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ディレクトリ構成

```
kakei/
├── README.md                       # このファイル
├── .gitignore                      # Git 除外設定
├── docs/
│   └── repository_policy.md        # リポジトリ運用方針
│
├── .kiro/specs/kakei/              # Spec ファイル（単一の真実の源）
│   ├── .config.kiro
│   ├── requirements.md             # 要件定義
│   ├── design.md                   # 設計書
│   └── tasks.md                    # 実装タスクリスト
│
├── terraform/                      # IaC（Terraform）
│   ├── provider.tf
│   ├── backend.tf
│   ├── variables.tf
│   ├── main.tf
│   └── modules/
│       ├── s3/
│       ├── cloudfront/
│       ├── cognito/
│       ├── dynamodb/
│       ├── lambda/
│       └── api_gateway/
│
├── backend/                        # Lambda バックエンド（TypeScript）
│   ├── src/
│   │   ├── handlers/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                       # React フロントエンド（TypeScript）
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── types/
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.ts
```

---

## 🚀 開発ワークフロー

### ブランチ戦略（GitHub Flow）

```bash
# 1. main から feature ブランチを切る
git checkout main
git pull origin main
git checkout -b feature/<issue番号>-<概要>

# 2. 実装・コミット
git add <変更ファイル>
git commit -m "🔧 config: 説明"

# 3. リモートにプッシュ
git push -u origin feature/<issue番号>-<概要>

# 4. GitHub で Pull Request を作成
# 5. main へマージ
```

詳細は [docs/repository_policy.md](docs/repository_policy.md) を参照。

---

## 📊 開発進捗

### PHASE 1: MVP（3ヶ月）

| STEP | タイトル | 状態 |
|------|----------|------|
| 1 | AWS 認証設定 | ⬜ 未着手 |
| 2 | Terraform — インフラ基盤 | ⏳ 進行中 |
| 3 | Terraform — DynamoDB + Cognito | ⬜ 未着手 |
| 4 | Terraform — Lambda + API Gateway | ⬜ 未着手 |
| 5 | バックエンド — 共通ライブラリ | ⬜ 未着手 |
| 6 | バックエンド — Lambda ハンドラ | ⬜ 未着手 |
| 7 | フロントエンド — 認証 | ⬜ 未着手 |
| 8 | フロントエンド — 収支機能 | ⬜ 未着手 |
| 9 | フロントエンド — CSV インポート | ⬜ 未着手 |
| 10 | デプロイ・動作確認 | ⬜ 未着手 |

**全体完了度**: 約 **10%**

詳細は [.kiro/specs/kakei/tasks.md](.kiro/specs/kakei/tasks.md) を参照。

---

## 💰 コスト目標

AWS 無料枠を最大限活用し、**月額 $5 以下**で運用。

| リソース | 月額コスト | 状態 |
|----------|----------|------|
| S3 | $0 ~ $0.1 | ✅ 無料枠内 |
| DynamoDB | $0（オンデマンド） | ✅ 無料枠内 |
| Lambda | $0（100万リクエスト/月） | ✅ 無料枠内 |
| API Gateway | $0（100万呼び出し/月） | ✅ 無料枠内 |
| Cognito | $0（50,000 MAU） | ✅ 無料枠内 |
| CloudFront | $0 ~ $0.2（1TB/月） | ✅ 無料枠内 |
| **合計** | **$0 ~ $0.5/月** | ✅ **達成予定** |

---

## 📚 ドキュメント

- **[.kiro/specs/kakei/requirements.md](.kiro/specs/kakei/requirements.md)** — 要件定義書
- **[.kiro/specs/kakei/design.md](.kiro/specs/kakei/design.md)** — 設計書
- **[.kiro/specs/kakei/tasks.md](.kiro/specs/kakei/tasks.md)** — 実装タスクリスト
- **[docs/repository_policy.md](docs/repository_policy.md)** — リポジトリ運用方針

---

## 🔗 リンク

- **GitHub**: https://github.com/crazysummongear/Website-plactice
- **AWS**: https://console.aws.amazon.com/

---

## 📝 ライセンス

MIT License

---

**最終更新**: 2026年5月4日
