# AWS 権限・構成設計書 (個人開発・低コスト運用版)

## 1. 基本方針
- **Identity Center による管理**: Root ユーザーは封印し、SSO (Identity Center) 経由で操作する。
- **最小権限の原則**: 会社運用を参考に、Admin 権限と Billing 権限を分離する。
- **コスト・ガバナンス**: 「人月5ドル」の学習コストを死守するため、タグ付けによるコスト可視化を徹底する。

## 2. アクセス管理
- **Identity Center インスタンス**: 組織インスタンス (AWS Organizations 連携)。
- **CLI プロファイル名**: `dev`。
- **割り当てロール (権限セット)**:
  - `Admin-Permission`: `AdministratorAccess` (Terraform 実行用)。
  - `Billing-Permission`: `Billing` (予算管理・サポート用)。

## 3. タグ付け戦略 (Default Tags)
すべてのリソースに以下のタグを強制付与する。
- `Project`: プロジェクト識別子
- `Environment`: `dev`
- `Owner`: ユーザー名
- `ManagedBy`: `Terraform`
- `CostCenter`: `learning-investment`

## 4. 低コスト運用のための制約 (5ドル枠)
- **DB**: DynamoDB は必ず `PAY_PER_REQUEST` (オンデマンド) で構成する。
- **Storage**: S3 などのストレージは最小限の構成とし、ライフサイクルポリシーでコストを抑制する。
- **Alert**: AWS Budgets で 1ドル, 2.5ドル, 5ドルの通知を設定済み。