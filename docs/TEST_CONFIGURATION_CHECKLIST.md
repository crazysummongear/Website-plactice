# テスト設定チェックリスト

このドキュメントは、テストスイートがすべて正しく設定されていることを確認するためのチェックリストです。

---

## バックエンド (Jest)

### 設定ファイル

- [ ] `backend/jest.config.js` が存在する
- [ ] `backend/package.json` に `jest` と `ts-jest` が依存に含まれている
- [ ] `backend/tsconfig.json` が存在し、正しく設定されている

### jest.config.js チェック項目

```javascript
- [ ] preset: 'ts-jest' が設定されている
- [ ] testEnvironment: 'node' が設定されている
- [ ] roots: ['<rootDir>/src'] が設定されている
- [ ] testMatch: ['**/?(*.)+(spec|test).ts'] が設定されている
- [ ] moduleFileExtensions に 'ts' が含まれている
- [ ] collectCoverageFrom が適切に設定されている
- [ ] coverageThresholds が設定されている (新規)
  - global.branches: 80
  - global.functions: 90
  - global.lines: 85
  - global.statements: 85
- [ ] verbose: true が設定されている (新規)
- [ ] clearMocks: true が設定されている (新規)
- [ ] restoreMocks: true が設定されている (新規)
```

### テストファイルチェック項目

#### src/lib/auth.test.ts
- [ ] ファイルが存在する
- [ ] `getUserId()` テストが存在する
  - [ ] 有効なイベントのテスト
  - [ ] claims が null のテスト
  - [ ] sub が欠落しているテスト
  - [ ] authorizer が undefined のテスト
- [ ] `verifyToken()` テストが存在する

#### src/lib/response.test.ts
- [ ] ファイルが存在する
- [ ] `successResponse()` テストが存在する
  - [ ] ステータスコード 200 のテスト
  - [ ] カスタムステータスコードのテスト
  - [ ] CORS ヘッダのテスト
  - [ ] 複雑なデータ構造のテスト
  - [ ] null/undefined のテスト
- [ ] `errorResponse()` テストが存在する
  - [ ] ステータスコード 500 のテスト
  - [ ] 400, 401, 403 のテスト
  - [ ] CORS ヘッダのテスト

#### src/lib/dynamo.test.ts
- [ ] ファイルが存在する
- [ ] `put()` テストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング
  - [ ] 複雑なデータ構造
- [ ] `get()` テストが存在する
  - [ ] アイテム存在時
  - [ ] アイテム不存在時
  - [ ] エラーハンドリング
- [ ] `query()` テストが存在する
  - [ ] パーティションキーによるクエリ
  - [ ] ソートキープリフィックス
  - [ ] 空の結果
  - [ ] エラーハンドリング
- [ ] `update()` テストが存在する
  - [ ] 単一フィールド更新
  - [ ] 複数フィールド更新
  - [ ] エラーハンドリング
- [ ] `deleteItem()` テストが存在する
  - [ ] 正常系
  - [ ] 存在しないアイテム
  - [ ] エラーハンドリング

#### src/handlers/categories.test.ts
- [ ] ファイルが存在する
- [ ] `getCategories()` テストが存在する
  - [ ] 正常系
  - [ ] 空の結果
  - [ ] エラーハンドリング
- [ ] `createCategory()` テストが存在する
  - [ ] 正常系 (INCOME/EXPENSE)
  - [ ] バリデーションエラー
  - [ ] データベースエラー

#### src/handlers/transactions.test.ts
- [ ] ファイルが存在する
- [ ] `getTransactions()` テストが存在する
  - [ ] 基本的なフェッチ
  - [ ] 日付範囲フィルタ
  - [ ] カテゴリフィルタ
  - [ ] 収支タイプフィルタ
  - [ ] **複数フィルタ組み合わせ (新規)**
  - [ ] **日付範囲検証 (新規)**
  - [ ] **エラーレスポンス形式確認 (新規)**
  - [ ] エラーハンドリング
