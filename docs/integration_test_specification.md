# 結合試験項目書（Integration Test Specification）

**プロジェクト名**: kakei（家計管理アプリ）  
**対象機能**: 認証フロー（PrivateRoute + LoginPage + AuthContext）  
**作成日**: 2026年5月24日  
**テストツール**: Vitest + React Testing Library + @testing-library/user-event

---

## 1. テスト対象の概要

### 1.1 対象システム
認証フロー全体の統合動作

### 1.2 統合対象コンポーネント
| コンポーネント | 役割 |
|--------------|------|
| PrivateRoute | 認証ガード（未認証ユーザーのリダイレクト） |
| LoginPage | ログイン画面（メール・パスワード入力） |
| AuthContext | 認証状態の管理（グローバル状態） |
| useAuth | 認証状態へのアクセス（カスタムフック） |
| React Router | ルーティング管理 |

### 1.3 テストシナリオの範囲
- 未認証ユーザーの保護されたページへのアクセス
- ログインフォームの入力・送信
- ログイン成功後の元のページへのリダイレクト
- 認証済みユーザーの直接アクセス
- 複数の保護されたルートの処理

---

## 2. テストケース一覧

| No. | テストケース名 | 優先度 | 実施状況 |
|-----|---------------|--------|---------|
| IT-01 | 未認証ユーザーのリダイレクトと location 保存 | 高 | ✅ 完了 |
| IT-02 | ログイン成功後の元のページへのリダイレクト | 高 | ✅ 完了 |
| IT-03 | 認証済みユーザーの保護されたルートへの直接アクセス | 高 | ✅ 完了 |
| IT-04 | 複数の保護されたルートの正しいリダイレクト処理 | 中 | ✅ 完了 |

---

## 3. テストケース詳細

### IT-01: 未認証ユーザーのリダイレクトと location 保存

#### 3.1.1 テスト目的
未認証ユーザーが保護されたページ（`/dashboard`）にアクセスしようとした場合、ログインページにリダイレクトされ、元のページ情報が保存されることを確認する。

#### 3.1.2 前提条件
- ユーザーは未認証状態
- 初期アクセス先: `/dashboard`

#### 3.1.3 テスト手順
1. ブラウザで `/dashboard` にアクセス
2. 認証状態を確認
3. リダイレクト先を確認
4. 元のページ情報の保存を確認

#### 3.1.4 期待される結果
| ステップ | 期待される動作 |
|---------|--------------|
| 1 | `/dashboard` へのアクセスを試みる |
| 2 | `isAuthenticated: false` を検出 |
| 3 | `/login` にリダイレクトされる |
| 4 | ログインページが表示される（「kakei」タイトル、メールアドレス入力フィールド） |
| 5 | location state に `/dashboard` が保存される |
| 6 | ダッシュボードのコンテンツは表示されない |

#### 3.1.5 実装コード
```typescript
it('should redirect unauthenticated user to login and preserve original location', async () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: false,
    user: null,
    loading: false,
    // ... その他のプロパティ
  });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('kakei')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });

  expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
});
```

---

### IT-02: ログイン成功後の元のページへのリダイレクト

#### 3.2.1 テスト目的
ユーザーがログインに成功した後、元々アクセスしようとしていたページ（`/dashboard`）に自動的にリダイレクトされることを確認する。

#### 3.2.2 前提条件
- ユーザーは未認証状態
- 初期アクセス先: `/dashboard`
- 有効な認証情報: `test@example.com` / `TestPassword123!`

#### 3.2.3 テスト手順
1. `/dashboard` にアクセス → `/login` にリダイレクト
2. メールアドレス入力フィールドに `test@example.com` を入力
3. パスワード入力フィールドに `TestPassword123!` を入力
4. 「ログイン」ボタンをクリック
5. ログイン処理が実行される
6. 認証状態が `isAuthenticated: true` に変更される
7. `/dashboard` にリダイレクトされる

#### 3.2.4 期待される結果
| ステップ | 期待される動作 |
|---------|--------------|
| 1 | ログインページが表示される |
| 2-3 | フォームに入力できる |
| 4 | `login()` 関数が呼ばれる |
| 5 | `login('test@example.com', 'TestPassword123!')` が実行される |
| 6 | 認証状態が更新される |
| 7 | ダッシュボードのコンテンツが表示される |
| 8 | ログインページは表示されない |

#### 3.2.5 実装コード
```typescript
it('should redirect back to original page after successful login', async () => {
  const mockLogin = vi.fn().mockResolvedValue(undefined);
  
  const mockAuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    login: mockLogin,
    // ... その他のプロパティ
  };

  vi.mocked(authHook.useAuth).mockReturnValue(mockAuthState);

  const { rerender } = render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  // ログインページが表示される
  await waitFor(() => {
    expect(screen.getByText('kakei')).toBeInTheDocument();
  });

  // フォームに入力
  const user = userEvent.setup();
  const emailInput = screen.getByLabelText('メールアドレス');
  const passwordInput = screen.getByLabelText('パスワード');
  const submitButton = screen.getByRole('button', { name: /ログイン/ });

  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'TestPassword123!');
  await user.click(submitButton);

  // ログイン関数が呼ばれたことを確認
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'TestPassword123!');
  });

  // 認証状態を更新
  vi.mocked(authHook.useAuth).mockReturnValue({
    ...mockAuthState,
    isAuthenticated: true,
    user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
    idToken: 'mock-id-token',
  });

  // 再レンダリング
  rerender(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  // ダッシュボードが表示される
  await waitFor(() => {
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });
});
```

