# 設計フェーズで不足していた要素 — 振り返りと改善ガイド

**プロジェクト**: kakei（家計管理アプリ）  
**作成日**: 2026年5月30日  
**目的**: 今回の開発で後から発覚した設計上の不足点を記録し、次回プロジェクトに活かす

---

## 概要

kakei プロジェクトでは、設計フェーズ（requirements.md / design.md）においてテスト戦略が考慮されていなかった。その結果、実装後に複数のバグが発覚し、修正に時間を要した。本ドキュメントでは「何が不足していたか」「なぜ問題になったか」「次回どう設計すべきか」を整理する。

---

## 1. 不足していた設計要素

### 1.1 テスト戦略の欠如

**現状（requirements.md / design.md に記載なし）**

要件定義書・設計書のどこにも以下が含まれていなかった：
- テストの種類と責任範囲
- E2E テストのシナリオ定義
- テスト可能性（Testability）を前提とした設計方針
- Mock Mode の設計

**何が起きたか**

- E2E テストを後から追加しようとしたが、コンポーネントに `data-testid` がなく、セレクタが不安定だった
- Mock Mode（`VITE_MOCK_AUTH=true`）が後付けで実装されたため、設計との整合性が取れていなかった
- テストを書いて初めてバグが発覚した（設計時に防げたはず）

---

### 1.2 状態管理の設計が不明確

**現状（design.md 4.3節）**

```
- 認証状態: useAuth.ts（Context API）
```

これだけの記述では、以下が不明確だった：

- `useAuth` を直接呼ぶのか、Context 経由で使うのか
- どのコンポーネントが認証状態を参照するか
- 状態の「単一の真実の源（Single Source of Truth）」がどこか

**何が起きたか**

`LoginPage`、`TopNavigation`、`DashboardPage` がそれぞれ `useAuth()` を直接呼び出した。これにより **3つの独立した認証状態インスタンス** が生まれ、ログイン後にダッシュボードへリダイレクトされないバグが発生した。

```
// ❌ 問題のある実装（設計が不明確だったため発生）
// LoginPage.tsx
import { useAuth } from '../hooks/useAuth';  // 独立したインスタンスA

// TopNavigation.tsx
import { useAuth } from '../hooks/useAuth';  // 独立したインスタンスB

// DashboardPage.tsx
import { useAuth } from '../hooks/useAuth';  // 独立したインスタンスC

// ✅ 正しい実装（設計で明示すべきだった）
// 全コンポーネント共通
import { useAuthContext } from '../context/AuthContext';  // 共有インスタンス
```

**根本原因**: 設計書に「`useAuth` は `AuthProvider` 内で1回だけ呼び出し、他のコンポーネントは必ず `useAuthContext` を使う」という制約が明記されていなかった。

---

### 1.3 ライブラリのバージョン互換性の検証不足

**現状（requirements.md 4.3節）**

```
フレームワーク: React 18
言語: TypeScript
スタイリング: Tailwind CSS
ビルドツール: Vite
```

バージョンの組み合わせ（互換性）についての記載がなかった。

**何が起きたか**

`zod v4` と `@hookform/resolvers v3` の非互換により、フォームバリデーションが動作しなかった。

- `zod v4` はエラーオブジェクトの形式を変更（`code` → `origin`）
- `@hookform/resolvers v3` は旧形式を前提としていたため、エラーを正しく処理できなかった
- 結果として、12文字未満のパスワードでもバリデーションが通過してしまった

```
// zod v3 のエラー形式（@hookform/resolvers v3 が期待する形式）
{ code: "too_small", message: "12文字以上" }

// zod v4 の新しいエラー形式（@hookform/resolvers v3 が処理できない）
{ origin: "string", code: "too_small", message: "12文字以上" }
```

**修正**: `@hookform/resolvers` を v5.4.0 にアップグレード（Zod v4 対応版）

---

### 1.4 UI コンポーネントの `data-testid` 命名規則の未定義

**現状（design.md に記載なし）**

コンポーネント設計にテスト用属性の定義がなかった。

**何が起きたか**

- E2E テストを書く際に、セレクタの命名が一貫しなかった
- `data-testid` がないコンポーネントがあり、テストが不安定になった
- テスト側でセレクタを後から決めたため、コンポーネントとテストの整合性確認が必要になった

---

### 1.5 ボトムナビゲーションの配置設計の不備

**現状（design.md 4.1節）**

```
BottomNavigation.tsx — スマホ向けナビゲーション
```

「固定配置（`position: fixed`）」であることが設計に明記されていなかった。

**何が起きたか**

デスクトップブラウザでの E2E テスト実行時、ボトムナビゲーションが `position: fixed; bottom: 0` で配置されているため、Playwright が「要素がビューポート外にある」と判断してクリックできなかった。

```
// エラーログ
- element is outside of the viewport
- retrying click action
```

**修正**: `page.click()` の代わりに `dispatchEvent('click')` を使用

---

## 2. 設計フェーズで追加すべきだった項目

### 2.1 テスト戦略セクション（requirements.md に追加）

