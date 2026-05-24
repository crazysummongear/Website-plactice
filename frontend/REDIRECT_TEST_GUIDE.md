# 未認証時のリダイレクト処理 - 手動テストガイド

## 概要
このガイドでは、PrivateRoute コンポーネントの未認証時のリダイレクト処理を手動でテストする方法を説明します。

## 実装内容

### 1. PrivateRoute コンポーネント
- **場所**: `frontend/src/components/PrivateRoute.tsx`
- **機能**:
  - 未認証ユーザーを `/login` にリダイレクト
  - リダイレクト時に元のページの location を state に保存
  - 認証状態の読み込み中にローディングスピナーを表示
  - 認証済みユーザーには子コンポーネントを表示

### 2. LoginPage コンポーネント
- **場所**: `frontend/src/pages/LoginPage.tsx`
- **機能**:
  - location state から元のページのパス (`from`) を取得
  - ログイン成功後、元のページまたはダッシュボードにリダイレクト
  - `replace: true` を使用して、ブラウザの履歴を適切に管理

## 手動テスト手順

### 前提条件
```bash
# 開発サーバーを起動
cd frontend
npm run dev
```

### テストケース 1: 未認証ユーザーのリダイレクト

1. ブラウザで `http://localhost:5173/dashboard` に直接アクセス
2. **期待される動作**:
   - 自動的に `/login` にリダイレクトされる
   - ログインページが表示される
   - URL が `http://localhost:5173/login` になる

### テストケース 2: ログイン後の元のページへのリダイレクト

1. ブラウザで `http://localhost:5173/dashboard` に直接アクセス
2. `/login` にリダイレクトされる
3. 有効な認証情報でログイン
4. **期待される動作**:
   - ログイン成功後、自動的に `/dashboard` にリダイレクトされる
   - ダッシュボードのコンテンツが表示される
   - URL が `http://localhost:5173/dashboard` になる

### テストケース 3: 認証済みユーザーの直接アクセス

1. 既にログイン済みの状態で、ブラウザで `http://localhost:5173/dashboard` にアクセス
2. **期待される動作**:
   - リダイレクトされずに、直接ダッシュボードが表示される
   - ログインページは表示されない

### テストケース 4: ローディング状態の表示

1. ブラウザで `http://localhost:5173/dashboard` に直接アクセス
2. **期待される動作**:
   - 認証状態の確認中、ローディングスピナーが表示される
   - 「読み込み中...」というテキストが表示される
   - 認証状態が確定後、適切なページにリダイレクトまたは表示される

### テストケース 5: ブラウザの戻るボタンの動作

1. ブラウザで `http://localhost:5173/dashboard` に直接アクセス
2. `/login` にリダイレクトされる
3. 有効な認証情報でログイン
4. `/dashboard` にリダイレクトされる
5. ブラウザの戻るボタンをクリック
6. **期待される動作**:
   - ログインページには戻らない（`replace: true` のため）
   - ブラウザの履歴が適切に管理されている

## 自動テスト

### ユニットテスト
```bash
# PrivateRoute のユニットテストを実行
npm test -- PrivateRoute.test.tsx --run
```

**テストカバレッジ**:
- ✅ 認証状態の読み込み中にローディングスピナーを表示
- ✅ 未認証ユーザーを `/login` にリダイレクト
- ✅ 認証済みユーザーに子コンポーネントを表示
- ✅ リダイレクト時に元のページの location を保存

### 統合テスト
```bash
# PrivateRoute の統合テストを実行
npm test -- PrivateRoute.integration.test.tsx --run
```

**テストカバレッジ**:
- ✅ 未認証ユーザーをログインページにリダイレクトし、元の location を保存
- ✅ ログイン成功後、元のページにリダイレクト
- ✅ 認証済みユーザーが保護されたルートに直接アクセス可能
- ✅ 複数の保護されたルートで正しくリダイレクト

### すべてのテストを実行
```bash
# すべてのテストを実行
npm test -- --run
```

## 実装の詳細

### PrivateRoute.tsx
```typescript
// 未認証時のリダイレクト処理
if (!isAuthenticated) {
  // Save the current location to redirect back after login
  return <Navigate to="/login" state={{ from: location }} replace />;
}
```

### LoginPage.tsx
```typescript
// location state から元のページのパスを取得
const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

// ログイン成功後、元のページにリダイレクト
useEffect(() => {
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }
}, [isAuthenticated, navigate, from]);
```

## トラブルシューティング

### 問題: リダイレクトが無限ループする
- **原因**: 認証状態の管理に問題がある可能性
- **解決策**: `useAuth` フックの実装を確認し、認証状態が正しく更新されているか確認

### 問題: 元のページにリダイレクトされない
- **原因**: location state が正しく保存されていない可能性
- **解決策**: `Navigate` コンポーネントで `state={{ from: location }}` が正しく設定されているか確認

### 問題: ローディングスピナーが表示されない
- **原因**: `loading` 状態が正しく管理されていない可能性
- **解決策**: `useAuth` フックで `loading` 状態が正しく返されているか確認

## 完了条件

以下のすべての条件を満たす場合、タスク 7.5.2 は完了です：

- ✅ すべてのユニットテストが成功
- ✅ すべての統合テストが成功
- ✅ 手動テストで未認証時のリダイレクトが正しく動作
- ✅ 手動テストでログイン後の元のページへのリダイレクトが正しく動作
- ✅ ブラウザの戻るボタンの動作が適切

## 参考資料

- [React Router - Navigate](https://reactrouter.com/en/main/components/navigate)
- [React Router - useLocation](https://reactrouter.com/en/main/hooks/use-location)
- [React Router - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
