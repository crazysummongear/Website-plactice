# kakei — 設計書

**プロジェクト名**: kakei（家計管理アプリ）  
**作成日**: 2026年5月4日  
**コスト目標**: 月額 $5 以内（個人学習・個人利用）

---

## 1. アーキテクチャ概要

### 1.1 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント層                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Tailwind CSS                    │  │
│  │  - LoginPage / SignupPage                                │  │
│  │  - DashboardPage / TransactionListPage                   │  │
│  │  - CsvImportPage / CategoryPage                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      AWS クラウド層                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CloudFront + S3 (静的ホスティング)                      │   │
│  │  - フロントエンド配信                                    │   │
│  │  - CDN キャッシング                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  認証レイヤー                                             │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Amazon Cognito User Pool                        │   │   │
│  │  │  - ユーザー管理                                  │   │   │
│  │  │  - JWT トークン発行                              │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API レイヤー                                             │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  API Gateway (REST)                              │   │   │
│  │  │  - Cognito Authorizer                            │   │   │
│  │  │  - CORS 設定                                     │   │   │
│  │  │  - ルーティング                                  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  コンピュートレイヤー                                     │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  AWS Lambda (Node.js 20.x + TypeScript)          │   │   │
│  │  │  - transactions (収支 CRUD)                      │   │   │
│  │  │  - categories (カテゴリ管理)                     │   │   │
│  │  │  - csv-import (CSV 処理)                         │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  データレイヤー                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  DynamoDB (Single Table Design)                  │   │   │
│  │  │  - KakeiTable                                    │   │   │
│  │  │  - PK: USER#userId                              │   │   │
│  │  │  - SK: TX#date#txId / CAT#categoryId             │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  S3 (CSV 一時保存)                               │   │   │
│  │  │  - ライフサイクル: 7日後自動削除                 │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. データモデル

### 2.1 DynamoDB テーブル設計（Single Table Design）

**テーブル名**: `KakeiTable`

#### パーティションキー（PK）

```
USER#<userId>
```

例: `USER#user-123`

#### ソートキー（SK）

```
TX#<YYYY-MM-DD>#<transactionId>    # 収支レコード
CAT#<categoryId>                    # カテゴリレコード
```

例:
- `TX#2026-05-04#tx-001`
- `CAT#food`

#### 属性スキーマ

| 属性名 | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `PK` | String | パーティションキー | `USER#user-123` |
| `SK` | String | ソートキー | `TX#2026-05-04#tx-001` |
| `type` | String | レコード種別 | `TRANSACTION` / `CATEGORY` |
| `date` | String | 日付（ISO 8601） | `2026-05-04` |
| `category` | String | カテゴリ名 | `食費` |
| `amount` | Number | 金額（円） | `1500` |
| `incomeExpense` | String | 収入/支出 | `INCOME` / `EXPENSE` |
| `memo` | String | メモ | `スーパーで買い物` |
| `createdAt` | String | 作成日時（ISO 8601） | `2026-05-04T10:30:00Z` |
| `updatedAt` | String | 更新日時（ISO 8601） | `2026-05-04T10:30:00Z` |

#### グローバルセカンダリインデックス（GSI）

**コスト最適化のため、GSI は使用しない**
- 理由: GSI は追加のストレージとスループットコストが発生
- 代替案: アプリケーション側でフィルタリング処理を実装
- 個人利用のデータ量では、クライアント側フィルタで十分なパフォーマンス

---

## 3. API 設計

### 3.1 エンドポイント一覧

#### 収支管理

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/transactions` | 収支一覧取得 | JWT |
| POST | `/transactions` | 収支登録 | JWT |
| PUT | `/transactions/{id}` | 収支更新 | JWT |
| DELETE | `/transactions/{id}` | 収支削除 | JWT |

#### カテゴリ管理

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/categories` | カテゴリ一覧取得 | JWT |
| POST | `/categories` | カテゴリ登録 | JWT |

