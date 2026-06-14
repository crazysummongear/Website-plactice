# テスト実行ガイド

テストスイート全体の実行方法、トラブルシューティング、ベストプラクティスについて説明します。

---

## 1. セットアップ

### 前提条件
- Node.js v18+ がインストール済み
- npm または yarn がインストール済み

### 依存パッケージのインストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd frontend
npm install
```

---

## 2. バックエンド テスト (Jest)

### 2.1 全テスト実行

```bash
cd backend
npm test
```

**出力例**:
```
PASS  src/lib/auth.test.ts
PASS  src/lib/response.test.ts
PASS  src/lib/dynamo.test.ts
PASS  src/handlers/categories.test.ts
PASS  src/handlers/transactions.test.ts
PASS  src/handlers/csv-import.test.ts

Test Suites: 6 passed, 6 total
Tests:       65 passed, 65 total
Time:        8.234s
```

### 2.2 Watch モード（ファイル変更を自動検知）

```bash
cd backend
npm run test:watch
```

**使用方法**:
- `a`: 全テスト実行
- `p`: パターンでテストフィルタリング
- `t`: テストネームでフィルタリング
- `q`: 終了

### 2.3 カバレッジレポート

```bash
cd backend
npm run test:coverage
```

**出力**:
```
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
-----------|---------|----------|---------|---------|-------------------
All files  |   87.5  |   83.2   |   90.1  |   87.3  |
-----------|---------|----------|---------|---------|-------------------
```

### 2.4 特定テストファイルのみ実行

```bash
# 特定ファイル
npm test auth.test.ts

# パターンマッチ
npm test handlers
```

### 2.5 特定テストケースのみ実行

テストコードで `.only` を使用:
```typescript
describe('auth.ts', () => {
  it.only('should extract user ID from valid event', () => {
    // このテストのみ実行
  });
});
```

---

## 3. フロントエンド テスト (Vitest)

### 3.1 全テスト実行

```bash
cd frontend
npm test
```

**出力例**:
```
✓ src/api/auth.test.ts (8)
✓ src/api/transactions.test.ts (15)
✓ src/api/csv.test.ts (8)
✓ src/hooks/useAuth.test.ts (12)
✓ src/hooks/useTransactions.test.ts (20)
✓ src/components/PrivateRoute.test.tsx (5)

Test Files  6 passed (6)
     Tests  85 passed (85)
      Time  9.123s
```

### 3.2 Watch モード

```bash
cd frontend
npm run test:watch
```

**機能**:
- ファイル保存時に自動でテスト実行
- 失敗したテストのみ再実行
- `u`: スナップショット更新
- `d`: デバッグモード

### 3.3 カバレッジレポート

```bash
cd frontend
npm test -- --coverage
```

**HTML レポート表示**:
```bash
# coverage/index.html をブラウザで開く
```

### 3.4 UI モード（ブラウザで実行結果確認）

```bash
cd frontend
npm test -- --ui
```

### 3.5 デバッグモード

```bash
cd frontend
npm test -- --inspect-brk --inspect
```

---

## 4. E2E テスト (Playwright)

### 4.1 前提条件

フロントエンドが実行中である必要があります:
```bash
cd frontend
npm run dev
```

別のターミナルでテスト実行:

### 4.2 全 E2E テスト実行

```bash
cd frontend
npm run test:e2e
```

### 4.3 UI モード（対話的実行）

```bash
cd frontend
npm run test:e2e:ui
```

**機能**:
- テストをステップバイステップで実行
- 各ステップの画面キャプチャ確認
- エラー時のビジュアルデバッグ

### 4.4 デバッグモード

```bash
cd frontend
npm run test:e2e:debug
```

### 4.5 特定テストのみ実行

```bash
cd frontend
npm run test:e2e -- e2e/auth.spec.ts

npm run test:e2e -- -g "Full User Flow"
```

### 4.6 特定ブラウザで実行

```bash
cd frontend
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### 4.7 テスト結果レポート確認

```bash
cd frontend
npx playwright show-report
```

---

## 5. CI/CD パイプラインでの実行

### GitHub Actions 例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci && npm test -- --coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run build
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## 6. トラブルシューティング

### 6.1 "Cannot find module" エラー

**原因**: 依存パッケージが未インストール
```bash
cd backend # or frontend
npm install
npm ci  # 本番環境ではこちら
```

### 6.2 テストがタイムアウト

**原因**: テスト時間が設定値を超えた

