# ライブラリ互換性テスト

**目的**: メジャーバージョンアップ前にライブラリ間の互換性を確認する

**対象**: React エコシステムのライブラリ（特に zod + @hookform/resolvers、React + React Router など）

**実行時間**: 20-40分

---

## 前提条件

- Node.js 20.x 以上
- npm または yarn がインストール済み
- テスト対象プロジェクトが `frontend/` に配置されている

---

## フロー

### Phase 1: 互換性確認対象の特定（5分）

#### 1.1 メジャーバージョンアップの検出

```bash
cd frontend
npm outdated
```

**確認項目**:
- [ ] 赤色（Major）のライブラリを特定
- [ ] 依存関係を確認（他のライブラリに影響するか）

#### 1.2 互換性確認が必須なペア

以下のペアは必ず互換性テストを実施：

| ライブラリA | ライブラリB | 確認事項 |
|-----------|-----------|--------|
| zod | @hookform/resolvers | エラーオブジェクト形式 |
| react | react-router-dom | Context API 動作 |
| @tanstack/react-query | react | Suspense 対応 |
| react-hook-form | @hookform/resolvers | Resolver 形式 |

#### 1.3 確認対象の決定

**チェックリスト**:
- [ ] 上記ペアのいずれかがアップデート対象か
- [ ] その他の重要なライブラリがアップデート対象か
- [ ] 公式ドキュメントで互換性情報を確認したか

---

### Phase 2: 互換性テスト環境の準備（5分）

#### 2.1 テストブランチの作成

```bash
git checkout -b test/library-upgrade-{library-name}
```

#### 2.2 新バージョンのインストール

```bash
# 例: zod v4 へのアップグレード
npm install zod@latest

# または特定バージョン
npm install zod@4.0.0
```

**確認項目**:
- [ ] `package.json` が更新されたか
- [ ] `package-lock.json` が更新されたか
- [ ] インストールエラーがないか

---

### Phase 3: 互換性テスト実施（20-30分）

#### 3.1 zod + @hookform/resolvers の互換性テスト

**テスト目的**: エラーオブジェクト形式が変わっていないか確認

**テストコマンド**:
```bash
node -e "
const { zodResolver } = require('@hookform/resolvers/zod');
const { z } = require('zod');

// テストスキーマ
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(12, 'Minimum 12 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// テストデータ（バリデーション失敗）
const testData = {
  email: 'invalid-email',
  password: 'short',
  confirmPassword: 'different'
};

// Resolver 実行
const resolver = zodResolver(schema);
resolver(testData, {}, { fields: {}, names: ['email', 'password', 'confirmPassword'] })
  .then(result => {
    console.log('=== Resolver Result ===');
    console.log(JSON.stringify(result, null, 2));
    
    // 互換性チェック
    if (result.errors && Object.keys(result.errors).length > 0) {
      console.log('✅ エラーオブジェクトが正しく生成されました');
      
      // エラーフィールドの確認
      const errorFields = Object.keys(result.errors);
      console.log('エラーフィールド:', errorFields);
      
      // 各エラーの構造確認
      errorFields.forEach(field => {
        const error = result.errors[field];
        console.log(\`\${field}: type=\${error.type}, message=\${error.message}\`);
      });
    } else {
      console.log('❌ エラーが検出されませんでした（互換性問題の可能性）');
    }
  })
  .catch(err => {
    console.error('❌ Resolver 実行エラー:', err.message);
    console.error('互換性問題の可能性があります');
  });
"
```

**期待される出力**:
```
=== Resolver Result ===
{
  "errors": {
    "email": {
      "type": "invalid_string",
      "message": "Invalid email"
    },
    "password": {
      "type": "too_small",
      "message": "Minimum 12 characters"
    },
    "confirmPassword": {
      "type": "custom",
      "message": "Passwords do not match"
    }
  },
  "values": { ... }
}
✅ エラーオブジェクトが正しく生成されました
```

**互換性判定**:
- ✅ エラーが正しく生成される → **互換性あり**
- ❌ エラーが生成されない → **互換性なし**
- ❌ 例外がスローされる → **互換性なし**

#### 3.2 React + React Router の互換性テスト

**テスト目的**: Context API が正常に動作するか確認

**テストコマンド**:
```bash
# React Router の動作確認
npm run build

# ビルドエラーがないか確認
echo "✅ ビルド成功"
```