#### CSV インポート

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/csv/upload-url` | Presigned URL 発行 | JWT |

### 3.2 リクエスト・レスポンス例

#### POST /transactions（収支登録）

**リクエスト**:
```json
{
  "date": "2026-05-04",
  "category": "食費",
  "amount": 1500,
  "incomeExpense": "EXPENSE",
  "memo": "スーパーで買い物"
}
```

**レスポンス** (201 Created):
```json
{
  "id": "tx-001",
  "userId": "user-123",
  "date": "2026-05-04",
  "category": "食費",
  "amount": 1500,
  "incomeExpense": "EXPENSE",
  "memo": "スーパーで買い物",
  "createdAt": "2026-05-04T10:30:00Z",
  "updatedAt": "2026-05-04T10:30:00Z"
}
```

#### GET /transactions（収支一覧取得）

**クエリパラメータ**:
```
?startDate=2026-05-01&endDate=2026-05-31&category=食費&incomeExpense=EXPENSE
```

**レスポンス** (200 OK):
```json
{
  "items": [
    {
      "id": "tx-001",
      "date": "2026-05-04",
      "category": "食費",
      "amount": 1500,
      "incomeExpense": "EXPENSE",
      "memo": "スーパーで買い物",
      "createdAt": "2026-05-04T10:30:00Z"
    }
  ],
  "summary": {
    "totalIncome": 200000,
    "totalExpense": 50000,
    "balance": 150000
  }
}
```

---

## 4. フロントエンド設計

### 4.1 ページ構成

```
App.tsx
├── LoginPage.tsx          # ログイン画面
├── SignupPage.tsx         # サインアップ画面
├── PrivateRoute.tsx       # 認証ガード
└── Dashboard (認証済み)
    ├── DashboardPage.tsx      # ダッシュボード
    ├── TransactionListPage.tsx # 収支一覧
    ├── CsvImportPage.tsx      # CSV インポート
    └── CategoryPage.tsx       # カテゴリ管理
```

### 4.2 コンポーネント設計

#### 認証関連

- `LoginPage.tsx` — ログイン画面（React Hook Form + Zod）
- `SignupPage.tsx` — サインアップ画面
- `useAuth.ts` — 認証状態管理フック
- `PrivateRoute.tsx` — 認証ガード

#### 収支管理

- `TransactionForm.tsx` — 収支入力フォーム
- `TransactionCard.tsx` — 収支カード表示
- `TransactionListPage.tsx` — 一覧・検索・フィルタ
- `useTransactions.ts` — React Query フック

#### ダッシュボード

- `DashboardPage.tsx` — 月別サマリー・グラフ
- `SummaryCard.tsx` — サマリーカード
- `CategoryChart.tsx` — カテゴリ別円グラフ
- `TrendChart.tsx` — 月別推移折れ線グラフ

#### CSV インポート

- `CsvImportPage.tsx` — ファイル選択・アップロード
- `CsvPreview.tsx` — CSV プレビュー
- `ColumnMapper.tsx` — カラムマッピング

### 4.3 状態管理

- **認証状態**: `useAuth.ts`（Context API）
- **サーバーステート**: React Query（キャッシング・同期）
- **フォーム状態**: React Hook Form（バリデーション）

---

## 5. バックエンド設計

### 5.1 Lambda 関数構成

#### transactions ハンドラ

```typescript
// src/handlers/transactions.ts
export const handler = async (event: APIGatewayProxyEvent) => {
  const method = event.httpMethod;
  const userId = event.requestContext.authorizer.claims.sub;

  switch (method) {
    case 'GET':
      return getTransactions(userId, event.queryStringParameters);
    case 'POST':
      return createTransaction(userId, JSON.parse(event.body));
    case 'PUT':
      return updateTransaction(userId, event.pathParameters.id, JSON.parse(event.body));
    case 'DELETE':
      return deleteTransaction(userId, event.pathParameters.id);
  }
};
```

#### categories ハンドラ

```typescript
// src/handlers/categories.ts
export const handler = async (event: APIGatewayProxyEvent) => {
  const method = event.httpMethod;
  const userId = event.requestContext.authorizer.claims.sub;

  switch (method) {
    case 'GET':
      return getCategories(userId);
    case 'POST':
      return createCategory(userId, JSON.parse(event.body));
  }
};
```

#### csv-import ハンドラ

```typescript
// src/handlers/csv-import.ts
export const handler = async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer.claims.sub;
  return generatePresignedUrl(userId);
};

// S3 イベントトリガー
export const s3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    await processCsvFile(bucket, key);
  }
};
```

### 5.2 共通ライブラリ

#### DynamoDB ヘルパー（lib/dynamo.ts）

```typescript
export class DynamoDBClient {
  async put(item: any): Promise<void> { }
  async query(pk: string, sk?: string): Promise<any[]> { }
  async update(pk: string, sk: string, updates: any): Promise<void> { }
  async delete(pk: string, sk: string): Promise<void> { }
}
```

#### レスポンスヘルパー（lib/response.ts）

```typescript
export const successResponse = (data: any, statusCode = 200) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(data),
});

