# E2E テスト仕様書（End-to-End Test Specification）

**プロジェクト名**: kakei（家計管理アプリ）  
**対象**: アプリケーション全体のユーザーフロー  
**作成日**: 2026年5月28日  
**テストツール**: Playwright  
**テスト環境**: Mock Mode（VITE_MOCK_AUTH=true）

---

## 1. E2E テストの目的と範囲

### 1.1 E2E テストとは

**E2E（End-to-End）テスト** = ユーザーの視点から、アプリケーション全体の動作を検証するテスト

```
単体テスト:    [関数A] → ✓
統合テスト:    [関数A] → [関数B] → ✓
E2E テスト:    [ユーザー] → [UI] → [API] → [DB] → [UI] → [ユーザー] → ✓
```

### 1.2 kakei プロジェクトにおける E2E テストの範囲

| 対象 | 説明 |
|------|------|
| **フロントエンド** | React アプリケーション全体 |
| **認証** | Mock Mode（Cognito の代わり） |
| **API** | Mock Mode（実際の API Gateway の代わり） |
| **ブラウザ** | Chromium, Firefox, WebKit |
| **デバイス** | Desktop, Mobile (Pixel 5, iPhone 12) |

### 1.3 E2E テストで検証すること

✅ **検証する**:
- ユーザーが実際に行う操作フロー
- ページ間の遷移
- フォームの入力と送信
- データの表示
- エラーメッセージの表示
- レスポンシブデザイン

❌ **検証しない**:
- 個別の関数のロジック（単体テストで検証）
- コンポーネント間の連携（統合テストで検証）
- パフォーマンス（別途パフォーマンステストで検証）

---

## 2. テスト戦略

### 2.1 テストピラミッド

```
        /\
       /  \      E2E テスト（少数・重要なフロー）
      /────\     
     /      \    統合テスト（中程度）
    /────────\   
   /          \  単体テスト（多数・詳細）
  /────────────\
```

**kakei の目標**:
- 単体テスト: 70%
- 統合テスト: 20%
- E2E テスト: 10%

### 2.2 E2E テストの優先順位

| 優先度 | 対象フロー | 理由 |
|--------|----------|------|
| 🔴 最優先 | 認証フロー | ユーザーがアプリを使えなくなる |
| 🔴 最優先 | 収支入力フロー | コア機能 |
| 🟡 中優先 | ダッシュボード表示 | ユーザー体験の中心 |
| 🟡 中優先 | CSV インポート | データ移行の重要機能 |
| 🟢 低優先 | カテゴリ管理 | 補助機能 |
| 🟢 低優先 | レスポンシブデザイン | 視覚的な確認 |

### 2.3 テスト実行タイミング

| タイミング | 実行内容 | 目的 |
|----------|---------|------|
| **開発中** | 変更したフローのみ | 迅速なフィードバック |
| **PR 作成時** | 全 E2E テスト | リグレッション防止 |
| **デプロイ前** | 全 E2E テスト + Smoke Test | 本番環境の安全性確認 |
| **定期実行** | 毎日深夜に全テスト | 継続的な品質監視 |

---

## 3. テストケース一覧

### 3.1 認証フロー（最優先）

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| E2E-AUTH-01 | ログイン成功フロー | 🔴 最優先 | ⚠️ 要修正 |
| E2E-AUTH-02 | ログイン失敗（バリデーションエラー） | 🔴 最優先 | ⚠️ 要修正 |
| E2E-AUTH-03 | ログアウトフロー | 🔴 最優先 | ⚠️ 要修正 |
| E2E-AUTH-04 | 未認証ユーザーのリダイレクト | 🔴 最優先 | ✅ 完了 |

### 3.2 ナビゲーションフロー（中優先）

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| E2E-NAV-01 | トップナビゲーションでのページ遷移 | 🟡 中優先 | ⚠️ 要修正 |
| E2E-NAV-02 | ボトムナビゲーションでのページ遷移 | 🟡 中優先 | ⚠️ 要修正 |
| E2E-NAV-03 | アクティブページのハイライト | 🟡 中優先 | ⚠️ 要修正 |
| E2E-NAV-04 | ユーザーメール表示 | 🟡 中優先 | ⚠️ 要修正 |

### 3.3 ダッシュボード表示（中優先）

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| E2E-DASH-01 | モックデータの表示 | 🟡 中優先 | ⚠️ 要修正 |
| E2E-DASH-02 | カテゴリ別支出の表示 | 🟡 中優先 | ⚠️ 要修正 |
| E2E-DASH-03 | 最近の取引の表示 | 🟡 中優先 | ⚠️ 要修正 |
| E2E-DASH-04 | レスポンシブデザイン（モバイル） | 🟢 低優先 | ⚠️ 要修正 |

