---

inclusion: always

# React標準（React Standards）

このドキュメントはReactを使ったフロントエンド開発の標準である。

すべてのReactプロジェクトに適用する。

---

# 基本方針

設計なしに実装を開始しない。

コンポーネント設計・状態管理設計・テスト設計を先に行う。

---

# 技術スタック

| 項目 | 技術 |
| ---- | ---- |
| フレームワーク | React 18 |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| ビルドツール | Vite |
| ルーティング | React Router v6 |
| サーバー状態管理 | TanStack Query（React Query） |
| フォーム | React Hook Form + Zod |
| E2Eテスト | Playwright |

---

# ライブラリバージョン管理

採用するライブラリは以下を記録すること。

* バージョン
* 採用理由
* 互換性確認結果

以下の組み合わせは特に互換性を確認すること。

| ライブラリA | ライブラリB | 確認事項 |
| ---------- | ---------- | ------- |
| zod | @hookform/resolvers | エラーオブジェクト形式 |
| react | react-router-dom | Context API動作 |
| @tanstack/react-query | react | Suspense対応 |

メジャーバージョンを上げる場合は互換性テストを実施してから採用する。

---

# 状態管理

## Single Source of Truth

状態の唯一の管理者を必ず定義する。

## Context利用ルール

Contextを利用する場合は以下を明示する。

* Provider（状態の所有者）
* Context Hook（状態の取得方法）
* 利用コンポーネント（状態の消費者）

## 禁止事項

Context管理対象の状態を別Hookで複製することを禁止する。

具体例

```typescript
// ❌ 禁止
// AuthProviderがuseAuthを管理しているにもかかわらず
// コンポーネントがuseAuthを直接呼ぶと独立したインスタンスが生まれる
import { useAuth } from '../hooks/useAuth';
const { isAuthenticated } = useAuth();

// ✅ 正しい
// AuthProviderが管理するContextから取得する
import { useAuthContext } from '../context/AuthContext';
const { isAuthenticated } = useAuthContext();
```

## Provider配置

ProviderはApp.tsxのルートに配置する。

ネストの順番を設計書に明記する。

---

# コンポーネント設計

## ファイル構成

```
src/
├── pages/          # ページコンポーネント
├── components/     # 共通コンポーネント
├── hooks/          # カスタムフック
├── api/            # API呼び出し関数
├── context/        # Context定義
├── types/          # 型定義
└── utils/          # ユーティリティ
```

## 命名規則

| 種別 | 命名規則 | 例 |
| ---- | ------- | -- |
| ページ | PascalCase + Page | DashboardPage |
| コンポーネント | PascalCase | TransactionCard |
| フック | camelCase + use | useTransactions |
| API関数 | camelCase | getTransactions |

---

# テスタビリティ

## data-testid

すべてのインタラクティブ要素にdata-testidを付与する。

対象

* button
* input
* select
* modal
* navigation
* card
* ページタイトル

命名規則

```
{feature}-{element}
```

例

* login-button
* email-input
* password-input
* dashboard-title
* logout-button
* transactions-nav-link
* income-card

## Mock Mode

E2Eテストは実際のAWSリソースに依存しない。

環境変数でMock Modeを切り替える。

```
VITE_MOCK_AUTH=true   # Cognitoをモック
VITE_MOCK_API=true    # API Gatewayをモック
```

Mockデータは本番データと同じ型・構造を持つ。

---

# E2E考慮事項

テストに影響するUI特性を設計書に記録する。

| UI特性 | テストへの影響 | 対処方法 |
| ------ | ------------ | ------- |
| position: fixed | ビューポート外になる可能性 | dispatchEvent('click')を使用 |
| sticky | スクロール位置に依存 | スクロール後にクリック |
| modal / overlay | 背景要素がクリック不可 | モーダルが閉じるまで待機 |
| animation | 要素が安定するまで時間がかかる | waitForAnimations |
| loading状態 | ボタンがdisabledになる | toBeEnabled()で待機 |

---

# フォームバリデーション

React Hook Form + Zodを使用する。

modeはonSubmitを基本とする。

```typescript
useForm({
  resolver: zodResolver(schema),
  mode: 'onSubmit',
  reValidateMode: 'onChange',
})
```

E2Eテストでバリデーションを確認する場合はボタンが有効になるまで待機する。

```typescript
await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();
```

---

# 認証フロー

## PrivateRoute

未認証時はloginページにリダイレクトする。

loading中はスピナーを表示する。

```typescript
if (loading) return <Spinner />;
if (!isAuthenticated) return <Navigate to="/login" />;
return <>{children}</>;
```

## ログイン後のリダイレクト

ログイン成功後はuseEffectでリダイレクトする。

```typescript
useEffect(() => {
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }
}, [isAuthenticated, navigate, from]);
```

---

# 設計レビュー必須項目

実装前に以下を確認すること。

| 項目 | 確認 |
| ---- | ---- |
| 状態管理のSingle Source of Truth | 必須 |
| Context利用ルール | 必須 |
| data-testid命名規則 | 必須 |
| Mock Mode設計 | 必須 |
| ライブラリ互換性 | 必須 |
| E2E考慮事項 | 必須 |
| Provider配置 | 必須 |