export const errorResponse = (error: any, statusCode = 400) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ error: error.message }),
});
```

#### 認証ヘルパー（lib/auth.ts）

```typescript
export const getUserId = (event: APIGatewayProxyEvent): string => {
  return event.requestContext.authorizer.claims.sub;
};
```

---

## 6. Terraform 設計

### 6.1 モジュール構成

```
terraform/
├── main.tf                 # メインファイル（モジュール呼び出し）
├── variables.tf            # 変数定義
├── outputs.tf              # 出力値
├── provider.tf             # プロバイダー設定
├── backend.tf              # バックエンド設定
└── modules/
    ├── s3/
    │   └── main.tf         # S3 バケット定義
    ├── cloudfront/
    │   └── main.tf         # CloudFront ディストリビューション
    ├── cognito/
    │   └── main.tf         # Cognito User Pool
    ├── dynamodb/
    │   └── main.tf         # DynamoDB テーブル
    ├── lambda/
    │   └── main.tf         # Lambda 関数 + IAM ロール
    └── api_gateway/
        └── main.tf         # API Gateway + Cognito Authorizer
```

### 6.2 リソース定義例

#### DynamoDB テーブル

```hcl
resource "aws_dynamodb_table" "kakei_table" {
  name           = "KakeiTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  # コスト最適化: PITRは無効化（個人学習用のため）
  # 必要に応じて手動バックアップを実施
  point_in_time_recovery {
    enabled = false
  }

  tags = {
    Name = "kakei-table"
  }
}
```

#### Lambda 関数

```hcl
resource "aws_lambda_function" "transactions" {
  filename      = "dist/handlers/transactions.zip"
  function_name = "kakei-transactions"
  role          = aws_iam_role.lambda_role.arn
  handler       = "transactions.handler"
  runtime       = "nodejs20.x"
  
  # コスト最適化: メモリを最小限に設定
  memory_size   = 128  # 最小値（個人利用では十分）
  timeout       = 10   # 10秒（デフォルトの3秒より長めだが、コスト影響は小）

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.kakei_table.name
    }
  }
}
```

---

## 7. セキュリティ設計

### 7.1 認証・認可

- **認証**: Cognito User Pool（メール + パスワード）
- **認可**: API Gateway Cognito Authorizer（JWT 検証）
- **トークン**: ID Token（認証）+ Access Token（API アクセス）

### 7.2 通信セキュリティ

- **HTTPS 強制**: CloudFront + API Gateway
- **CORS**: フロントエンドドメインのみ許可
- **CSP**: Content-Security-Policy ヘッダー設定

### 7.3 データセキュリティ

- **DynamoDB 暗号化**: AWS 管理キー
- **S3 暗号化**: AES-256
- **IAM**: 最小権限（Lambda は特定テーブルのみアクセス）

### 7.4 秘匿情報管理

- **tfstate**: S3 バックエンド（暗号化）
- **環境変数**: Terraform 変数参照
- **.env**: `.gitignore` で除外

---

## 8. デプロイ・運用設計

### 8.1 デプロイフロー

```
1. ローカル開発
   ↓
2. feature ブランチで実装
   ↓
3. terraform validate / npm run build
   ↓
4. Pull Request 作成
   ↓
5. main へマージ
   ↓
6. terraform apply / npm run deploy
   ↓
