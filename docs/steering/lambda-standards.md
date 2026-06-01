---

inclusion: always

# Lambda標準（Lambda Standards）

このドキュメントはAWS Lambdaを使ったバックエンド開発の標準である。

すべてのLambdaプロジェクトに適用する。

---

# 基本方針

Lambda関数は単一責任とする。

1関数1エンドポイントを基本とする。

TypeScriptで実装し型安全性を確保する。

---

# 技術スタック

| 項目 | 技術 |
| ---- | ---- |
| ランタイム | Node.js 20.x |
| 言語 | TypeScript |
| ビルド | esbuild |
| テスト | Vitest |

---

# ディレクトリ構成

以下の構成を標準とする。

```
backend/
├── src/
│   ├── handlers/       # Lambdaハンドラ
│   │   ├── transactions.ts
│   │   ├── categories.ts
│   │   └── csv-import.ts
│   ├── lib/            # 共通ライブラリ
│   │   ├── dynamo.ts
│   │   ├── response.ts
│   │   └── auth.ts
│   └── types/          # 型定義
│       └── index.ts
├── package.json
└── tsconfig.json
```

---

# ハンドラ設計

## 基本構造

```typescript
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const method = event.httpMethod;

    switch (method) {
      case 'GET':    return await handleGet(userId, event);
      case 'POST':   return await handlePost(userId, event);
      case 'PUT':    return await handlePut(userId, event);
      case 'DELETE': return await handleDelete(userId, event);
      default:       return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    return errorResponse(error, 500);
  }
};
```

## エラーハンドリング

すべてのハンドラはtry-catchで囲む。

エラーはerrorResponseヘルパーで返す。

エラーログはconsole.errorで出力する。

---

# 共通ライブラリ

## レスポンスヘルパー（lib/response.ts）

```typescript
export const successResponse = (data: unknown, statusCode = 200) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(data),
});

export const errorResponse = (error: unknown, statusCode = 400) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({ error: errorMessage(error) }),
});
```

## 認証ヘルパー（lib/auth.ts）

```typescript
export const getUserId = (event: APIGatewayProxyEvent): string => {
  const userId = event.requestContext?.authorizer?.claims?.sub;
  if (!userId) throw new Error('Unauthorized');
  return userId;
};
```

## DynamoDBヘルパー（lib/dynamo.ts）

put / query / update / deleteメソッドを実装する。

エラーはそのままthrowする（ハンドラ側でキャッチ）。

---

# 型定義

すべてのリクエスト・レスポンスに型を定義する。

型定義はsrc/types/index.tsに集約する。

```typescript
export interface Transaction {
  id: string;
  userId: string;
  date: string;
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

# CORSヘッダー

すべてのレスポンスにCORSヘッダーを付与する。

```typescript
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};
```

本番環境ではワイルドカード（*）を使用しない。

---

# 環境変数

ハードコードを禁止する。

リソース名は環境変数で渡す。

```typescript
const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) throw new Error('TABLE_NAME is not set');
```

---

# パフォーマンス

## コールドスタート対策

DynamoDBクライアントはハンドラ外で初期化する。

```typescript
// ✅ ハンドラ外で初期化（再利用される）
const client = new DynamoDBDocumentClient(...);

export const handler = async (event) => {
  // clientを使用
};
```

## タイムアウト設定

通常処理: 10秒

CSV処理など重い処理: 30秒

---

# ビルド・デプロイ

## ビルド形式（重要）

Lambda の Node.js ランタイムはデフォルトで **CommonJS** として JS ファイルを扱う。

esbuild でビルドする場合は必ず `--format=cjs` を指定すること。

```bash
# ✅ 正しい（CommonJS形式）
esbuild src/**/*.ts --bundle --platform=node --target=node20 --outdir=dist --format=cjs

# ❌ 禁止（ESM形式 - Lambda で SyntaxError になる）
esbuild src/**/*.ts --bundle --platform=node --target=node20 --outdir=dist --format=esm
```

ESM を使いたい場合は zip に `package.json`（`"type": "module"` 含む）を同梱する必要があるが、
Terraform の `archive_file` で単一ファイルを zip する構成では動作しない。
**CJS 形式を標準とする。**

## ビルド後の動作確認

デプロイ前に Lambda を直接呼び出してランタイムエラーがないか確認すること。

```bash
# Lambda を直接テスト呼び出し
aws lambda invoke \
  --function-name {function-name} \
  --payload '{"httpMethod":"GET","path":"/...","requestContext":{"authorizer":{"claims":{"sub":"test"}}}}' \
  --cli-binary-format raw-in-base64-out \
  response.json

cat response.json
# "errorType":"Runtime.UserCodeSyntaxError" が出たらビルド形式を確認
```

## ビルド

```bash
npm run build
```

TypeScriptをJavaScriptにコンパイルする。

ビルドエラーがある場合はデプロイしない。

## デプロイ

Terraformでデプロイする。

```bash
terraform apply
```

---

# テスト

## ユニットテスト

ハンドラのロジックをVitest でテストする。

DynamoDBはモックする。

## テスト対象

* 正常系（各HTTPメソッド）
* 異常系（バリデーションエラー、認証エラー）
* エッジケース（空データ、不正な入力）

---

# ログ

CloudWatch Logsにログを出力する。

ログレベルを使い分ける。

```typescript
console.log('INFO: ...');
console.error('ERROR: ...', error);
```

個人情報・認証情報をログに出力しない。

---

# 設計レビュー必須項目

実装前に以下を確認すること。

| 項目 | 確認 |
| ---- | ---- |
| 単一責任 | 必須 |
| エラーハンドリング | 必須 |
| 型定義 | 必須 |
| CORSヘッダー | 必須 |
| 環境変数 | 必須 |
| IAM最小権限 | 必須 |
| テスト設計 | 必須 |