- [ ] `createTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] バリデーションエラー
  - [ ] オプションフィールド
  - [ ] エラーハンドリング
- [ ] `updateTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] 404 エラー
- [ ] `deleteTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] 404 エラー

#### src/handlers/csv-import.test.ts
- [ ] ファイルが存在する
- [ ] `getUploadUrl()` テストが存在する
  - [ ] 正常系
  - [ ] 異なるファイル名生成
  - [ ] エラーハンドリング
- [ ] `handleS3Event()` テストが存在する
  - [ ] 基本的な CSV パース
  - [ ] **BOM 処理 (新規)**
  - [ ] **混在改行コード対応 (新規)**
  - [ ] 空行スキップ
  - [ ] 空の CSV ボディ処理
  - [ ] 複数 S3 レコード
  - [ ] 特殊文字を含むキー
  - [ ] **エラー復旧ロジック (新規)**
  - [ ] **部分的なデータベース失敗 (新規)**

### テスト実行確認

- [ ] `npm test` で全テスト実行可能
- [ ] `npm run test:watch` でウォッチモード起動可能
- [ ] `npm run test:coverage` でカバレッジレポート生成可能
- [ ] 全テスト成功: ✅
- [ ] カバレッジが目標値以上: ✅
- [ ] テスト実行時間が 10 秒以内: ✅

---

## フロントエンド (Vitest)

### 設定ファイル

- [ ] `frontend/vitest.config.ts` が新規作成されている
- [ ] `frontend/package.json` に `vitest` が依存に含まれている
- [ ] `frontend/src/test/setup.ts` が存在している

### vitest.config.ts チェック項目

```typescript
- [ ] defineConfig で設定されている
- [ ] plugins: [react()] が含まれている
- [ ] test.environment: 'jsdom' が設定されている
- [ ] test.setupFiles: ['./src/test/setup.ts'] が設定されている
- [ ] test.coverage.provider: 'v8' が設定されている
- [ ] test.coverage.reporter が ['text', 'json', 'html', 'lcov'] を含んでいる
- [ ] test.coverage.lines: 80 が設定されている
- [ ] test.coverage.functions: 85 が設定されている
- [ ] test.coverage.branches: 75 が設定されている
- [ ] test.coverage.statements: 80 が設定されている
- [ ] test.globals: true が設定されている
- [ ] test.clearMocks: true が設定されている
- [ ] test.restoreMocks: true が設定されている
```

### テストファイルチェック項目

#### src/api/auth.test.ts
- [ ] ファイルが存在する
- [ ] `getUserFromToken()` テストが存在する
  - [ ] 有効なトークン
  - [ ] 無効なフォーマット
  - [ ] 不正なペイロード
- [ ] `isTokenExpired()` テストが存在する
  - [ ] 有効なトークン
  - [ ] 期限切れトークン
  - [ ] 無効なフォーマット
  - [ ] exp フィールド欠落

#### src/api/transactions.test.ts
- [ ] ファイルが存在する
- [ ] `getTransactions()` テストが存在する
  - [ ] 基本的なフェッチ
  - [ ] 日付範囲フィルタ
  - [ ] カテゴリフィルタ
  - [ ] 収支タイプフィルタ
  - [ ] **タイムアウト処理 (新規)**
  - [ ] **リトライロジック (新規)**
  - [ ] **ネットワークタイムアウト (新規)**
  - [ ] エラーハンドリング
- [ ] `createTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング
- [ ] `updateTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] 404 エラー
- [ ] `deleteTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング

#### src/api/csv.test.ts
- [ ] ファイルが存在する
- [ ] `getPresignedUrl()` テストが存在する
  - [ ] 正常系
  - [ ] 認証エラー
  - [ ] API エラー
- [ ] `uploadCsvToS3()` テストが存在する
  - [ ] 正常系
  - [ ] **キャンセル処理 (新規)**
  - [ ] **部分的な失敗 (503) (新規)**
  - [ ] エラーハンドリング