**解決方法**:
```typescript
// テストレベルで設定
it('slow test', async () => {
  // ...
}, 20000); // 20 秒に拡張

// グローバルで設定
// jest.config.js の testTimeout を調整
testTimeout: 30000
```

### 6.3 "Port 3000 is already in use"

```bash
# ポートを確認
lsof -i :3000

# プロセスをキル
kill -9 <PID>
```

### 6.4 モックが機能しない

```typescript
// モック内の実装を確認
vi.mocked(someFunction).mockResolvedValue(value);

// モックが呼ばれたか確認
expect(vi.mocked(someFunction)).toHaveBeenCalled();
```

### 6.5 E2E テストがブラウザを起動しない

```bash
# Playwright ブラウザ再インストール
npx playwright install

# Headless 以外で実行してみる
npm run test:e2e -- --headed
```

---

## 7. ベストプラクティス

### 7.1 テスト駆動開発 (TDD)

1. テストを先に書く
2. 最小限の実装でテストをパス
3. リファクタリング

```typescript
// ❌ 悪い例: テストなし実装
function calculateBalance(transactions) {
  // 実装
}

// ✅ 良い例: テスト先行
describe('calculateBalance', () => {
  it('should return 0 for empty transactions', () => {
    expect(calculateBalance([])).toBe(0);
  });
});
```

### 7.2 テストの独立性

```typescript
// ❌ 悪い例: テスト間の依存
let userId;
beforeAll(() => {
  userId = createUser(); // グローバル状態
});

// ✅ 良い例: 各テストで独立
beforeEach(() => {
  const userId = createUser();
});
```

### 7.3 わかりやすい テスト名

```typescript
// ❌ 悪い例
it('works', () => { ... });

// ✅ 良い例
it('should calculate total income correctly when given expense and income transactions', () => { ... });
```

### 7.4 エッジケースのカバー

```typescript
describe('processAmount', () => {
  it('should handle positive amounts', () => { ... });
  it('should handle negative amounts', () => { ... });
  it('should handle zero', () => { ... });
  it('should handle null/undefined', () => { ... });
});
```

### 7.5 カバレッジ意識

```bash
# カバレッジをチェック
npm run test:coverage

# 未カバーの行を見つける
# HTML レポート: coverage/index.html をブラウザで開く
```

---

## 8. パフォーマンス最適化

### 8.1 テスト実行時間短縮

```typescript
// ❌ 遅い
vi.useFakeTimers(); // 全タイマーをモック

// ✅ 速い
vi.useFakeTimers({ shouldAdvanceTime: true }); // 必要な部分のみ
```

### 8.2 並列実行

```bash
# Jest (デフォルトで並列)
npm test

# Vitest (並列ワーカー数指定)
npm test -- --threads --isolate
```

### 8.3 不要なテストのスキップ

```typescript
// 一時的にスキップ
it.skip('slow test', () => { ... });

// 本番環境ではスキップ
it.runIf(process.env.CI)('slow test', () => { ... });
```

---

## 9. テスト統計

### 現在の状態

```
バックエンド:
- テストスイート: 6 個
- テストケース: 65 個
- 平均実行時間: 8 秒
- 平均カバレッジ: 87%

フロントエンド:
- テストスイート: 6 個
- テストケース: 85 個
- 平均実行時間: 9 秒
- 平均カバレッジ: 82%

E2E テスト:
- テストスイート: 6 個
- テストケース: 25+ 個
- 平均実行時間: 60 秒
- 環境: Chromium, Firefox, WebKit (オプション)
```

### 目標

```
3 ヶ月後:
- テストケース: 150+ 個
- 平均カバレッジ: 90%
- 実行時間: 10 秒以内 (ユニット)
- 本番デプロイ前テスト成功率: 99%+
```

---

## 10. よくある質問 (FAQ)

### Q1: テストの実行順序は？

**A**: ファイル名でソートされます。実行順序に依存しないようにしてください。

### Q2: 外部 API をテストしたい

**A**: `vi.mock()` 或いは `jest.mock()` を使用してモックします。

### Q3: データベーステストはどうする？

**A**: メモリ内データベース (SQLite in-memory) またはテスト専用 DB を使用します。

### Q4: E2E テスト実行が遅い

**A**: テスト数を減らすか、並列実行を設定するか、クラウド実行を検討してください。

### Q5: CI で E2E テストが失敗する

**A**: ヘッドレス環境での動作を確認してください。

---

## 11. リソース

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

---

**最終更新**: 2024年1月
**メンテナー**: 開発チーム