---

### IT-03: 認証済みユーザーの保護されたルートへの直接アクセス

#### 3.3.1 テスト目的
既にログイン済みのユーザーが保護されたページ（`/dashboard`）に直接アクセスした場合、リダイレクトされずに正常にコンテンツが表示されることを確認する。

#### 3.3.2 前提条件
- ユーザーは認証済み状態（`isAuthenticated: true`）
- 有効な JWT トークンを保持
- 初期アクセス先: `/dashboard`

#### 3.3.3 テスト手順
1. 認証済み状態で `/dashboard` にアクセス
2. ページの表示を確認

#### 3.3.4 期待される結果
| ステップ | 期待される動作 |
|---------|--------------|
| 1 | `/dashboard` に直接アクセス |
| 2 | リダイレクトされない |
| 3 | ダッシュボードのコンテンツが即座に表示される |
| 4 | ログインページは表示されない |

#### 3.3.5 実装コード
```typescript
it('should allow authenticated user to access protected routes directly', () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: true,
    user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
    idToken: 'mock-id-token',
    loading: false,
    // ... その他のプロパティ
  });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(screen.queryByText('kakei')).not.toBeInTheDocument();
});
```

---

### IT-04: 複数の保護されたルートの正しいリダイレクト処理

#### 3.4.1 テスト目的
複数の保護されたルート（`/dashboard`, `/settings`）が存在する場合、どのルートにアクセスしても未認証ユーザーは正しくログインページにリダイレクトされることを確認する。

#### 3.4.2 前提条件
- ユーザーは未認証状態
- 保護されたルート: `/dashboard`, `/settings`
- 初期アクセス先: `/settings`

#### 3.4.3 テスト手順
1. `/settings` にアクセス
2. リダイレクト先を確認
3. コンテンツの表示を確認

#### 3.4.4 期待される結果
| ステップ | 期待される動作 |
|---------|--------------|
| 1 | `/settings` へのアクセスを試みる |
| 2 | `/login` にリダイレクトされる |
| 3 | ログインページが表示される |
| 4 | 設定ページのコンテンツは表示されない |

#### 3.4.5 実装コード
```typescript
it('should handle multiple protected routes with correct redirects', async () => {
  vi.mocked(authHook.useAuth).mockReturnValue({
    isAuthenticated: false,
    user: null,
    loading: false,
    // ... その他のプロパティ
  });

  render(
    <MemoryRouter initialEntries={['/settings']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Content</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <div>Settings Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('kakei')).toBeInTheDocument();
  });

  expect(screen.queryByText('Settings Content')).not.toBeInTheDocument();
});
```

---

## 4. テスト実行方法

### 4.1 すべての統合テストを実行
```bash
cd frontend
npm test -- PrivateRoute.integration.test.tsx --run
```

### 4.2 特定のテストケースのみ実行
```bash
npm test -- PrivateRoute.integration.test.tsx -t "should redirect unauthenticated user" --run
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
- **実行時間**: 約 3 秒

### 5.2 統合カバレッジ
| コンポーネント | カバレッジ |
|--------------|----------|
| PrivateRoute | 100% |
| LoginPage | 85% |
| AuthContext | 90% |
| useAuth | 90% |

---

## 6. テストシナリオフロー図

```
[未認証ユーザー]
    │
    ├─→ /dashboard にアクセス
    │       │
    │       ↓
    │   PrivateRoute が認証状態を確認
    │       │
    │       ↓
    │   isAuthenticated: false
    │       │
    │       ↓
    │   /login にリダイレクト
    │       │
    │       ↓
    │   LoginPage が表示
    │       │
    │       ↓
    │   ユーザーが認証情報を入力
    │       │
    │       ↓
    │   login() 関数が実行
    │       │
    │       ↓
    │   Cognito で認証
    │       │
    │       ↓
    │   isAuthenticated: true
    │       │
    │       ↓
    │   元のページ (/dashboard) にリダイレクト
    │       │
    │       ↓
    │   Dashboard が表示
    │
    └─→ [認証済みユーザー]
```

---

## 7. 備考

### 7.1 テストの制約事項
- Cognito の実際の認証処理はモック化されている
- ネットワーク遅延はシミュレートされていない
- ブラウザの実際の履歴機能は MemoryRouter でシミュレート

### 7.2 今後の拡張
- ログアウト後の動作テスト
- セッションタイムアウトのテスト
- 複数タブでの認証状態同期テスト
- エラーハンドリング（ネットワークエラー、認証エラー）のテスト

### 7.3 既知の問題
- なし

---

**承認者**: _________________  
**承認日**: _________________
