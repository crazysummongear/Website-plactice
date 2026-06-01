# エラー根本原因分析

**目的**: 問題発生時に根本原因を体系的に特定し、再発防止策を立案する

**対象**: テスト失敗、ビルドエラー、ランタイムエラー、ロジックエラー

**実行時間**: 30-90分（問題の複雑さによる）

---

## 前提条件

- エラーメッセージまたはログが利用可能
- 問題を再現できる環境がある
- Git リポジトリが利用可能

---

## フロー

### Phase 1: エラー情報の収集（10分）

#### 1.1 エラーメッセージの記録

**チェックリスト**:
- [ ] エラーメッセージ全文を記録したか
- [ ] スタックトレースを記録したか
- [ ] エラーが発生した時刻を記録したか
- [ ] エラーが発生した環境を記録したか（dev/prod、OS、ブラウザなど）

**エラー情報テンプレート**:
```
エラーメッセージ:
[エラーメッセージ全文]

スタックトレース:
[スタックトレース]

発生時刻: 2026-05-30 14:30:00
環境: Windows 11, Node.js 20.x, Chrome 125
再現手順: [手順]
```

#### 1.2 エラーの分類

エラーを以下のカテゴリに分類：

| カテゴリ | 例 | 対処方法 |
|---------|-----|--------|
| ビルドエラー | TypeScript コンパイルエラー | Phase 2 へ |
| テスト失敗 | Assertion failed | Phase 3 へ |
| ランタイムエラー | Cannot read property | Phase 4 へ |
| ロジックエラー | 期待値と異なる結果 | Phase 5 へ |
| 環境エラー | 環境変数未設定 | Phase 6 へ |

#### 1.3 エラーの重要度評価

| 重要度 | 定義 | 対応 |
|------|------|------|
| Critical | 本番環境で機能停止 | 即座に対応 |
| High | 主要機能が動作しない | 24時間以内に対応 |
| Medium | 一部機能が動作しない | 1週間以内に対応 |
| Low | 軽微な問題 | 次のリリースで対応 |

---

### Phase 2: ビルドエラーの分析（15分）

**症状**: `npm run build` 実行時にエラー

#### 2.1 エラーメッセージの詳細確認

```bash
npm run build 2>&1 | tee build-error.log
```

**確認項目**:
- [ ] エラーが発生したファイルは？
- [ ] エラーが発生した行番号は？
- [ ] エラーの種類は？（TypeScript、構文、依存関係など）

#### 2.2 TypeScript エラーの場合

**チェックリスト**:
- [ ] 型定義が正しいか
- [ ] インポートパスが正しいか
- [ ] 関数の引数の型が正しいか

**修正例**:
```typescript
// ❌ エラー: Property 'name' does not exist on type 'User'
const user: User = { id: 1 };
console.log(user.name);

// ✅ 修正: 型定義を確認
interface User {
  id: number;
  name: string;
}
const user: User = { id: 1, name: 'John' };
console.log(user.name);
```

#### 2.3 依存関係エラーの場合

**チェックリスト**:
- [ ] `package.json` に依存関係が記録されているか
- [ ] `npm install` を実行したか
- [ ] バージョン競合がないか

**修正手順**:
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルド再実行
npm run build
```

#### 2.4 根本原因の特定

**根本原因テンプレート**:
```
根本原因: [原因を簡潔に記述]

例:
- TypeScript 型定義が不正確
- インポートパスが間違っている
- 依存ライブラリのバージョン競合
- 環境変数が未設定
```

---

### Phase 3: テスト失敗の分析（20分）

**症状**: `npm run test` または `npm run test:e2e` 実行時にテスト失敗

#### 3.1 テスト失敗の詳細確認

```bash
# ユニットテスト
npm run test -- --reporter=verbose

# E2E テスト
npm run test:e2e -- --reporter=list
npx playwright show-report
```

**確認項目**:
- [ ] どのテストが失敗したか
- [ ] 期待値は何か
- [ ] 実際の値は何か
- [ ] スクリーンショット・ビデオは何を示しているか

#### 3.2 テスト失敗の分類

| パターン | 原因 | 対処方法 |
|---------|------|--------|
| Assertion failed | ロジックエラー | Phase 5 へ |
| Timeout | 非同期処理の遅延 | 待機時間を増やす |
| Element not found | UI 変更 | data-testid を確認 |
| Mock 失敗 | Mock 設定エラー | Mock 設定を確認 |

#### 3.3 ユニットテスト失敗の場合

**チェックリスト**:
- [ ] テストコードは正しいか
- [ ] 実装コードは正しいか
- [ ] Mock は正しく設定されているか

**修正例**:
```typescript
// ❌ テスト失敗: Expected 10 but got 5
test('calculateTotal should sum amounts', () => {
  const result = calculateTotal([5, 5]);
  expect(result).toBe(10);
});