7. 本番環境で動作確認
```

### 8.2 環境管理

| 環境 | 用途 | Terraform Backend |
|------|------|------------------|
| dev | 開発・テスト | ローカル |
| prod | 本番運用 | S3（将来） |

### 8.3 モニタリング・ログ

- **CloudWatch Logs**: Lambda ログ
- **CloudWatch Metrics**: API レスポンス時間、エラー率
- **AWS Budgets**: コスト監視

---

## 9. 非機能要件の実装方針

### 9.1 パフォーマンス

- **API**: Lambda + DynamoDB（< 500ms）
- **フロント**: Vite ビルド + CloudFront キャッシング
- **DB**: DynamoDB オンデマンド（自動スケーリング）

### 9.2 スケーラビリティ

- **Lambda**: 自動スケーリング
- **DynamoDB**: オンデマンド課金
- **S3**: 無制限スケーリング

### 9.3 可用性

- **SLA**: ベストエフォート（個人学習用のため、高可用性は不要）
- **PITR**: 無効化（コスト削減のため）
- **バックアップ**: 必要に応じて手動でエクスポート

---

## 10. コスト最適化設計

### 10.1 コスト目標

**月額 $5 以内**（個人学習・個人利用）

### 10.2 コスト削減施策

#### CloudFront
- **PriceClass**: `PriceClass_100`（北米・ヨーロッパのみ）
  - 理由: 個人利用のため、アジア太平洋のエッジロケーションは不要
  - コスト削減: 約30-40%削減
  - 注意: 日本からのアクセスでも動作するが、レイテンシがやや増加

#### DynamoDB
- **GSI**: 使用しない
  - 理由: GSI は追加のストレージとスループットコストが発生
  - 代替案: アプリケーション側でフィルタリング
- **PITR**: 無効化
  - 理由: 個人学習用のため、自動バックアップは不要
  - 代替案: 必要に応じて手動エクスポート
- **課金モード**: オンデマンド
  - 理由: 個人利用の低トラフィックでは、プロビジョニングより安価

#### Lambda
- **メモリ**: 128MB（最小値）
  - 理由: 個人利用のシンプルな処理では十分
  - コスト削減: メモリを増やすと実行時間が短縮されるが、個人利用では128MBで十分
- **タイムアウト**: 10秒
  - 理由: CSV処理など時間がかかる処理に対応しつつ、コストを抑える

#### S3
- **ライフサイクルポリシー**: CSV一時ファイルは7日後自動削除
  - 理由: 不要なストレージコストを削減
- **バージョニング**: フロントエンド用バケットのみ有効
  - 理由: CSV用バケットは一時保存のため不要

#### API Gateway
- **キャッシング**: 無効
  - 理由: キャッシング有効化は追加コストが発生
  - 個人利用の低トラフィックでは不要

#### Cognito
- **MFA**: 無効（オプション）
  - 理由: MFA SMS は追加コストが発生
  - 代替案: TOTP（Google Authenticator等）は無料

### 10.3 予想月額コスト（個人利用）

#### 現実的な使用量での試算

個人利用（1人）の場合、以下のような使用量が想定されます：

**1日の典型的な使い方**:
```
- 朝: ダッシュボード表示 → 2リクエスト
- 昼: 収支入力 → 2リクエスト
- 夕方: 収支入力 → 2リクエスト
- 夜: ダッシュボード確認 → 1リクエスト
合計: 約7リクエスト/日
```

**月間使用量**:
```
- 日常使用: 7リクエスト/日 × 30日 = 210リクエスト/月
- CSVインポート: 月4回 = 4リクエスト/月
- カテゴリ管理: 月2回 = 4リクエスト/月
- 予備: 82リクエスト/月
合計: 約300リクエスト/月
```

#### コスト試算

| リソース | 想定使用量 | 月額コスト | 備考 |
|----------|----------|----------|------|
| **S3** | 0.1GB ストレージ | $0.0023 | フロントエンド + CSV |
| **CloudFront** | 1GB 転送（PriceClass_100） | $0.085 | 個人利用 |
| **DynamoDB** | | | |
| - ストレージ | 0.1GB | $0.025 | 収支データ |
| - 読み取り | 200リクエスト | $0.00005 | 300リクエストの約2/3 |
| - 書き込み | 100リクエスト | $0.000125 | 300リクエストの約1/3 |
| **Lambda** | 300実行、128MB、平均200ms | $0.00006 | 最小メモリ |
| **API Gateway** | 300リクエスト | $0.00105 | 最大のコスト要因 |
| **Cognito** | 1 MAU | $0.00 | 無料 |
| **CloudWatch Logs** | 0.1GB | $0.05 | ログ保存 |
| **合計** | | **約$0.16/月** | **年間約$2** |

#### 使用量別コスト比較

| 使用量 | 月間リクエスト | 月額コスト | 年間コスト |
|--------|--------------|----------|----------|
| **軽度使用** | 100リクエスト | $0.10 | $1.20 |
| **通常使用** | 300リクエスト | $0.16 | $1.92 |
| **頻繁使用** | 1,000リクエスト | $0.35 | $4.20 |
| **ヘビー使用** | 10,000リクエスト | $2.50 | $30.00 |

**注意**: 
- 個人利用の場合、月額コストは**$0.16〜$0.5程度**に収まる
- API Gateway のコストは使用量に比例（$3.50/100万リクエスト）
- 実際の使用量は想定より少ない可能性が高い
- **月額$5以内の目標は十分達成可能**

### 10.4 コスト監視

- **AWS Budgets**: 月額 $1 のアラートを設定（実際のコストは$0.16〜$0.5程度）
- **Cost Explorer**: 週次でコストを確認
- **タグ付け**: 全リソースに `Project=kakei` タグを付与してコスト追跡

### 10.5 コスト削減のポイント

1. **API Gateway のリクエスト数を抑える**
   - 不要なポーリングを避ける
   - フロントエンドでキャッシュを活用
   - React Query の staleTime を適切に設定

2. **CloudFront の転送量を抑える**
   - 画像の最適化
   - gzip 圧縮の有効化
   - キャッシュの活用

3. **DynamoDB の読み書きを最適化**
   - バッチ処理の活用
   - 不要なクエリの削減

4. **Lambda の実行時間を短縮**
   - コードの最適化
   - 不要な処理の削減

---

**最終更新**: 2026年5月6日