```markdown
## 9. テスト戦略

### 9.1 テストの種類と責任範囲

| テスト種別 | ツール | 対象 | 実行タイミング |
|-----------|--------|------|--------------|
| ユニットテスト | Vitest | 関数・フック | コミット前 |
| コンポーネントテスト | React Testing Library | UI コンポーネント | コミット前 |
| E2E テスト | Playwright | ユーザーフロー全体 | PR 作成時 |

### 9.2 E2E テストシナリオ（MVP）

- [ ] ログイン成功フロー
- [ ] ログイン失敗（バリデーションエラー）
- [ ] ログアウト
- [ ] 未認証時のリダイレクト
- [ ] ダッシュボード表示
- [ ] 収支入力・一覧表示
- [ ] ナビゲーション遷移

### 9.3 Mock Mode 要件

- E2E テストは実際の AWS リソースに依存しない
- `VITE_MOCK_AUTH=true` で Cognito をモック
- `VITE_MOCK_API=true` で API Gateway をモック
- Mock データは本番データと同じ型・構造を持つ
```

---

### 2.2 状態管理の設計原則（design.md に追加）

```markdown
### 4.4 状態管理の設計原則

#### 認証状態の単一管理

認証状態は `AuthProvider` が唯一の管理者とする。

```
// ✅ 正しい使い方
// AuthContext.tsx（AuthProvider 内で1回だけ useAuth を呼ぶ）
const auth = useAuth();

// 全コンポーネントは useAuthContext を使う
const { isAuthenticated, user } = useAuthContext();
```

```
// ❌ 禁止パターン
// コンポーネント内で useAuth を直接呼ぶ
const { isAuthenticated } = useAuth(); // 独立したインスタンスが生まれる
```

#### ルール

1. `useAuth` を直接呼べるのは `AuthContext.tsx` のみ
2. 全コンポーネントは `useAuthContext` を使う
3. `AuthProvider` は `App.tsx` のルートに1つだけ配置する
```

---

### 2.3 ライブラリバージョン管理（requirements.md に追加）

```markdown
### 4.5 ライブラリバージョン管理

#### バージョン固定方針

- メジャーバージョンは固定する（`^` ではなく `~` または完全固定）
- 新しいメジャーバージョンを採用する場合は互換性を事前検証する

#### 検証が必要な組み合わせ

| ライブラリA | ライブラリB | 確認事項 |
|-----------|-----------|---------|
| zod | @hookform/resolvers | エラーオブジェクトの形式互換性 |
| react | react-router-dom | Context API の動作 |
| @tanstack/react-query | react | Suspense 対応 |
```

---

### 2.4 コンポーネント設計の `data-testid` 規則（design.md に追加）

```markdown
### 4.5 テスタビリティ設計

#### data-testid 命名規則

全インタラクティブ要素に `data-testid` を付与する。

命名規則: `{コンポーネント}-{要素種別}`

| 要素 | 命名例 |
|------|--------|
| 入力フィールド | `email-input`, `password-input` |
| ボタン | `login-button`, `logout-button` |
| ページタイトル | `dashboard-title`, `transactions-title` |
| ナビゲーションリンク | `dashboard-nav-link`, `transactions-nav-link` |
| ボトムナビボタン | `dashboard-bottom-nav-button` |
| エラーメッセージ | `email-error`, `password-error`, `auth-error` |
| カード・セクション | `income-card`, `expense-card`, `category-breakdown` |

#### ボトムナビゲーションの配置

ボトムナビゲーションは `position: fixed; bottom: 0` で配置する。
E2E テストでは `dispatchEvent('click')` を使用してビューポート外の要素をクリックする。
```

---

## 3. 次回プロジェクトへの教訓

### 教訓1: テスト戦略は設計フェーズで決める

テストは実装後に追加するものではなく、設計の一部として最初から定義する。

**チェックリスト（設計フェーズ）**:
- [ ] テストの種類と責任範囲を定義したか
- [ ] E2E テストシナリオを列挙したか
- [ ] Mock Mode の設計を含めたか
- [ ] `data-testid` の命名規則を定義したか

---

### 教訓2: 状態管理の「使い方ルール」を設計書に書く

「何を使うか」だけでなく「どう使うか」を明記する。

**悪い例（kakei 初期設計）**:
> 認証状態: `useAuth.ts`（Context API）

**良い例**:
> 認証状態は `AuthProvider` が一元管理する。コンポーネントは必ず `useAuthContext` を使い、`useAuth` を直接呼ぶことを禁止する。

---

### 教訓3: ライブラリの組み合わせは事前に検証する

特にメジャーバージョンが新しいライブラリを採用する場合、依存ライブラリとの互換性を確認する。

**確認コマンド例**:
```bash
# zodResolver が zod のエラーを正しく処理できるか確認
node -e "
const { zodResolver } = require('@hookform/resolvers/zod');
const { z } = require('zod');
const schema = z.object({ password: z.string().min(12) });
const resolver = zodResolver(schema);
resolver({ password: 'short' }, {}, { fields: {}, names: ['password'] })
  .then(r => console.log(r));
"
```

---

### 教訓4: UI コンポーネントの配置特性をテスト観点で記録する

`position: fixed` や `z-index` など、テストに影響する CSS 特性を設計書に記録する。

---

## 4. 修正した内容のまとめ（今回の実績）

| 問題 | 原因 | 修正内容 |
|------|------|---------|
| ログイン後にダッシュボードへ遷移しない | `useAuth` の二重インスタンス | `LoginPage`・`TopNavigation`・`DashboardPage` を `useAuthContext` に統一 |
| バリデーションエラーが表示されない | `@hookform/resolvers` と `zod v4` の非互換 | `@hookform/resolvers` を v5.4.0 にアップグレード |
| ボトムナビゲーションがクリックできない | `position: fixed` でビューポート外 | `dispatchEvent('click')` を使用 |
| バリデーションが送信前に動作しない | `mode: 'onBlur'` の誤設定 | `mode: 'onSubmit'` に修正、ボタン有効化待ちを追加 |

---

**最終更新**: 2026年5月30日