- [ ] `importCsv()` テストが存在する
  - [ ] フルフロー成功
  - [ ] URL リクエスト失敗
  - [ ] S3 アップロード失敗

#### src/hooks/useAuth.test.ts
- [ ] ファイルが存在する
- [ ] 初期状態テストが存在する
  - [ ] 未認証状態
  - [ ] **セッション復元 (新規)**
  - [ ] **期限切れトークン処理 (新規)**
- [ ] ログインテストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング
  - [ ] ローディング状態
- [ ] ログアウトテストが存在する
  - [ ] 正常系
  - [ ] エラー時の処理
- [ ] **セッション管理テスト (新規)**
  - [ ] 部分的なトークン期限切れ
  - [ ] オンデマンド期限切れ検出
  - [ ] トークンストレージ
  - [ ] トークンクリア

#### src/hooks/useTransactions.test.ts
- [ ] ファイルが存在する
- [ ] `useTransactions()` テストが存在する
  - [ ] 基本的なフェッチ
  - [ ] フィルタパラメータ
  - [ ] エラーハンドリング
- [ ] `useCreateTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング
- [ ] `useUpdateTransaction()` テストが存在する
  - [ ] 正常系
- [ ] `useDeleteTransaction()` テストが存在する
  - [ ] 正常系
  - [ ] エラーハンドリング
- [ ] **キャッシュ無効化テスト (新規)**
  - [ ] 作成後
  - [ ] 更新後
  - [ ] 削除後
- [ ] **エラー復旧テスト (新規)**
  - [ ] フェッチエラー復旧
  - [ ] ミューテーションエラー復旧
  - [ ] エラー状態の永続化
- [ ] `useTransactionSummary()` テストが存在する
  - [ ] 計算の正確性
  - [ ] 空の取引
  - [ ] 収入のみ
- [ ] `useTransactionsByCategory()` テストが存在する
  - [ ] グループ化
  - [ ] ソート順序
- [ ] `useTransactionsByMonth()` テストが存在する
  - [ ] グループ化
  - [ ] 計算の正確性
  - [ ] クロノロジカルソート

#### src/components/PrivateRoute.test.tsx
- [ ] ファイルが存在する
- [ ] ローディング状態テストが存在する
  - [ ] 基本的なスピナー表示
  - [ ] **状態遷移テスト (新規)**
  - [ ] **タイムアウト処理 (新規)**
- [ ] 未認証時リダイレクトテストが存在する
  - [ ] ログインページへ
  - [ ] 位置情報の保存
- [ ] 認証時レンダリングテストが存在する

### テスト実行確認

- [ ] `npm test` で全テスト実行可能
- [ ] `npm run test:watch` でウォッチモード起動可能
- [ ] `npm test -- --coverage` でカバレッジレポート生成可能
- [ ] `npm test -- --ui` で UI モード起動可能
- [ ] 全テスト成功: ✅
- [ ] カバレッジが目標値以上: ✅
- [ ] テスト実行時間が 10 秒以内: ✅

---

## E2E テスト (Playwright)

### 設定ファイル

- [ ] `frontend/playwright.config.ts` が存在する
- [ ] `frontend/package.json` に `@playwright/test` が依存に含まれている

### playwright.config.ts チェック項目

```typescript
- [ ] testDir: './e2e' が設定されている
- [ ] fullyParallel: true が設定されている
- [ ] forbidOnly が設定されている
- [ ] retries が設定されている (CI で 2)
- [ ] workers が設定されている (CI で 1)
- [ ] reporter に複数設定
  - [ ] html
  - [ ] json
  - [ ] junit
