# API Endpoints Documentation

**プロジェクト**: kakei（家計管理アプリ）  
**最終更新**: 2026年5月26日

---

## 概要

このドキュメントは、kakeiアプリケーションのバックエンドAPIエンドポイントの仕様をまとめたものです。

**API Gateway URL**: `https://8uugz9nauk.execute-api.ap-northeast-1.amazonaws.com/dev`

---

## 認証

すべてのAPIエンドポイント（`/transactions`, `/categories`, `/csv/upload-url`）は、Cognito認証が必要です。

### 認証ヘッダー

```
Authorization: Bearer <ID_TOKEN>
```

- `ID_TOKEN`: Cognito User Poolから取得したJWTトークン
- トークンは、ログイン後にCognitoから返される`idToken`を使用

---

## エンドポイント一覧

### 1. Transactions API

#### 1.1 GET /transactions

収支データの一覧を取得します。

**リクエスト**:
```http
GET /transactions?startDate=2024-01-01&endDate=2024-12-31&category=食費
Authorization: Bearer <ID_TOKEN>
```

**クエリパラメータ**:
- `startDate` (optional): 開始日（YYYY-MM-DD形式）
- `endDate` (optional): 終了日（YYYY-MM-DD形式）
- `category` (optional): カテゴリ名でフィルタ

**レスポンス**:
```json
{
  "transactions": [
    {
      "id": "tx-123",
      "userId": "user-456",
      "date": "2024-01-15",
      "amount": 1500,
      "category": "食費",
      "memo": "ランチ",
      "type": "expense",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

#### 1.2 POST /transactions

新しい収支データを作成します。

**リクエスト**:
```http
POST /transactions
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json

{
  "date": "2024-01-15",
  "amount": 1500,
  "category": "食費",
  "memo": "ランチ",
  "type": "expense"
}
```

**リクエストボディ**:
- `date` (required): 日付（YYYY-MM-DD形式）
- `amount` (required): 金額（数値）
- `category` (required): カテゴリ名
- `memo` (optional): メモ
- `type` (required): 種別（`income` または `expense`）

**レスポンス**:
```json
{
  "transaction": {
    "id": "tx-123",
    "userId": "user-456",
    "date": "2024-01-15",
    "amount": 1500,
    "category": "食費",
    "memo": "ランチ",
    "type": "expense",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

---

#### 1.3 PUT /transactions/{id}

既存の収支データを更新します。

**リクエスト**:
```http
PUT /transactions/tx-123
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json

{
  "amount": 2000,
  "memo": "ランチ（更新）"
}
```

**パスパラメータ**:
- `id` (required): 収支データのID

**リクエストボディ**:
- 更新したいフィールドのみ指定

**レスポンス**:
```json
{
  "transaction": {
    "id": "tx-123",
    "userId": "user-456",
    "date": "2024-01-15",
    "amount": 2000,
    "category": "食費",
    "memo": "ランチ（更新）",
    "type": "expense",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-16T10:00:00Z"
  }
}
```

---

#### 1.4 DELETE /transactions/{id}

収支データを削除します。

**リクエスト**:
```http
DELETE /transactions/tx-123
Authorization: Bearer <ID_TOKEN>
```

**パスパラメータ**:
- `id` (required): 収支データのID

**レスポンス**:
```json
{
  "message": "Transaction deleted successfully"
}
```

---

### 2. Categories API

#### 2.1 GET /categories

カテゴリ一覧を取得します。

**リクエスト**:
```http
GET /categories
Authorization: Bearer <ID_TOKEN>
```

**レスポンス**:
```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "食費",
      "type": "expense",
      "userId": "user-456"
    },
    {
      "id": "cat-2",
      "name": "給料",
      "type": "income",
      "userId": "user-456"
    }
  ]
}
```

---

#### 2.2 POST /categories

新しいカテゴリを作成します。

**リクエスト**:
```http
POST /categories
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json

{
  "name": "交通費",
  "type": "expense"
}
```

**リクエストボディ**:
- `name` (required): カテゴリ名
- `type` (required): 種別（`income` または `expense`）

**レスポンス**:
```json
{
  "category": {
    "id": "cat-3",
    "name": "交通費",
    "type": "expense",
    "userId": "user-456",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### 3. CSV Import API

#### 3.1 POST /csv/upload-url

CSV アップロード用のPresigned URLを取得します。

**リクエスト**:
```http
POST /csv/upload-url
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json
```

**レスポンス**:
```json
{
  "uploadUrl": "https://kakei-csv-temp-dev-839706991336.s3.ap-northeast-1.amazonaws.com/user-456/file-789.csv?X-Amz-Algorithm=...",
  "fileName": "user-456/file-789.csv"
}
```

**使用方法**:
1. このエンドポイントを呼び出してPresigned URLを取得
2. 取得したURLに対してPUT リクエストでCSVファイルをアップロード
3. S3イベントトリガーでLambda関数が自動実行され、CSVデータがDynamoDBに保存される

**CSVアップロード例**:
```http
PUT <uploadUrl>
Content-Type: text/csv

<CSV file content>
```

---

## エラーレスポンス

すべてのエンドポイントは、エラー時に以下の形式でレスポンスを返します。

```json
{
  "error": "Error message description"
}
```

**HTTPステータスコード**:
- `200`: 成功
- `400`: リクエストが不正
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

---

## CORS設定

すべてのエンドポイントは、以下のCORSヘッダーを返します。

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## レート制限

現在、レート制限は設定されていません。将来的にAPI Gatewayのスロットリング設定を追加する予定です。

---

## テスト方法

### curlでのテスト例

```bash
# 1. ログインしてトークンを取得（フロントエンドから）
ID_TOKEN="<your-id-token>"

# 2. 収支一覧を取得
curl -X GET "https://8uugz9nauk.execute-api.ap-northeast-1.amazonaws.com/dev/transactions" \
  -H "Authorization: Bearer $ID_TOKEN"

# 3. 収支を作成
curl -X POST "https://8uugz9nauk.execute-api.ap-northeast-1.amazonaws.com/dev/transactions" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "amount": 1500,
    "category": "食費",
    "memo": "ランチ",
    "type": "expense"
  }'
```

---

## 関連リソース

- **CloudFront URL**: `https://drwpbnzy3pzzt.cloudfront.net`
- **Cognito User Pool ID**: `ap-northeast-1_CVGCgVANa`
- **Cognito Client ID**: `9h4g3m651mrs65vta59u3qb4u`
- **DynamoDB Table**: `KakeiTable`
- **S3 Buckets**:
  - Frontend: `kakei-frontend-dev-839706991336`
  - CSV Temp: `kakei-csv-temp-dev-839706991336`

---

**最終更新**: 2026年5月26日
