---

inclusion: always

# 開発標準（Engineering Standards）

このドキュメントは過去の開発で発生した設計上の問題を再発防止するための共通ルールである。

すべてのプロジェクトに適用する。

---

# 基本方針

実装よりも設計を優先する。

以下の順番で開発を行うこと。

1. requirements.md 作成
2. design.md 作成
3. 設計レビュー実施
4. task.md 作成
5. 実装開始

設計レビューが完了するまで実装を開始してはならない。

---

# requirements.md 必須項目

requirements.md には以下を必ず含めること。

## 機能要件

* ユーザー要件
* システム要件

## 非機能要件

* パフォーマンス
* セキュリティ
* 可用性
* 保守性

## テスト戦略

以下を定義すること。

* Unit Test
* Component Test
* Integration Test
* E2E Test

## E2Eシナリオ

MVP段階で検証すべきユーザーフローを列挙すること。

## Mock戦略

以下を定義すること。

* 認証モック
* APIモック
* 外部サービスモック

---

# design.md 必須項目

design.md には以下を必ず含めること。

## アーキテクチャ

システム構成図を含めること。

## 状態管理

以下を明示すること。

### Single Source of Truth

状態の唯一の管理者を定義する。

### State Owner

状態を所有するコンポーネントまたはサービスを定義する。

### Consumer

状態を利用するコンポーネントを定義する。

### 禁止事項

状態を複製する実装を禁止する。

---

## テスタビリティ

### data-testid

すべてのインタラクティブ要素に付与すること。

対象例

* button
* input
* select
* modal
* navigation
* card

命名規則

{feature}-{element}

例

* login-button
* email-input
* dashboard-title
* transaction-submit-button

---

## ライブラリ管理

採用するライブラリについて以下を記録すること。

* バージョン
* 採用理由
* 互換性確認結果

以下は特に確認すること。

* React
* React Router
* React Query
* Zod
* React Hook Form
* Resolver系ライブラリ

---

## E2E考慮事項

テストへ影響するUI特性を記録すること。

対象例

* position: fixed
* sticky
* portal
* modal
* overlay
* animation
* infinite scroll

---

## アーキテクチャ制約

以下を明示すること。

### Provider配置

Providerの配置位置

### Hook利用ルール

利用可能箇所

利用禁止箇所

### Singletonルール

単一インスタンスであるべきサービスを定義する。

---

# React設計ルール

## Context利用時

状態の所有者を必ず定義すること。

Contextを利用する場合は以下を明示する。

* Provider
* Context Hook
* 利用コンポーネント

禁止事項

Context管理対象の状態を別Hookで複製すること。

---

# テスト設計ルール

テストは設計の一部として扱う。

実装完了後に追加で考えるものではない。

以下を設計段階で決定する。

* テスト対象
* テスト責任範囲
* テスト実行タイミング
* Mock戦略

---

# 実装開始前レビュー

実装前に必ず以下を評価すること。

| 項目                       | 確認 |
| ------------------------ | -- |
| Test Strategy            | 必須 |
| State Management         | 必須 |
| Dependency Compatibility | 必須 |
| Testability              | 必須 |
| Architecture Constraints | 必須 |
| E2E Considerations       | 必須 |

不足項目が存在する場合は設計不備として報告すること。

---

# デプロイ前検証チェックリスト

デプロイ後に必ず以下を確認すること。Mock テストだけで完了としない。

## バックエンド（Lambda）

```bash
# 1. ビルド形式の確認（CJS であること）
head -1 backend/dist/handlers/transactions.js
# "use strict" で始まれば CJS、"import" で始まれば ESM（NG）

# 2. Lambda を直接呼び出してランタイムエラーがないか確認
aws lambda invoke \
  --function-name kakei-transactions-dev \
  --payload '{"httpMethod":"GET","path":"/transactions","requestContext":{"authorizer":{"claims":{"sub":"test"}}}}' \
  --cli-binary-format raw-in-base64-out \
  response.json
cat response.json
# "errorType" が含まれていたらエラー

# 3. CloudWatch Logs でエラーがないか確認
aws logs tail /aws/lambda/kakei-transactions-dev --since 10m
```

## フロントエンド（本番環境）

デプロイ後にブラウザで以下を手動確認すること：

| 確認項目 | 期待結果 |
| ------- | ------- |
| ログイン画面が表示される | ✅ |
| ログインが成功する | ✅ |
| ダッシュボードにデータが表示される | ✅（空でも「データなし」表示） |
| ブラウザの DevTools にエラーがない | ✅ |
| Network タブで API 呼び出しが成功している | ✅ 200 OK |

