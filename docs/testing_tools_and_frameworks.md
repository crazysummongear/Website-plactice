# テストツール・フレームワーク完全ガイド

**プロジェクト名**: kakei（家計管理アプリ）  
**作成日**: 2026年5月30日  
**目的**: プロジェクトで使用するテストツール・フレームワークの詳細説明

---

## 目次

1. [テストツール・フレームワーク一覧](#テストツールフレームワーク一覧)
2. [単体テスト（Unit Test）](#単体テストunit-test)
3. [統合テスト（Integration Test）](#統合テストintegration-test)
4. [E2E テスト（End-to-End Test）](#e2e-テストend-to-end-test)
5. [テスト実行方法](#テスト実行方法)
6. [CI/CD 統合](#cicd-統合)
7. [トラブルシューティング](#トラブルシューティング)

---

## テストツール・フレームワーク一覧

### 全体構成

| レイヤー | ツール | バージョン | 用途 |
|---------|--------|----------|------|
| **単体テスト** | Vitest | 1.0.0+ | バックエンド・フロントエンド関数テスト |
| **統合テスト** | React Testing Library | 14.0.0+ | React コンポーネント統合テスト |
| **E2E テスト** | Playwright | 1.40.0+ | ユーザーフロー全体テスト |
| **テストランナー** | npm scripts | - | テスト実行管理 |
| **カバレッジ** | Vitest Coverage | - | コードカバレッジ測定 |

### テストピラミッド

```
        /\
       /  \      E2E テスト（10%）
      /────\     Playwright
     /      \    
    /────────\   統合テスト（20%）
   /          \  React Testing Library
  /────────────\ 
 /              \ 単体テスト（70%）
/────────────────\ Vitest
```

---

## 単体テスト（Unit Test）

### 1.1 Vitest について

**Vitest** は、Vite ベースの高速な単体テストフレームワークです。

#### 特徴

- ⚡ **高速**: Vite の高速ビルドを活用
- 🔄 **HMR 対応**: ホットモジュールリロード対応
- 📊 **カバレッジ**: 組み込みカバレッジ測定
- 🎯 **Jest 互換**: Jest の API と互換性あり
- 🧪 **スナップショット**: スナップショットテスト対応

#### インストール

```bash
npm install -D vitest @vitest/ui
```

#### 設定ファイル（vitest.config.ts）

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 1.2 単体テストの例

#### バックエンド関数テスト

```typescript
// backend/src/lib/dynamo.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoHelper } from './dynamo';

describe('DynamoHelper', () => {
  let helper: DynamoHelper;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      send: vi.fn(),
    };
    helper = new DynamoHelper(mockClient);
  });

  it('should put item successfully', async () => {
    const item = { id: '123', name: 'Test' };
    mockClient.send.mockResolvedValue({});

    await helper.put('TestTable', item);

    expect(mockClient.send).toHaveBeenCalled();
  });

  it('should query items with filter', async () => {
    mockClient.send.mockResolvedValue({
      Items: [{ id: '123' }],
    });

    const result = await helper.query('TestTable', 'USER#123');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
  });
});
```

#### フロントエンド関数テスト

```typescript
// frontend/src/utils/formatCurrency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('should format positive number', () => {
    expect(formatCurrency(1000)).toBe('¥1,000');
    expect(formatCurrency(1000000)).toBe('¥1,000,000');
  });

  it('should format negative number', () => {
    expect(formatCurrency(-1000)).toBe('-¥1,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('¥0');
  });
});
```

### 1.3 単体テスト実行

```bash
# すべての単体テストを実行
npm run test:unit

# 特定のファイルのみ実行
npm run test:unit -- src/utils/formatCurrency.test.ts

# ウォッチモードで実行
npm run test:unit -- --watch

# カバレッジレポート生成
npm run test:unit -- --coverage

# UI モードで実行
npm run test:unit -- --ui
```

---

## 統合テスト（Integration Test）

### 2.1 React Testing Library について

**React Testing Library** は、React コンポーネントをユーザーの視点からテストするライブラリです。

#### 特徴

- 👤 **ユーザー視点**: ユーザーが見る動作をテスト
- 🎯 **アクセシビリティ**: アクセシビリティ属性を活用
- 🔍 **DOM クエリ**: 実際の DOM を操作
- 🧪 **非同期対応**: async/await 対応

#### インストール

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### セットアップ（src/test/setup.ts）

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// クリーンアップ
afterEach(() => {
  cleanup();
});

// Mock Mode の設定
process.env.VITE_MOCK_AUTH = 'true';
```

### 2.2 統合テストの例

#### ログインフォームテスト

```typescript
// frontend/src/pages/LoginPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  });

  it('should render login form', () => {
    expect(screen.getByText('kakei')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'short');
    await user.click(screen.getByTestId('password-input')); // Focus
    await user.tab(); // Blur

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toHaveTextContent('パスワードは12文字以上');
    });
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'Test123!@#Test');
    await user.click(screen.getByTestId('login-button'));

    // ナビゲーションが発生することを確認
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

#### ダッシュボードコンポーネントテスト

```typescript
// frontend/src/pages/DashboardPage.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    render(<DashboardPage />);
  });

  it('should display dashboard title', () => {
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('ダッシュボード');
  });

  it('should display summary cards', () => {
    expect(screen.getByTestId('income-card')).toBeInTheDocument();
    expect(screen.getByTestId('expense-card')).toBeInTheDocument();
    expect(screen.getByTestId('balance-card')).toBeInTheDocument();
  });

  it('should display category breakdown', () => {
    expect(screen.getByTestId('category-breakdown')).toBeInTheDocument();
  });

  it('should display recent transactions', () => {
    expect(screen.getByTestId('recent-transactions')).toBeInTheDocument();
  });
});
```

### 2.3 統合テスト実行

```bash
# すべての統合テストを実行
npm run test:integration

# 特定のファイルのみ実行
npm run test:integration -- src/pages/LoginPage.test.tsx

# ウォッチモードで実行
npm run test:integration -- --watch

# カバレッジレポート生成
npm run test:integration -- --coverage
```

---

## E2E テスト（End-to-End Test）

### 3.1 Playwright について

**Playwright** は、複数のブラウザでユーザーフロー全体をテストするツールです。

#### 特徴

- 🌐 **マルチブラウザ**: Chromium、Firefox、WebKit 対応
- 📱 **デバイスエミュレーション**: モバイルデバイスのテスト対応
- 🎬 **ビデオ録画**: テスト実行の動画記録
- 📸 **スクリーンショット**: 失敗時の自動スクリーンショット
- 🔍 **デバッグ**: UI モードでのインタラクティブデバッグ

#### インストール

```bash
npm install -D @playwright/test
npx playwright install
```

#### 設定ファイル（playwright.config.ts）

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.2 E2E テストの例

詳細は `docs/e2e_test_specification.md` を参照してください。

```typescript
// frontend/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#Test');
    
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('[data-testid="login-button"]'),
    ]);
    
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('ダッシュボード');
  });
});
```

### 3.3 E2E テスト実行

```bash
# すべての E2E テストを実行
npm run test:e2e

# 特定のブラウザでテスト実行
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox

# UI モードで実行（デバッグ用）
npm run test:e2e:ui

# 特定のテストファイルのみ実行
npm run test:e2e -- e2e/auth.spec.ts

# ヘッドレスモード無効化（ブラウザ表示）
npm run test:e2e -- --headed

# スローモーション実行
npm run test:e2e -- --slow-mo=1000
```

---

## テスト実行方法

### 4.1 npm scripts

#### package.json の設定

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:integration": "vitest run --include='**/*.integration.test.ts'",
    "test:integration:watch": "vitest --include='**/*.integration.test.ts'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 4.2 テスト実行フロー

```bash
# 開発中：ウォッチモードで単体テスト
npm run test:unit:watch

# PR 作成前：全テスト実行
npm run test

# デバッグ時：E2E テスト UI モード
npm run test:e2e:ui

# カバレッジ確認
npm run test:coverage
```

---

## CI/CD 統合

### 5.1 GitHub Actions での実行

```yaml
name: Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## トラブルシューティング

### 6.1 よくある問題

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| テストがタイムアウト | ナビゲーション遅延 | `Promise.all()` で click と waitForURL を同時実行 |
| 要素が見つからない | セレクタが不安定 | `data-testid` 属性を使用 |
| Mock Mode が効かない | 環境変数未設定 | `.env.local` に `VITE_MOCK_AUTH=true` を設定 |
| Playwright ブラウザエラー | ブラウザ未インストール | `npx playwright install` を実行 |
| メモリ不足 | 並列実行数が多い | `--workers=1` で並列実行を制限 |

### 6.2 デバッグ方法

```bash
# Playwright デバッグモード
npm run test:e2e:debug

# Vitest UI モード
npm run test:unit:ui

# スクリーンショット確認
# playwright-report/index.html を開く

# ビデオ確認
# playwright-report/data/*.webm を確認
```

---

## ベストプラクティス

### 7.1 テスト設計の原則

1. **テストピラミッド**: 単体テスト 70% → 統合テスト 20% → E2E テスト 10%
2. **独立性**: テスト間に依存関係を持たせない
3. **再現性**: 同じ条件で常に同じ結果
4. **速度**: テストは迅速に実行
5. **明確性**: テストの意図が明確

### 7.2 命名規則

```typescript
// ✅ 良い例
describe('LoginPage', () => {
  it('should display validation error when password is too short', () => {
    // ...
  });
});

// ❌ 悪い例
describe('LoginPage', () => {
  it('test password validation', () => {
    // ...
  });
});
```

### 7.3 data-testid の使用

```typescript
// ✅ 推奨
<button data-testid="login-button">ログイン</button>
await page.click('[data-testid="login-button"]');

// ❌ 非推奨
<button>ログイン</button>
await page.click('button:has-text("ログイン")');
```

---

## まとめ

### テストツール選択基準

| 用途 | ツール | 理由 |
|------|--------|------|
| 関数・ロジック | Vitest | 高速、Jest 互換 |
| React コンポーネント | React Testing Library | ユーザー視点、アクセシビリティ |
| ユーザーフロー全体 | Playwright | マルチブラウザ、デバイスエミュレーション |

### 推奨される実行順序

1. **開発中**: `npm run test:unit:watch` で単体テスト
2. **コミット前**: `npm run test` で全テスト
3. **PR 作成時**: GitHub Actions で自動実行
4. **デプロイ前**: 本番環境での E2E テスト

---

**最終更新**: 2026年5月30日

