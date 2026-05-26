# セキュリティ評価レポート

**プロジェクト**: kakei（家計管理アプリ）  
**評価日**: 2026年5月26日  
**対象**: MVP（PHASE 1）

---

## 📊 総合評価

**セキュリティレベル**: ⚠️ **中程度（改善推奨）**

個人利用のMVPとしては**許容範囲内**ですが、本番環境や複数ユーザーでの利用には**セキュリティ強化が必要**です。

---

## ✅ 実装済みのセキュリティ対策

### 1. 認証・認可

| 項目 | 状態 | 詳細 |
|------|------|------|
| **Cognito認証** | ✅ 実装済み | AWS Cognito User Poolによるユーザー認証 |
| **JWT検証** | ✅ 実装済み | API Gateway Cognito Authorizerで自動検証 |
| **パスワードポリシー** | ✅ 実装済み | 最小12文字、大文字・小文字・数字・記号必須 |
| **メール検証** | ✅ 実装済み | サインアップ時のメールアドレス検証 |
| **ユーザーID検証** | ✅ 実装済み | Lambda関数内でJWTからユーザーIDを抽出 |

**評価**: 🟢 **良好** - AWS Cognitoによる堅牢な認証基盤

---

### 2. データアクセス制御

| 項目 | 状態 | 詳細 |
|------|------|------|
| **ユーザーデータ分離** | ✅ 実装済み | DynamoDBのPKに`USER#userId`を使用 |
| **Lambda IAM権限** | ✅ 実装済み | 最小権限の原則に従った権限設定 |
| **API認可** | ✅ 実装済み | 全エンドポイントでCognito認証必須 |

**評価**: 🟢 **良好** - ユーザーごとにデータが分離されている

---

### 3. 通信セキュリティ

| 項目 | 状態 | 詳細 |
|------|------|------|
| **HTTPS強制** | ✅ 実装済み | CloudFront経由で全通信がHTTPS |
| **API Gateway HTTPS** | ✅ 実装済み | API Gatewayは常にHTTPS |
| **TLS 1.2+** | ✅ 実装済み | AWS標準でTLS 1.2以上を使用 |

**評価**: 🟢 **良好** - 全通信が暗号化されている

---

### 4. データ保護

| 項目 | 状態 | 詳細 |
|------|------|------|
| **S3暗号化** | ✅ 実装済み | S3バケットでSSE-S3暗号化有効 |
| **DynamoDB暗号化** | ✅ 実装済み | AWS管理キーによる保存時暗号化 |
| **CSV自動削除** | ✅ 実装済み | S3ライフサイクルポリシーで7日後削除 |

**評価**: 🟢 **良好** - データは保存時に暗号化されている

---

## ⚠️ セキュリティリスクと改善推奨事項

### 🔴 高優先度（本番環境では必須）

#### 1. CORS設定が緩い

**現状**:
```typescript
'Access-Control-Allow-Origin': '*'  // 全オリジンを許可
```

**リスク**:
- 任意のWebサイトからAPIを呼び出せる
- XSS攻撃のリスク増加
- 意図しないドメインからのアクセス

**推奨対策**:
```typescript
// 本番環境では具体的なドメインを指定
'Access-Control-Allow-Origin': 'https://drwpbnzy3pzzt.cloudfront.net'
```

**実装方法**:
1. `backend/src/lib/response.ts`を修正
2. 環境変数`ALLOWED_ORIGIN`を追加
3. Terraform変数で管理

---

#### 2. 入力バリデーションが不十分

**現状**:
```typescript
// 基本的なnullチェックのみ
if (!body.date || !body.category || !body.amount) {
  return errorResponse('Missing required fields', 400);
}
```

**リスク**:
- SQLインジェクション（DynamoDBでは低リスク）
- XSS攻撃（フロントエンドで表示時）
- データ型不正による予期しないエラー

**推奨対策**:
```typescript
// Zodなどのバリデーションライブラリを使用
import { z } from 'zod';

const TransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive().max(1000000000),
  category: z.string().min(1).max(50),
  memo: z.string().max(500).optional(),
  type: z.enum(['income', 'expense']),
});
```

---

#### 3. レート制限なし

**現状**:
- API Gatewayのスロットリング設定なし
- Lambda関数の同時実行数制限なし

**リスク**:
- DDoS攻撃による高額請求
- 悪意あるユーザーによるリソース枯渇

**推奨対策**:
```hcl
# Terraform設定
resource "aws_api_gateway_usage_plan" "kakei_usage_plan" {
  name = "kakei-usage-plan"
  
  throttle_settings {
    burst_limit = 100    # バースト時の最大リクエスト数
    rate_limit  = 50     # 1秒あたりの平均リクエスト数
  }
  
  quota_settings {
    limit  = 10000       # 期間内の最大リクエスト数
    period = "DAY"       # 日次制限
  }
}
```

---

### 🟡 中優先度（セキュリティ強化）

#### 4. CloudWatch Logsに機密情報が含まれる可能性

**現状**:
```typescript
console.log('Event:', JSON.stringify(event, null, 2));
```

**リスク**:
- JWTトークンがログに記録される
- ユーザーの個人情報がログに残る

