# モック認証テストガイド

## 現在の状態

モック認証モードが有効になっています（`.env.local` で `VITE_MOCK_AUTH=true` に設定）。

## テスト手順

### 1. 開発サーバーの起動確認

```bash
cd frontend
npm run dev
```

ブラウザで http://localhost:5173/ にアクセス

### 2. サインアップフロー

1. ログイン画面で「アカウントをお持ちでない方はこちら」をクリック
2. サインアップ画面でメールアドレスとパスワードを入力
3. 「登録」ボタンをクリック
4. **モックモードでは検証コード入力をスキップ**してログイン画面に遷移

### 3. ログインフロー

1. ログイン画面でメールアドレスとパスワードを入力
2. 「ログイン」ボタンをクリック
3. **期待される動作**: ダッシュボード画面に遷移し、そのまま表示される
4. **以前の問題**: ログイン画面に戻されていた → **修正済み**

### 4. セッション復元テスト

1. ログイン後、ブラウザをリフレッシュ（F5）
2. **期待される動作**: ログイン状態が維持され、ダッシュボードが表示される
3. **確認方法**: 
   - ブラウザの開発者ツール（F12）を開く
   - Application タブ → Local Storage → http://localhost:5173
   - `kakei_id_token` と `kakei_access_token` が保存されていることを確認

### 5. ログアウトテスト

1. ダッシュボードでログアウトボタンをクリック
2. **期待される動作**: ログイン画面に遷移
3. Local Storage からトークンが削除されることを確認

## 修正内容

### 問題の原因

`useAuth.ts` の `restoreSession` 関数が、モックトークンを実際の JWT トークンとして検証しようとしていたため、セッション復元に失敗していました。

### 修正内容

```typescript
// 🔧 MOCK MODE: モックトークンの場合はそのまま復元
if (MOCK_MODE && idToken === 'mock-id-token') {
  const mockUser: User = {
    userId: 'mock-user-123',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
  };

  setState((prev) => ({
    ...prev,
    isAuthenticated: true,
    user: mockUser,
    idToken,
    accessToken,
    loading: false,
    error: null,
  }));
  return;
}
```

この修正により、モックトークンが検出された場合は JWT 検証をスキップし、直接セッションを復元するようになりました。

## トラブルシューティング

### まだログイン画面に戻される場合

1. ブラウザのキャッシュをクリア
2. Local Storage を手動でクリア（開発者ツール → Application → Local Storage → Clear All）
3. ブラウザをリフレッシュ
4. 再度ログインを試す

### 開発者ツールでのデバッグ

1. F12 で開発者ツールを開く
2. Console タブでエラーメッセージを確認
3. Network タブで API リクエストを確認（モックモードでは API リクエストは発生しません）

## 次のステップ

モック認証が正常に動作したら、次は以下のいずれかを実施します：

### オプション A: モックデータで UI テスト

`useTransactions.ts` にモックデータを追加して、収支一覧・ダッシュボードの UI を確認

### オプション B: バックエンドデプロイ

1. Lambda 関数のビルド・デプロイ
2. Cognito のデプロイ
3. `.env.local` で `VITE_MOCK_AUTH=false` に変更
4. 実際の API と連携

## 参考情報

- **モックモード設定**: `frontend/.env.local`
- **認証ロジック**: `frontend/src/hooks/useAuth.ts`
- **認証コンテキスト**: `frontend/src/context/AuthContext.tsx`
- **プライベートルート**: `frontend/src/components/PrivateRoute.tsx`