// 実装コード（バグ）
function calculateTotal(amounts: number[]): number {
  return amounts[0]; // ❌ 最初の要素だけ返している
}

// ✅ 修正
function calculateTotal(amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}
```

#### 3.4 E2E テスト失敗の場合

**チェックリスト**:
- [ ] UI が期待通りに表示されているか
- [ ] 要素が見つかるか
- [ ] 非同期処理が完了しているか

**修正例**:
```typescript
// ❌ テスト失敗: Timeout waiting for selector
await page.click('[data-testid="login-button"]');

// ✅ 修正: 要素が有効になるまで待機
await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();
await page.click('[data-testid="login-button"]');
```

#### 3.5 根本原因の特定

**根本原因テンプレート**:
```
根本原因: [原因を簡潔に記述]

例:
- 実装コードのロジックエラー
- テストコードの期待値が不正確
- UI 変更に伴う data-testid の変更
- 非同期処理の待機不足
- Mock 設定の誤り
```

---

### Phase 4: ランタイムエラーの分析（20分）

**症状**: アプリケーション実行中にエラーが発生

#### 4.1 エラーログの確認

```bash
# ブラウザコンソール
# DevTools → Console タブでエラーを確認

# サーバーログ
npm run dev 2>&1 | tee app-error.log

# CloudWatch ログ（本番環境）
aws logs tail /aws/lambda/kakei-transactions --follow
```

**確認項目**:
- [ ] エラーメッセージは何か
- [ ] スタックトレースはどこを指しているか
- [ ] エラーが発生した時刻は
- [ ] エラーが発生する条件は

#### 4.2 一般的なランタイムエラーの分析

| エラー | 原因 | 対処方法 |
|------|------|--------|
| Cannot read property | null/undefined アクセス | null チェックを追加 |
| Unexpected token | JSON パースエラー | JSON 形式を確認 |
| Network error | API 呼び出し失敗 | API エンドポイントを確認 |
| Permission denied | 権限不足 | IAM 権限を確認 |

#### 4.3 null/undefined エラーの場合

**チェックリスト**:
- [ ] 変数が初期化されているか
- [ ] API レスポンスが正しいか
- [ ] null チェックが実装されているか

**修正例**:
```typescript
// ❌ エラー: Cannot read property 'name' of undefined
const user = getUser();
console.log(user.name);

// ✅ 修正: null チェックを追加
const user = getUser();
if (user) {
  console.log(user.name);
} else {
  console.log('User not found');
}

// または Optional Chaining
console.log(user?.name);
```

#### 4.4 API エラーの場合

**チェックリスト**:
- [ ] API エンドポイントは正しいか
- [ ] リクエストヘッダーは正しいか
- [ ] 認証トークンは有効か
- [ ] API レスポンスは正しい形式か

**修正例**:
```typescript
// ❌ エラー: 401 Unauthorized
const response = await fetch('/api/transactions');

