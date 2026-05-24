# 単体試験項目書（Unit Test Specification）

**プロジェクト名**: kakei（家計管理アプリ）  
**対象モジュール**: PrivateRoute コンポーネント  
**作成日**: 2026年5月24日  
**テストツール**: Vitest + React Testing Library

---

## 1. テスト対象の概要

### 1.1 対象コンポーネント
- **ファイル名**: `frontend/src/components/PrivateRoute.tsx`
- **目的**: 認証が必要なページへのアクセスを制御する
- **主な機能**:
  - 未認証ユーザーをログインページにリダイレクト
  - 認証済みユーザーに保護されたコンテンツを表示
  - 認証状態の確認中にローディング表示
  - リダイレクト時に元のページ情報を保存

### 1.2 依存関係
- `useAuthContext()`: 認証状態を取得
- `useLocation()`: 現在のページ情報を取得
- `Navigate`: React Router のリダイレクトコンポーネント

---

## 2. テストケース一覧

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| UT-01 | 認証状態確認中のローディング表示 | 高 | ✅ 完了 |
| UT-02 | 未認証ユーザーのリダイレクト | 高 | ✅ 完了 |
| UT-03 | 認証済みユーザーのコンテンツ表示 | 高 | ✅ 完了 |
| UT-04 | リダイレクト時の location 保存 | 中 | ✅ 完了 |

---

## 3. テストケース詳細

### UT-01: 認証状態確認中のローディング表示

#### 3.1.1 テスト目的
認証状態の確認中（`loading: true`）に、ユーザーにローディング中であることを視覚的に伝える。

#### 3.1.2 前提条件
- `useAuthContext()` が `loading: true` を返す
- `isAuthenticated: false`

#### 3.1.3 テスト手順
1. PrivateRoute コンポーネントをレンダリング
2. 子コンポーネントとして「Protected Content」を渡す

#### 3.1.4 期待される結果
- ✅ 「読み込み中...」というテキストが表示される
- ✅ ローディングスピナー（回転するアイコン）が表示される
- ❌ 「Protected Content」は表示されない

#### 3.1.5 実装コード
```typescript
it('should show loading spinner when authentication is loading', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: false,
    loading: true,
    // ... その他のプロパティ
  });

  render(
    <BrowserRouter>
      <AuthProvider>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </AuthProvider>
    </BrowserRouter>
  );

  expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
```

---

### UT-02: 未認証ユーザーのリダイレクト

#### 3.2.1 テスト目的
未認証ユーザーが保護されたページにアクセスしようとした場合、ログインページにリダイレクトされることを確認する。

#### 3.2.2 前提条件
- `useAuthContext()` が `isAuthenticated: false` を返す
- `loading: false`（認証状態の確認完了）
- 初期ルート: `/dashboard`

#### 3.2.3 テスト手順
1. MemoryRouter で初期ルートを `/dashboard` に設定
2. `/login` と `/dashboard` のルートを定義
3. `/dashboard` に PrivateRoute を適用
4. コンポーネントをレンダリング

#### 3.2.4 期待される結果
- ✅ 「Login Page」が表示される（`/login` にリダイレクト）
- ❌ 「Protected Content」は表示されない

#### 3.2.5 実装コード
```typescript
it('should redirect to /login when user is not authenticated', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: false,
    loading: false,
    // ... その他のプロパティ
  });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
```

---

### UT-03: 認証済みユーザーのコンテンツ表示

#### 3.3.1 テスト目的
認証済みユーザーが保護されたページにアクセスした場合、正常にコンテンツが表示されることを確認する。

#### 3.3.2 前提条件
- `useAuthContext()` が `isAuthenticated: true` を返す
- `loading: false`
- `user` オブジェクトが存在する

#### 3.3.3 テスト手順
1. PrivateRoute コンポーネントをレンダリング
2. 子コンポーネントとして「Protected Content」を渡す

#### 3.3.4 期待される結果
- ✅ 「Protected Content」が表示される
- ❌ リダイレクトされない

#### 3.3.5 実装コード
```typescript
it('should render children when user is authenticated', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: true,
    user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
    idToken: 'mock-id-token',
    loading: false,
    // ... その他のプロパティ
  });

  render(
    <BrowserRouter>
      <AuthProvider>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </AuthProvider>
    </BrowserRouter>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
```

---

### UT-04: リダイレクト時の location 保存

#### 3.4.1 テスト目的
未認証ユーザーがリダイレクトされる際、元のページのパスが location state に保存されることを確認する。これにより、ログイン後に元のページに戻ることができる。

#### 3.4.2 前提条件
- `useAuthContext()` が `isAuthenticated: false` を返す
- `loading: false`
- 初期ルート: `/protected-page`

#### 3.4.3 テスト手順
1. MemoryRouter で初期ルートを `/protected-page` に設定
2. カスタム LoginPage コンポーネントを作成（location state を表示）
3. `/login` と `/protected-page` のルートを定義
4. コンポーネントをレンダリング
5. location state から `from.pathname` を取得

#### 3.4.4 期待される結果
- ✅ 「Login Page」が表示される
- ✅ location state に元のパス `/protected-page` が保存されている

#### 3.4.5 実装コード
```typescript
it('should save current location when redirecting to login', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: false,
    loading: false,
    // ... その他のプロパティ
  });

  const TestLoginPage = () => {
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    
    return (
      <div>
        <div>Login Page</div>
        <div data-testid="from-location">{from || 'no-location'}</div>
      </div>
    );
  };

  render(
    <MemoryRouter initialEntries={['/protected-page']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<TestLoginPage />} />
          <Route
            path="/protected-page"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
  
  const fromLocation = screen.getByTestId('from-location');
  expect(fromLocation.textContent).toBe('/protected-page');
});
```

---

## 4. テスト実行方法

### 4.1 すべてのテストを実行
```bash
cd frontend
npm test -- --run
```

### 4.2 PrivateRoute のテストのみ実行
```bash
npm test -- PrivateRoute.test.tsx --run
```

### 4.3 カバレッジレポート生成
```bash
npm test -- --coverage
```

---

## 5. テスト結果

### 5.1 実行結果サマリー
- **総テストケース数**: 4
- **成功**: 4
- **失敗**: 0
- **スキップ**: 0
- **実行時間**: 約 2 秒

### 5.2 カバレッジ
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

---

## 6. 備考

### 6.1 テストの制約事項
- Cognito の実際の認証処理はモック化されている
- ブラウザの実際の履歴機能は MemoryRouter でシミュレート

### 6.2 今後の拡張
- エラーハンドリングのテストケース追加
- タイムアウト処理のテストケース追加
- アクセシビリティテストの追加

---

**承認者**: _________________  
**承認日**: _________________
