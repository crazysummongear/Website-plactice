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

**月額 $0.5 以内**で運用（個人学習・個人利用）

### 現実的なコスト試算（個人利用）

個人利用（月間300リクエスト程度）の場合：

| リソース | 想定使用量 | 月額コスト |
|----------|----------|----------|
| S3 | 0.1GB ストレージ | $0.0023 |
| CloudFront | 1GB 転送（PriceClass_100） | $0.085 |
| DynamoDB | 300リクエスト、0.1GB ストレージ | $0.025 |
| Lambda | 300リクエスト、128MB、平均200ms | $0.00006 |
| API Gateway | 300リクエスト | $0.00105 |
| Cognito | 1 MAU | $0.00 |
| CloudWatch Logs | 0.1GB | $0.05 |
| **合計** | | **約$0.16/月** |

**年間コスト**: **約$2/年**

### 使用量別コスト

| 使用量 | 月間リクエスト | 月額コスト | 年間コスト |
|--------|--------------|----------|----------|
| 軽度使用 | 100リクエスト | $0.10 | $1.20 |
| 通常使用 | 300リクエスト | $0.16 | $1.92 |
| 頻繁使用 | 1,000リクエスト | $0.35 | $4.20 |
| ヘビー使用 | 10,000リクエスト | $2.50 | $30.00 |

### コスト削減施策

| 施策 | 削減効果 |
|------|---------|
| CloudFront PriceClass_100 | 30-40%削減 |
| DynamoDB GSI 不使用 | ストレージ・スループットコスト削減 |
| DynamoDB PITR 無効化 | バックアップコスト削減 |
| Lambda メモリ128MB | 最小メモリで実行コスト削減 |
| S3 ライフサイクルポリシー | 不要ファイル自動削除 |

**注意**: 実際の個人利用では、想定より使用量が少ないため、月額$0.16〜$0.5程度に収まる可能性が高い

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