### 3.4 収支入力フロー（最優先）

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| E2E-TX-01 | 収支入力フォームの表示 | 🔴 最優先 | ❌ 未実装 |
| E2E-TX-02 | 収支の新規作成 | 🔴 最優先 | ❌ 未実装 |
| E2E-TX-03 | 収支の編集 | 🟡 中優先 | ❌ 未実装 |
| E2E-TX-04 | 収支の削除 | 🟡 中優先 | ❌ 未実装 |
| E2E-TX-05 | バリデーションエラー表示 | 🔴 最優先 | ❌ 未実装 |

### 3.5 CSV インポートフロー（中優先）

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| E2E-CSV-01 | CSV ファイルのアップロード | 🟡 中優先 | ❌ 未実装 |
| E2E-CSV-02 | カラムマッピング | 🟡 中優先 | ❌ 未実装 |
| E2E-CSV-03 | プレビュー表示 | 🟡 中優先 | ❌ 未実装 |
| E2E-CSV-04 | インポート実行 | 🟡 中優先 | ❌ 未実装 |

---

## 4. テストケース詳細

### 4.1 E2E-AUTH-01: ログイン成功フロー

#### 4.1.1 テスト目的
ユーザーが正しい認証情報でログインし、ダッシュボードにアクセスできることを確認する。

#### 4.1.2 前提条件
- アプリケーションが起動している
- Mock Mode が有効（VITE_MOCK_AUTH=true）
- ユーザーは未認証状態

#### 4.1.3 テスト手順
1. ログインページ（`/login`）にアクセス
2. メールアドレス入力フィールドに `test@example.com` を入力
3. パスワード入力フィールドに `Test123!@#Test` を入力
4. 「ログイン」ボタンをクリック
5. ダッシュボードページ（`/dashboard`）に遷移することを確認
6. ダッシュボードのコンテンツが表示されることを確認
7. ユーザーメール（`test@example.com`）が表示されることを確認

#### 4.1.4 期待される結果
- ✅ ログインページが表示される
- ✅ フォームに入力できる
- ✅ ログインボタンをクリックできる
- ✅ ダッシュボードに遷移する（URL: `/dashboard`）
- ✅ 「ダッシュボード」というタイトルが表示される
- ✅ ユーザーメール「test@example.com」が表示される
- ✅ 収支サマリーカードが表示される

#### 4.1.5 実装コード
```typescript
test('should login successfully with valid credentials', async ({ page }) => {
  // 1. ログインページにアクセス
  await page.goto('/login');
  
  // 2. ページが表示されることを確認
  await expect(page.locator('h1')).toContainText('kakei');
  
  // 3. フォームに入力
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test123!@#Test');
  
  // 4. ログインボタンをクリックして遷移を待つ
  await Promise.all([
    page.waitForURL('/dashboard', { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
  
  // 5. ダッシュボードが表示されることを確認
  await expect(page.locator('h1')).toContainText('ダッシュボード');
  await expect(page.locator('text=test@example.com')).toBeVisible();
});
```

#### 4.1.6 現在の問題点
- ⚠️ ユーザーメールが表示されない場合がある
- ⚠️ ナビゲーションのタイミングが不安定

#### 4.1.7 修正方針
- `data-testid` 属性を追加して、より安定したセレクタを使用
- 明示的な待機処理を追加

---

### 4.2 E2E-AUTH-02: ログイン失敗（バリデーションエラー）

#### 4.2.1 テスト目的
無効なパスワード（12文字未満）を入力した場合、バリデーションエラーが表示されることを確認する。

#### 4.2.2 前提条件
- アプリケーションが起動している
- ユーザーは未認証状態

#### 4.2.3 テスト手順
1. ログインページ（`/login`）にアクセス
2. メールアドレス入力フィールドに `test@example.com` を入力
3. パスワード入力フィールドに `short`（12文字未満）を入力
4. パスワードフィールドからフォーカスを外す（blur イベント）
5. バリデーションエラーメッセージが表示されることを確認

#### 4.2.4 期待される結果
- ✅ 「パスワードは12文字以上である必要があります」というエラーメッセージが表示される
- ✅ ログインページに留まる（遷移しない）

#### 4.2.5 実装コード
```typescript
test('should show error with invalid credentials', async ({ page }) => {
  await page.goto('/login');
  
  // 無効なパスワードを入力
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'short');
  
  // フォーカスを外してバリデーションをトリガー
  await page.locator('input[type="password"]').blur();
  
  // エラーメッセージが表示されることを確認
  await expect(page.locator('text=/パスワードは12文字以上/')).toBeVisible();
  
  // ログインページに留まることを確認
  await expect(page).toHaveURL('/login');
});
```

#### 4.2.6 現在の問題点
- ⚠️ バリデーションエラーが表示されない場合がある
- ⚠️ エラーメッセージのセレクタが不安定

