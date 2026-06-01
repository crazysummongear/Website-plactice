# E2E テスト修正フロー

**目的**: Playwright E2E テスト失敗時の根本原因分析と修正を体系的に実施する

**対象**: React + Playwright を使用したフロントエンドプロジェクト

**実行時間**: 30-60分（テスト数による）

---

## 前提条件

- Playwright v1.60.0 以上がインストール済み
- E2E テストが `frontend/e2e/` に配置されている
- `frontend/playwright.config.ts` が設定済み
- `frontend/package.json` に `"test:e2e": "playwright test"` が定義されている

---

## フロー

### Phase 1: テスト実行と失敗分析（10分）

#### 1.1 テスト実行
```bash
cd frontend
npm run test:e2e
```

**確認項目**:
- [ ] テスト総数
- [ ] 失敗テスト数
- [ ] 失敗パターン（タイムアウト、要素見つからない、アサーション失敗など）

#### 1.2 失敗パターン分類

失敗を以下のカテゴリに分類：

| パターン | 原因 | 対処方法 |
|---------|------|--------|
| `Timeout waiting for selector` | 要素が表示されない | Phase 2 へ |
| `Element is not visible` | 要素がビューポート外 | Phase 3 へ |
| `Assertion failed` | ロジック・状態エラー | Phase 4 へ |
| `Navigation timeout` | ページ遷移失敗 | Phase 5 へ |

#### 1.3 失敗テストの詳細ログ確認
```bash
# Playwright レポートを開く
npx playwright show-report
```

**確認項目**:
- [ ] スクリーンショット（失敗時の UI 状態）
- [ ] ビデオ（操作の流れ）
- [ ] ブラウザコンソールエラー
- [ ] ネットワークエラー

---

### Phase 2: 要素表示タイムアウト問題の分析（15分）

**症状**: `Timeout waiting for selector '[data-testid="..."]'`

#### 2.1 要素の data-testid 確認

対象コンポーネントを開く：
```bash
# 例: LoginPage.tsx
code frontend/src/pages/LoginPage.tsx
```

**チェックリスト**:
- [ ] `data-testid` が正しく付与されているか
- [ ] セレクタ名が `{feature}-{element}` 形式か
- [ ] 要素が条件付きレンダリング（`{condition && <button>}`）されていないか

#### 2.2 ローディング状態の確認

`useAuth` フックの loading 状態を確認：
```typescript
// frontend/src/hooks/useAuth.ts
const { isAuthenticated, loading } = useAuth();

// ボタンが disabled になっているか確認
if (loading) return <Spinner />;
```

**チェックリスト**:
- [ ] `loading` 状態が正しく管理されているか
- [ ] ボタンが `disabled={loading}` に設定されているか
- [ ] テストで `toBeEnabled()` で待機しているか

#### 2.3 テストの待機ロジック修正

**修正例**:
```typescript
// ❌ 不十分
await page.click('[data-testid="login-button"]');

// ✅ 正しい
await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();
await page.click('[data-testid="login-button"]');
```

**修正手順**:
1. テストファイルを開く
2. クリック前に `toBeEnabled()` で待機を追加
3. テスト再実行

---

### Phase 3: 要素表示位置の問題分析（15分）

**症状**: `Element is not visible` または `Element is outside of the viewport`

#### 3.1 UI 特性の確認

対象コンポーネントを開く：
```bash
# 例: BottomNavigation.tsx
code frontend/src/components/BottomNavigation.tsx
```

**チェックリスト**:
- [ ] `position: fixed` が設定されているか
- [ ] `position: sticky` が設定されているか
- [ ] `z-index` が十分か
- [ ] モーダル・オーバーレイが背景にあるか

#### 3.2 position: fixed 要素の対処

**修正例**:
```typescript
// ❌ ビューポート外でタイムアウト
await page.click('[data-testid="transactions-nav-button"]');

// ✅ dispatchEvent を使用
await page.locator('[data-testid="transactions-nav-button"]').dispatchEvent('click');
```

#### 3.3 スクロール後のクリック

**修正例**:
```typescript
// スクロール後にクリック
await page.locator('body').evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.click('[data-testid="element"]');
```

---

### Phase 4: ロジック・状態エラーの分析（20分）

**症状**: `Assertion failed` または `Expected X but got Y`

#### 4.1 状態管理の確認

**チェックリスト**:
- [ ] Context が正しく初期化されているか
- [ ] Provider が App.tsx のルートに配置されているか
- [ ] 複数の Hook インスタンスが生成されていないか

**確認コマンド**:
```bash
# useAuth の複数インスタンス問題を検出
grep -r "useAuth" frontend/src --include="*.tsx" | grep -v "useAuthContext"
```

#### 4.2 Hook の二重インスタンス問題の修正

**問題パターン**:
```typescript
// ❌ 禁止（AuthProvider が管理しているのに直接呼び出し）
import { useAuth } from '../hooks/useAuth';
const { isAuthenticated } = useAuth();

// ✅ 正しい（Context から取得）
import { useAuthContext } from '../context/AuthContext';
const { isAuthenticated } = useAuthContext();
```

**修正手順**:
1. `useAuth` の直接呼び出しを検索
2. `useAuthContext` に置き換え
3. テスト再実行

#### 4.3 ライブラリ互換性の確認

**チェックリスト**:
- [ ] `@hookform/resolvers` のバージョンは？
- [ ] `zod` のバージョンは？
- [ ] エラーオブジェクト形式は正しいか

**確認コマンド**:
```bash
npm list @hookform/resolvers zod
```

**互換性テスト**:
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

---

### Phase 5: ページ遷移失敗の分析（15分）

**症状**: `Navigation timeout` または `waitForURL timeout`

#### 5.1 ページ遷移の確認

**チェックリスト**:
- [ ] ルーティングが正しく設定されているか
- [ ] PrivateRoute が正しく機能しているか
- [ ] リダイレクトロジックが正しいか

#### 5.2 コンテンツ表示待機の修正

**修正例**:
```typescript
// ❌ URL だけでは不十分
await page.waitForURL('/dashboard');

// ✅ コンテンツが表示されるまで待機
await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 15000 });
```

#### 5.3 非同期処理の完了待機

**修正例**:
```typescript
// API 呼び出し完了を待機
await page.waitForResponse(response => 
  response.url().includes('/transactions') && response.status() === 200
);
```

---

## チェックリスト

実施前に確認：
- [ ] テスト環境が正常に動作しているか
- [ ] 最新のコードが checkout されているか
- [ ] 依存パッケージが最新か（`npm install`）

実施後に確認：
- [ ] すべてのテストが通過したか
- [ ] 修正内容をコミットしたか
- [ ] 修正内容をドキュメント化したか

---

## トラブルシューティング

| 問題 | 原因 | 解決方法 |
|------|------|--------|
| テストが不安定 | タイミング問題 | `waitFor` の timeout を増やす |
| Mock が機能しない | 環境変数未設定 | `.env.test` を確認 |
| ブラウザが起動しない | Playwright 未インストール | `npx playwright install` |

---

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev)
- `docs/engineering-standards.md` - E2E テスト実装ルール
- `frontend/E2E_TESTING_GUIDE.md` - プロジェクト固有のガイド

---

**最終更新**: 2026年5月30日