## 確認コマンド一覧

```bash
# API Gateway に直接アクセス（401 が返れば正常稼働）
curl -s https://{api-id}.execute-api.ap-northeast-1.amazonaws.com/dev/transactions
# → {"message":"Unauthorized"} が返れば OK

# Lambda のランタイムエラー確認
aws lambda get-function --function-name kakei-transactions-dev --query 'Configuration.LastUpdateStatus'
# → "Successful" であれば OK
```

---

# レビュー出力形式

設計レビュー時は以下の形式で出力すること。

| Risk | Severity | Recommendation |
| ---- | -------- | -------------- |

Severity

* High
* Medium
* Low

Highが残っている場合は実装開始を推奨しない。

---

# ライブラリバージョン管理ルール

メジャーバージョンを上げる場合は実装前に互換性テストを実施する。

新しいメジャーバージョンを採用する場合は以下を確認すること。

1. 依存ライブラリのエラーオブジェクト形式が変わっていないか
2. 依存ライブラリの対応バージョンを公式ドキュメントで確認する
3. 実際にバリデーション・API呼び出しが動作するか手動で確認する

特に以下の組み合わせは必ず確認すること。

| ライブラリA | ライブラリB | 確認事項 |
| ---------- | ---------- | ------- |
| zod | @hookform/resolvers | エラーオブジェクト形式（zod v4でoriginフィールドが追加） |
| react | react-router-dom | Context API動作 |
| @tanstack/react-query | react | Suspense対応 |

確認コマンド例（zodResolver + zod の互換性確認）

```bash
node -e "
const { zodResolver } = require('@hookform/resolvers/zod');
const { z } = require('zod');
const schema = z.object({ password: z.string().min(12) });
const resolver = zodResolver(schema);
resolver({ password: 'short' }, {}, { fields: {}, names: ['password'] })
  .then(r => console.log(JSON.stringify(r)));
"
```

errorsが空でなければ正常。例外がスローされる場合は非互換。

---

# フォームバリデーションルール

React Hook Form の mode は onSubmit を基本とする。

onBlur は送信前にバリデーションが走らないケースがあるため原則使用しない。

```typescript
// ✅ 正しい設定
useForm({
  resolver: zodResolver(schema),
  mode: 'onSubmit',
  reValidateMode: 'onChange',
})

// ❌ 禁止（送信前にバリデーションが走らない場合がある）
useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',
})
```

---

# E2Eテスト実装ルール

## Mock モードの落とし穴（重要）

E2E テストを Mock モード（`VITE_MOCK_AUTH=true`）で実行すると、Lambda・API Gateway・DynamoDB は一切呼ばれない。

そのため以下の問題は **Mock テストでは検出できない**：

- Lambda のランタイムエラー（ESM/CJS 形式の不一致など）
- API Gateway の CORS 設定ミス
- DynamoDB のアクセス権限エラー
- 環境変数の未設定

**対策**: デプロイ後に必ず本番環境（または Staging 環境）で手動または E2E テストを実施すること。

```
テスト戦略の必須構成:
1. Mock E2E テスト → UI・フロントエンドロジックの検証
2. デプロイ後の本番動作確認 → バックエンド統合の検証（手動でも可）
```

Mock テストだけで「完成」と判断してはならない。

## ローディング状態の待機

ボタンクリック前にローディングが完了していることを確認する。

認証フックのloading状態がtrueの間はボタンがdisabledになるため、クリック前に必ず待機すること。

```typescript
// ✅ ローディング完了を待ってからクリック
await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();
await page.click('[data-testid="login-button"]');
```

## 非同期処理の完了待機

ページ遷移後はコンテンツが表示されるまで待機する。

waitForURLだけでは不十分な場合がある。コンテンツのセレクタで待機すること。

```typescript
// ✅ コンテンツが表示されるまで待機
await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 15000 });

// ❌ URLだけでは不十分な場合がある
await page.waitForURL('/dashboard');
```

## position: fixed 要素のクリック

ボトムナビゲーションなどposition: fixedの要素はビューポート外になる場合がある。

その場合はdispatchEventを使用する。

```typescript
// ✅ ビューポート外の要素をクリック
await page.locator('[data-testid="transactions-bottom-nav-button"]').dispatchEvent('click');

// ❌ ビューポート外ではタイムアウトになる
await page.click('[data-testid="transactions-bottom-nav-button"]');
```