**推奨対策**:
```typescript
// 機密情報をマスクしてログ出力
const sanitizedEvent = {
  ...event,
  headers: {
    ...event.headers,
    Authorization: event.headers.Authorization ? '[REDACTED]' : undefined,
  },
};
console.log('Event:', JSON.stringify(sanitizedEvent, null, 2));
```

---

#### 5. エラーメッセージが詳細すぎる

**現状**:
```typescript
console.error('Error creating transaction:', error);
return errorResponse('Failed to create transaction', 500);
```

**リスク**:
- スタックトレースから内部構造が漏洩
- 攻撃者に有用な情報を提供

**推奨対策**:
```typescript
// 本番環境では詳細なエラーをログのみに記録
console.error('Error creating transaction:', error);

// ユーザーには一般的なエラーメッセージのみ返す
if (process.env.NODE_ENV === 'production') {
  return errorResponse('An error occurred', 500);
} else {
  return errorResponse(`Failed to create transaction: ${error.message}`, 500);
}
```

---

#### 6. S3 Presigned URLの有効期限が未設定

**現状**:
- CSV Import用のPresigned URLの有効期限が明示されていない

**推奨対策**:
```typescript
// 短い有効期限を設定（例: 15分）
const uploadUrl = s3.getSignedUrl('putObject', {
  Bucket: bucketName,
  Key: fileName,
  Expires: 900, // 15分
  ContentType: 'text/csv',
});
```

---

### 🟢 低優先度（将来的な改善）

#### 7. WAF（Web Application Firewall）未導入

**推奨対策**:
- AWS WAFをCloudFrontに統合
- SQLインジェクション、XSS攻撃を自動ブロック
- 地理的制限（日本のみ許可など）

**コスト**: 月額$5〜$10程度

---

#### 8. セキュリティヘッダーの追加

**推奨対策**:
```typescript
// CloudFront Functionsでセキュリティヘッダーを追加
headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
headers['x-content-type-options'] = 'nosniff';
headers['x-frame-options'] = 'DENY';
headers['x-xss-protection'] = '1; mode=block';
headers['content-security-policy'] = "default-src 'self'";
```

---

#### 9. 監査ログの実装

**推奨対策**:
- DynamoDBに監査ログテーブルを追加
- 全CRUD操作を記録（誰が、いつ、何を）
- CloudWatch Logsでアラート設定

---

#### 10. MFA（多要素認証）の導入

**推奨対策**:
- Cognito MFAを有効化
- SMS or TOTPによる2段階認証

---

## 🛡️ セキュリティチェックリスト

### 個人利用MVP（現在）

- [x] HTTPS通信
- [x] Cognito認証
- [x] データ暗号化（保存時）
- [x] ユーザーデータ分離
- [x] 最小権限IAMロール
- [ ] CORS制限
- [ ] 入力バリデーション強化
- [ ] レート制限
- [ ] ログの機密情報マスク

**評価**: ⚠️ **個人利用なら許容範囲、本番環境には不十分**

---

### 本番環境（推奨）

- [ ] CORS制限（特定ドメインのみ）
- [ ] 入力バリデーション（Zod等）
- [ ] レート制限（API Gateway）
- [ ] ログの機密情報マスク
- [ ] エラーメッセージの一般化
- [ ] Presigned URL有効期限設定
- [ ] WAF導入
- [ ] セキュリティヘッダー追加
- [ ] 監査ログ実装
- [ ] MFA有効化

---

## 📋 優先順位付き実装計画

### フェーズ1: 即座に対応（1-2時間）

1. **CORS制限** - `response.ts`と環境変数を修正
2. **入力バリデーション** - Zodライブラリ導入
3. **ログマスク** - 機密情報をログから除外

**コスト**: $0（開発時間のみ）

---

### フェーズ2: 短期対応（1日）

4. **レート制限** - API Gateway Usage Plan設定
5. **Presigned URL有効期限** - 15分に設定
6. **エラーメッセージ一般化** - 本番環境で詳細非表示

**コスト**: $0（開発時間のみ）

---

### フェーズ3: 中期対応（1週間）

7. **WAF導入** - CloudFrontに統合
8. **セキュリティヘッダー** - CloudFront Functions追加
9. **監査ログ** - DynamoDBテーブル追加

**コスト**: 月額$5〜$15程度

---

### フェーズ4: 長期対応（1ヶ月）

10. **MFA導入** - Cognito MFA有効化
11. **セキュリティ監視** - CloudWatch Alarms設定
12. **定期的なセキュリティ監査**

**コスト**: 月額$10〜$20程度

---

## 🎯 結論

### 現状の評価

**個人利用のMVPとしては**: ✅ **合格**
- 基本的なセキュリティ対策は実装済み
- AWS標準のセキュリティ機能を活用
- データは暗号化され、ユーザーごとに分離

**本番環境・複数ユーザー利用としては**: ⚠️ **要改善**
- CORS制限が緩い
- 入力バリデーションが不十分
- レート制限なし

---

### 推奨アクション

**今すぐ実施**:
1. CORS設定を特定ドメインに制限
2. 入力バリデーションを強化（Zod導入）
3. ログから機密情報を除外

**本番環境移行前に実施**:
4. API Gatewayレート制限設定
5. WAF導入
6. セキュリティヘッダー追加

---

**最終更新**: 2026年5月26日