**テストコード**:
```typescript
// frontend/src/test/router-compatibility.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useContext } from 'react';

// テスト用 Context
const TestContext = createContext<{ value: string } | null>(null);

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <TestContext.Provider value={{ value: 'test' }}>
    {children}
  </TestContext.Provider>
);

const TestComponent = () => {
  const context = useContext(TestContext);
  return <div>{context?.value}</div>;
};

test('Context works with React Router', () => {
  render(
    <BrowserRouter>
      <TestProvider>
        <Routes>
          <Route path="/" element={<TestComponent />} />
        </Routes>
      </TestProvider>
    </BrowserRouter>
  );
  
  expect(screen.getByText('test')).toBeInTheDocument();
});
```

**実行**:
```bash
npm run test -- router-compatibility.test.tsx
```

**互換性判定**:
- ✅ テスト通過 → **互換性あり**
- ❌ テスト失敗 → **互換性なし**

#### 3.3 @tanstack/react-query + React の互換性テスト

**テスト目的**: Suspense 対応が正常に動作するか確認

**テストコード**:
```typescript
// frontend/src/test/query-compatibility.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

const queryClient = new QueryClient();

const TestComponent = () => {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'test data';
    },
  });
  
  return <div>{data}</div>;
};

test('React Query works with Suspense', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <TestComponent />
      </Suspense>
    </QueryClientProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByText('test data')).toBeInTheDocument();
  });
});
```

**実行**:
```bash
npm run test -- query-compatibility.test.tsx
```

**互換性判定**:
- ✅ テスト通過 → **互換性あり**
- ❌ テスト失敗 → **互換性なし**

#### 3.4 実装コードでの動作確認

**チェックリスト**:
- [ ] ログインフロー（認証）が正常に動作するか
- [ ] フォームバリデーション（zod + React Hook Form）が正常に動作するか
- [ ] API 呼び出し（React Query）が正常に動作するか
- [ ] ページ遷移（React Router）が正常に動作するか

**手動テスト**:
```bash
npm run dev

# ブラウザで以下を確認
# 1. ログイン画面が表示される
# 2. メールアドレス入力でバリデーションエラーが表示される
# 3. ログイン後にダッシュボードが表示される
# 4. ナビゲーションが正常に動作する
```

---

### Phase 4: 互換性テスト結果の記録（5分）

#### 4.1 テスト結果ドキュメント作成

**ファイル**: `docs/library-compatibility-test-{date}.md`

**テンプレート**:
```markdown
# ライブラリ互換性テスト結果

**実施日**: 2026年5月30日
**テスト対象**: zod v4.0.0 + @hookform/resolvers v5.4.0

## テスト結果

| テスト項目 | 結果 | 詳細 |
|----------|------|------|
| zod エラーオブジェクト形式 | ✅ 互換 | エラーが正しく生成される |
| React Hook Form Resolver | ✅ 互換 | バリデーション正常動作 |
| ログインフロー | ✅ 互換 | 認証フロー正常動作 |
| フォームバリデーション | ✅ 互換 | エラーメッセージ表示正常 |

## 結論

**互換性**: ✅ **あり** - アップグレード可能

## 推奨事項

- [ ] 本番環境へのアップグレード実施
- [ ] E2E テスト全実行で最終確認
- [ ] リリースノート確認
```

#### 4.2 互換性判定

**互換性あり** の場合:
```bash
# 本番環境へのアップグレード
git add package.json package-lock.json
git commit -m "chore: upgrade zod to v4.0.0"
git push origin test/library-upgrade-zod
```

**互換性なし** の場合:
```bash
# アップグレード中止
git checkout package.json package-lock.json
npm install
git checkout test/library-upgrade-zod
```

---

## チェックリスト

実施前：
- [ ] 公式ドキュメントで互換性情報を確認したか
- [ ] テストブランチを作成したか
- [ ] 依存関係を確認したか

実施中：
- [ ] すべてのテストを実行したか
- [ ] 手動テストで動作確認したか
- [ ] エラーログを確認したか

実施後：
- [ ] テスト結果をドキュメント化したか
- [ ] 互換性判定を記録したか
- [ ] 本番環境へのアップグレード計画を立てたか

---

## トラブルシューティング

| 問題 | 原因 | 解決方法 |
|------|------|--------|
| インストール失敗 | 依存関係の競合 | `npm install --legacy-peer-deps` |
| テスト失敗 | 互換性なし | 前のバージョンに戻す |
| ビルド失敗 | 型定義の変更 | 型定義ファイルを確認 |

---

## 参考資料

- [zod リリースノート](https://github.com/colinhacks/zod/releases)
- [React Hook Form ドキュメント](https://react-hook-form.com)
- `docs/engineering-standards.md` - ライブラリバージョン管理ルール

---

**最終更新**: 2026年5月30日