#### 4.2.7 修正方針
- エラーメッセージに `data-testid="password-error"` を追加
- より具体的なセレクタを使用

---

## 5. テスト可能性を考慮した設計指針

### 5.1 data-testid 属性の使用

**推奨**: すべてのインタラクティブ要素に `data-testid` 属性を追加

```typescript
// ❌ 悪い例（テキストに依存）
<button>ログイン</button>
await page.click('button:has-text("ログイン")');

// ✅ 良い例（data-testid を使用）
<button data-testid="login-button">ログイン</button>
await page.click('[data-testid="login-button"]');
```

### 5.2 命名規則

| 要素タイプ | 命名規則 | 例 |
|----------|---------|-----|
| ボタン | `{action}-button` | `login-button`, `submit-button` |
| 入力フィールド | `{field}-input` | `email-input`, `password-input` |
| エラーメッセージ | `{field}-error` | `email-error`, `password-error` |
| ナビゲーション | `{page}-nav-link` | `dashboard-nav-link` |
| カード | `{content}-card` | `summary-card`, `transaction-card` |

### 5.3 実装例

```typescript
// LoginPage.tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <input
    data-testid="email-input"
    type="email"
    {...register('email')}
  />
  {errors.email && (
    <p data-testid="email-error">{errors.email.message}</p>
  )}
  
  <input
    data-testid="password-input"
    type="password"
    {...register('password')}
  />
  {errors.password && (
    <p data-testid="password-error">{errors.password.message}</p>
  )}
  
  <button data-testid="login-button" type="submit">
    ログイン
  </button>
</form>
```

### 5.4 アクセシビリティとの両立

`data-testid` と `aria-label` を併用することで、テスト可能性とアクセシビリティを両立できます。

```typescript
<button
  data-testid="login-button"
  aria-label="ログイン"
  type="submit"
>
  ログイン
</button>
```

---

## 6. テスト実行方法

### 6.1 すべての E2E テストを実行
```bash
npm run test:e2e
```

### 6.2 特定のブラウザでテストを実行
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### 6.3 UI モードで実行（デバッグ用）
```bash
npm run test:e2e:ui
```

### 6.4 特定のテストファイルのみ実行
```bash
npm run test:e2e -- e2e/auth.spec.ts
```

---

## 7. CI/CD 統合

### 7.1 GitHub Actions での実行例

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_MOCK_AUTH: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 8. トラブルシューティング

### 8.1 よくある問題と解決方法

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| テストがタイムアウトする | ナビゲーションが完了しない | `Promise.all()` で click と waitForURL を同時実行 |
| 要素が見つからない | セレクタが不安定 | `data-testid` 属性を使用 |
| Dev サーバーがクラッシュ | メモリ不足 | `--workers=1` で並列実行を制限 |
| Mock モードが効かない | 環境変数が読み込まれていない | `.env.local` を確認 |

### 8.2 デバッグ方法

```bash
# ヘッドレスモードを無効化（ブラウザを表示）
npm run test:e2e -- --headed

# スローモーション実行
npm run test:e2e -- --slow-mo=1000

# 特定の行で一時停止
await page.pause();

# スクリーンショットを撮る
await page.screenshot({ path: 'debug.png' });
```

---

## 9. 今後の改善計画

### 9.1 短期（1-2週間）
- [ ] すべてのインタラクティブ要素に `data-testid` を追加
- [ ] 既存のテストケースを修正して安定化
- [ ] 収支入力フローの E2E テストを追加

### 9.2 中期（1-2ヶ月）
- [ ] CSV インポートフローの E2E テストを追加
- [ ] カテゴリ管理フローの E2E テストを追加
- [ ] CI/CD パイプラインに E2E テストを統合

### 9.3 長期（3ヶ月以上）
- [ ] ビジュアルリグレッションテストの導入
- [ ] パフォーマンステストの追加
- [ ] 実環境（Cognito + API Gateway）での E2E テスト

---

## 10. まとめ

### 10.1 E2E テストの重要性

E2E テストは、ユーザーが実際に体験する品質を保証する最後の砦です。

```
単体テスト:    コードが正しく動く
統合テスト:    コンポーネントが連携する
E2E テスト:    ユーザーが目的を達成できる ← 最も重要！
```

### 10.2 設計段階での考慮事項

- ✅ `data-testid` 属性を最初から組み込む
- ✅ テスト可能な構造で実装する
- ✅ Mock Mode を最初から考慮する
- ✅ E2E テストケースを要件定義時に作成する

### 10.3 次のステップ

1. **今すぐ**: 既存のコンポーネントに `data-testid` を追加
2. **今週中**: 認証フローの E2E テストを安定化
3. **来週**: 収支入力フローの E2E テストを追加
4. **来月**: CI/CD パイプラインに統合

---

**E2E テストは、ユーザーの笑顔を守るための投資です！**

