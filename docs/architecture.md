# kakei アーキテクチャ図

> Diagram-as-code: Mermaid で記述。GitHub / VS Code の Markdown プレビューで図として表示されます。

---

## 全体アーキテクチャ

```mermaid
graph TB
    subgraph Client["🖥️ クライアント（ブラウザ）"]
        React["React + TypeScript<br/>Vite / Tailwind CSS"]
    end

    subgraph AWS["☁️ AWS (ap-northeast-1)"]
        subgraph CDN["コンテンツ配信"]
            CF["CloudFront<br/>E2LK33Q7R6I7R5<br/>drwpbnzy3pzzt.cloudfront.net"]
            S3F["S3 (フロントエンド)<br/>kakei-frontend-dev-*"]
        end

        subgraph Auth["認証"]
            Cognito["Cognito User Pool<br/>kakei-user-pool-dev<br/>ap-northeast-1_CVGCgVANa"]
        end

        subgraph API["API 層"]
            APIGW["API Gateway<br/>REST API<br/>/transactions<br/>/categories<br/>/csv/upload-url"]
        end

        subgraph Compute["コンピュート"]
            LambdaTx["Lambda<br/>kakei-transactions<br/>128MB / 10s"]
            LambdaCat["Lambda<br/>kakei-categories<br/>128MB / 10s"]
            LambdaCSV["Lambda<br/>kakei-csv-import<br/>128MB / 10s"]
        end

        subgraph Storage["ストレージ"]
            DDB["DynamoDB<br/>KakeiTable<br/>PK: USER#userId<br/>SK: TX#date#txId"]
            S3CSV["S3 (CSV一時保存)<br/>kakei-csv-temp-dev-*<br/>7日後自動削除"]
        end
    end

    React -->|"HTTPS"| CF
    CF -->|"OAC"| S3F
    React -->|"認証リクエスト"| Cognito
    Cognito -->|"JWT トークン"| React
    React -->|"API リクエスト + JWT"| APIGW
    APIGW -->|"JWT 検証"| Cognito
    APIGW --> LambdaTx
    APIGW --> LambdaCat
    APIGW --> LambdaCSV
    LambdaTx -->|"CRUD"| DDB
    LambdaCat -->|"CRUD"| DDB
    LambdaCSV -->|"Presigned URL"| S3CSV
    LambdaCSV -->|"CSV → DynamoDB"| DDB
```

---

## 認証フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Login as LoginPage
    participant Cognito as Cognito User Pool
    participant API as API Gateway
    participant Lambda as Lambda

    User->>Login: メール + パスワード入力
    Login->>Cognito: signIn(email, password)
    Cognito-->>Login: JWT (IdToken, AccessToken)
    Login->>Login: localStorage に保存

    User->>Login: API リクエスト
    Login->>API: Authorization: Bearer {IdToken}
    API->>Cognito: JWT 検証
    Cognito-->>API: 検証 OK
    API->>Lambda: リクエスト転送
    Lambda-->>API: レスポンス
    API-->>Login: JSON レスポンス
```

---

## サインアップフロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Signup as SignupPage
    participant Cognito as Cognito User Pool
    participant Email as メール

    User->>Signup: メール + パスワード入力
    Signup->>Cognito: signUp(email, password)
    Cognito->>Email: 確認コード送信
    Cognito-->>Signup: 登録受付

    Signup->>User: 確認コード入力画面を表示
    User->>Signup: 6桁コード入力
    Signup->>Cognito: confirmSignUp(email, code)
    Cognito-->>Signup: 確認完了
    Signup->>User: ログインページへリダイレクト
```

---

## DynamoDB データモデル

```mermaid
erDiagram
    KakeiTable {
        string PK "USER#userId"
        string SK "TX#date#txId または CAT#categoryId"
        string type "income / expense"
        number amount "金額"
        string category "カテゴリ"
        string date "日付 (YYYY-MM-DD)"
        string memo "メモ (optional)"
        string createdAt "作成日時"
        string updatedAt "更新日時"
    }
```

---

## Terraform モジュール構成

```mermaid
graph TD
    Main["main.tf"] --> S3M["module: s3"]
    Main --> CFM["module: cloudfront"]
    Main --> DDBM["module: dynamodb"]
    Main --> CogM["module: cognito"]
    Main --> LambM["module: lambda"]
    Main --> APIM["module: api_gateway"]

    S3M -->|"bucket_id, bucket_arn"| CFM
    S3M -->|"csv_bucket_name, csv_bucket_arn"| LambM
    DDBM -->|"table_name, table_arn"| LambM
    CogM -->|"user_pool_arn"| APIM
    LambM -->|"lambda_arn, invoke_arn × 3"| APIM
```

---

## 進捗状況

```mermaid
gantt
    title kakei MVP 実装進捗
    dateFormat  YYYY-MM-DD
    section インフラ
    AWS 認証設定          :done, 2026-05-04, 1d
    S3 + CloudFront       :done, 2026-05-04, 2d
    DynamoDB + Cognito    :done, 2026-05-05, 2d
    Lambda + API Gateway  :done, 2026-05-06, 2d
    section バックエンド
    共通ライブラリ         :done, 2026-05-06, 1d
    Lambda ハンドラ        :done, 2026-05-06, 2d
    section フロントエンド
    認証画面              :done, 2026-05-07, 3d
    収支機能              :active, 2026-05-10, 5d
    CSV インポート         :2026-05-15, 3d
    section デプロイ
    本番デプロイ           :2026-05-18, 2d
```