// ✅ 修正: 認証トークンを追加
const token = localStorage.getItem('idToken');
const response = await fetch('/api/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### 4.5 根本原因の特定

**根本原因テンプレート**:
```
根本原因: [原因を簡潔に記述]

例:
- null/undefined 値へのアクセス
- API エンドポイントの誤り
- 認証トークンの期限切れ
- 環境変数の未設定
- 依存ライブラリのバージョン不一致
```

---

### Phase 5: ロジックエラーの分析（25分）

**症状**: アプリケーションが実行されるが、期待と異なる結果が返される

#### 5.1 問題の再現

**チェックリスト**:
- [ ] 問題を再現できるか
- [ ] 問題が常に発生するか、それとも時々か
- [ ] 特定の条件下でのみ発生するか

**再現手順テンプレート**:
```
1. [操作1]
2. [操作2]
3. [操作3]
期待結果: [期待値]
実際の結果: [実際の値]
```

#### 5.2 ロジックの追跡

**チェックリスト**:
- [ ] 入力値は正しいか
- [ ] 計算ロジックは正しいか
- [ ] 出力値は正しいか

**デバッグ手順**:
```typescript
// ❌ ロジックエラー: 合計が正しくない
function calculateTotal(transactions: Transaction[]): number {
  let total = 0;
  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      total += tx.amount;
    }
    // ❌ EXPENSE を引き忘れている
  }
  return total;
}

// ✅ 修正
function calculateTotal(transactions: Transaction[]): number {
  let total = 0;
  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      total += tx.amount;
    } else if (tx.type === 'EXPENSE') {
      total -= tx.amount;
    }
  }
  return total;
}
```

#### 5.3 状態管理エラーの場合

**チェックリスト**:
- [ ] 状態が正しく初期化されているか
- [ ] 状態が正しく更新されているか
- [ ] 複数の Hook インスタンスが生成されていないか

**修正例**:
```typescript
// ❌ エラー: 状態が更新されない
const { isAuthenticated } = useAuth(); // 複数インスタンス
const { isAuthenticated: isAuth } = useAuthContext(); // 別インスタンス

// ✅ 修正: 単一インスタンスから取得
const { isAuthenticated } = useAuthContext();
```

#### 5.4 根本原因の特定

**根本原因テンプレート**:
```
根本原因: [原因を簡潔に記述]

例:
- ビジネスロジックの誤り
- 条件分岐の漏れ
- 状態管理の複製
- 計算式の誤り
- データ型の不一致
```

---

### Phase 6: 環境エラーの分析（10分）

**症状**: 環境依存のエラー（dev では動作するが prod では動作しないなど）

#### 6.1 環境変数の確認

```bash
# 環境変数を確認
echo $VITE_API_URL
echo $VITE_COGNITO_DOMAIN

# .env ファイルを確認
cat frontend/.env.local
cat frontend/.env.production
```

**チェックリスト**:
- [ ] 必要な環境変数がすべて設定されているか
- [ ] 環境変数の値は正しいか
- [ ] 環境ごとに異なる値が設定されているか

#### 6.2 ビルド設定の確認

**チェックリスト**:
- [ ] `vite.config.ts` が正しく設定されているか
- [ ] `tsconfig.json` が正しく設定されているか
- [ ] `package.json` のスクリプトが正しいか

#### 6.3 デプロイ設定の確認

**チェックリスト**:
- [ ] S3 バケットが正しく設定されているか
- [ ] CloudFront が正しく設定されているか
- [ ] Lambda 環境変数が正しく設定されているか

#### 6.4 根本原因の特定

**根本原因テンプレート**:
```
根本原因: [原因を簡潔に記述]

例:
- 環境変数の未設定
- 環境ごとの設定値の誤り
- ビルド設定の不一致
- デプロイ設定の誤り
```

---

### Phase 7: 再発防止策の立案（10分）

#### 7.1 根本原因の記録

**テンプレート**:
```markdown
# エラー分析レポート

**エラー**: [エラータイトル]
**発生日**: 2026-05-30
**重要度**: High

## 根本原因

[根本原因を詳細に記述]

## 影響範囲

- [影響を受けた機能]
- [影響を受けたユーザー]

## 修正内容

[修正内容を詳細に記述]

## 再発防止策

1. [防止策1]
2. [防止策2]
3. [防止策3]

## テスト

- [テスト項目1]
- [テスト項目2]
```

#### 7.2 再発防止策の実装

**チェックリスト**:
- [ ] テストを追加したか
- [ ] ドキュメントを更新したか
- [ ] チームに共有したか
- [ ] 類似の問題がないか確認したか

#### 7.3 再発防止策の例

| 根本原因 | 再発防止策 |
|---------|---------|
| null/undefined エラー | null チェック・型定義の強化 |
| ロジックエラー | ユニットテストの追加 |
| 状態管理エラー | 設計レビューの実施 |
| 環境エラー | 環境変数チェックリストの作成 |
| テスト失敗 | E2E テストの充実 |

---

## チェックリスト

実施前：
- [ ] エラー情報を完全に収集したか
- [ ] エラーを再現できるか
- [ ] 関連ログを確認したか

実施中：
- [ ] 根本原因を特定したか
- [ ] 修正内容を検証したか
- [ ] 再発防止策を立案したか

実施後：
- [ ] エラー分析レポートを作成したか
- [ ] 修正内容をコミットしたか
- [ ] チームに共有したか

---

## トラブルシューティング

| 問題 | 原因 | 解決方法 |
|------|------|--------|
| 根本原因が特定できない | 情報不足 | ログを詳細に確認 |
| 複数の原因がある | 複合エラー | 各原因を個別に分析 |
| 再現できない | 環境依存 | 異なる環境で試す |

---

## 参考資料

- `docs/engineering-standards.md` - 開発標準
- `docs/design_lessons_learned.md` - 過去の問題と教訓
- `frontend/E2E_TESTING_GUIDE.md` - E2E テストガイド

---

**最終更新**: 2026年5月30日