- [ ] use.baseURL: 'http://localhost:5173' が設定されている
- [ ] use.trace: 'on-first-retry' が設定されている
- [ ] use.screenshot: 'only-on-failure' が設定されている
- [ ] use.video: 'retain-on-failure' が設定されている
- [ ] projects に chromium が含まれている
- [ ] webServer.command が設定されている
- [ ] timeout: 30000 が設定されている
- [ ] expect.timeout: 5000 が設定されている
- [ ] outputDir: 'test-results' が設定されている
```

### テストファイルチェック項目

#### e2e/auth.spec.ts
- [ ] ファイルが存在する
- [ ] サインアップテストが存在する
- [ ] メール確認テストが存在する
- [ ] ログインテストが存在する

#### e2e/dashboard.spec.ts
- [ ] ファイルが存在する
- [ ] ダッシュボード表示テストが存在する
- [ ] サマリー計算テストが存在する

#### e2e/navigation.spec.ts
- [ ] ファイルが存在する
- [ ] ナビゲーションテストが存在する

#### e2e/csv.spec.ts
- [ ] ファイルが存在する
- [ ] ファイルアップロードテストが存在する

#### e2e/full-flow.spec.ts (新規)
- [ ] ファイルが新規作成されている
- [ ] 以下のテストが含まれている:
  - [ ] `should complete full app flow` テスト
  - [ ] `should handle multiple transactions` テスト
  - [ ] `should handle navigation between all main sections` テスト
  - [ ] `should preserve data after page refresh` テスト

#### e2e/edge-cases.spec.ts (新規)
- [ ] ファイルが新規作成されている
- [ ] 以下のテストが含まれている:
  - [ ] ネットワークエラー処理
  - [ ] 大きい取引額処理
  - [ ] 特殊文字処理
  - [ ] 長いメモテキスト処理
  - [ ] 連続操作処理
  - [ ] 並行フィルタ操作
  - [ ] 無効な日付形式処理
  - [ ] ゼロ/負の金額処理
  - [ ] セッションタイムアウト処理
  - [ ] 不正形式 CSV インポート
  - [ ] 空の CSV ファイル処理
  - [ ] 重複送信防止
  - [ ] 日付フィルタ境界条件
  - [ ] (14 個のテストケース)

### テスト実行確認

- [ ] フロントエンド開発サーバーが実行中: `npm run dev`
- [ ] `npm run test:e2e` で全テスト実行可能
- [ ] `npm run test:e2e:ui` で UI モード起動可能
- [ ] `npm run test:e2e:debug` でデバッグモード起動可能
- [ ] 全テスト成功: ✅
- [ ] テスト実行時間が 60 秒以内: ✅

---

## ドキュメント

- [ ] `docs/TEST_SUITE_REVIEW_AND_IMPROVEMENTS.md` が存在する
- [ ] `docs/TEST_EXECUTION_GUIDE.md` が存在する
- [ ] `docs/TEST_CONFIGURATION_CHECKLIST.md` (このファイル) が存在する

---

## 統合テスト実行

### ローカル環境での最終確認

```bash
# バックエンド
cd backend
npm test           # ✅ 成功確認
npm run test:coverage  # ✅ カバレッジ確認

# フロントエンド (別ターミナル)
cd frontend
npm run dev        # 開発サーバー起動
npm test           # ✅ 成功確認
npm run test:coverage  # ✅ カバレッジ確認

# E2E テスト (別ターミナル)
cd frontend
npm run test:e2e   # ✅ 成功確認
```

### CI/CD パイプライン準備

- [ ] GitHub Actions ワークフローを作成 (オプション)
- [ ] テスト結果レポートの出力先を確認
- [ ] カバレッジレポートの出力先を確認
- [ ] 本番デプロイ前のテスト要件を定義

---

## サイン オフ

テスト設定チェックリストの完了を確認したら、以下にサインしてください:

| 役割 | 名前 | 日付 | サイン |
|------|------|------|--------|
| 開発者 | | | |
| レビュー | | | |
| QA | | | |

---

**最終更新**: 2024年1月
**バージョン**: 1.0
**ステータス**: ✅ 完了
