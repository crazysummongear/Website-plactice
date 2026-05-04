# リポジトリ運用方針

**作成日**: 2026年5月4日  
**プロジェクト**: AI_Typescript_Terraform（個人学習プロジェクト）

---

## 1. ブランチ戦略

### 採用戦略: GitHub Flow（シンプル版）

個人開発の小規模プロジェクトのため、**シンプルで迅速な進捗管理**を優先します。

#### ブランチ構成

| ブランチ名 | 用途 | ルール |
|-----------|------|--------|
| `main` | 本番・リリース対象 | 常に動作可能な状態を維持。直接コミット不可（Pull Request 必須） |
| `develop` | 開発の統合ブランチ | 開発中の機能を集約。テスト後に `main` へマージ |
| `feature/*` | 機能追加・バグ修正 | `develop` から分岐。完成後、Pull Request で統合 |

---

## 2. コミットメッセージの規則

### 形式: 絵文字 + 簡潔な説明 + 詳細（必要に応じて）

#### 絵文字・タイプ一覧

| 絵文字 | タイプ | 説明 |
|------|-------|------|
| ✨ | feat | 新機能追加 |
| 🐛 | fix | バグ修正 |
| 📝 | docs | ドキュメント作成・更新 |
| 🎨 | style | コード格式・スタイル修正 |
| ♻️ | refactor | コード改善（機能変更なし） |
| ✅ | test | テスト追加・修正 |
| 🚀 | chore | ビルド・依存関係・設定変更 |
| 🔧 | config | Terraform・設定ファイル更新 |

#### コミットメッセージ例

```
✨ feat: AWS Cognito User Pool 設定

- Cognito User Pool を Terraform で定義
- パスワードポリシー設定（最小12文字）
- E-mail を主要なユーザー名属性に設定

Fixes #1
```

---

## 3. GitHub 活用法（Issue・PR）

### Issue の使用方法

新しい機能開発、バグ発見、ドキュメント作成が必要な場合に Issue を作成します。

#### Issue のラベル分類

| ラベル | 意味 |
|-------|------|
| `bug` | バグ・不具合 |
| `enhancement` | 新機能提案 |
| `documentation` | ドキュメント関連 |
| `blocked` | 他の作業に依存 |

### Pull Request の使用方法

機能開発・バグ修正・ドキュメント更新完了時に PR を作成します。

#### PR マージ前のチェック

1. コードレビュー完了
2. テスト実施済み
3. .gitignore で機密情報を除外
4. コミットメッセージが規則に従っている

---

## 4. 秘匿情報の扱い

### .gitignore による除外設定

#### 対象ファイル

| ファイル | 理由 |
|---------|------|
| `.env` | AWS アクセスキー、データベース接続情報 |
| `.env.*.local` | ローカル環境固有の設定 |
| `terraform/*.tfvars` | Terraform 変数ファイル（秘匿情報含む） |
| `terraform/terraform.tfstate` | Terraform 状態ファイル（リソース情報含む） |
| `.aws/credentials` | AWS CLI 認証情報 |

### 秘匿情報が誤ってプッシュされた場合の対応

```bash
git rm --cached .env
git commit --amend --no-edit
git push origin main --force-with-lease
```

---

## 5. 日々の開発ワークフロー

```bash
# 1. Feature ブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# 2. 実装・コミット
git add .
git commit -m "✨ feat: 説明"

# 3. リモートにプッシュ
git push origin feature/feature-name

# 4. GitHub で Pull Request 作成

# 5. マージ後、ローカル更新
git checkout develop
git pull origin develop
```

---

**最終更新**: 2026年5月4日 11:00 JST