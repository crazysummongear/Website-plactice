# Test Fixes - Requirements

## Background
Kakei プロジェクトのテストスイートを実行した結果、バックエンド6テスト、フロントエンド80テストが失敗しています。これらの失敗を修正する必要があります。

## Bug Conditions

### Backend Test Failures (6 tests in csv-import.test.ts)

**Bug Condition 1: S3 GetObjectCommand Body mock が正しく動作しない**
- **Location**: `backend/src/handlers/csv-import.test.ts`
- **Symptoms**: 
  - S3から取得したCSVデータを読み込もうとすると `Cannot read properties of undefined (reading 'Body')` エラー
  - 6つのS3関連テストがすべて失敗
- **Root Cause**: 
  - S3Client のmockが正しく設定されていない
  - `Body.transformToString()` のmock構造が実際のAWS SDK v3の構造と一致していない
- **Expected Behavior**: 
  - S3からCSVファイルを取得してパースできる
  - BOM付きCSV、混合改行コード、空行などを正しく処理できる

### Frontend Test Failures (80 tests)

**Bug Condition 2: TopNavigation component import エラー**
- **Location**: `frontend/src/components/TopNavigation.test.tsx`
- **Symptoms**: 
  - "Element type is invalid: expected a string... but got: undefined"
  - TopNavigation が undefined になっている
- **Root Cause**: 
  - default export/named export の問題
  - import 文が正しくない可能性
- **Expected Behavior**: 
  - TopNavigation コンポーネントが正しくimportされる

**Bug Condition 3: localStorage mock が動作していない (transactions.test.ts)**
- **Location**: `frontend/src/api/transactions.test.ts`
- **Symptoms**: 
  - 認証トークンがない状態でもAPI呼び出しが成功してしまう
  - fetch mock が無視されて実際のデータが返される
- **Root Cause**: 
  - localStorage.getItem の mock が効いていない
  - fetch mock の設定が不完全
- **Expected Behavior**: 
  - 認証トークンがない場合はエラーをthrow
  - mock したresponseが返る

**Bug Condition 4: CSV API tests で localStorage mock が動作していない**
- **Location**: `frontend/src/api/csv.test.ts`
- **Symptoms**: 
  - "Get presigned URL failed: Not authenticated" エラー
  - すべてのCSV API testが失敗
- **Root Cause**: 
  - localStorage mock が各テストで正しく設定されていない
- **Expected Behavior**: 
  - presigned URL取得が成功する
  - S3アップロードのテストが通る

**Bug Condition 5: useAuth hook tests で AuthProvider context が動作していない**
- **Location**: `frontend/src/hooks/useAuth.test.ts`
- **Symptoms**: 
  - TypeError: Cannot read properties of null
  - 16テストが失敗
- **Root Cause**: 
  - renderHookの wrapper に AuthProvider が含まれていない
  - または AuthProvider が正しく初期化されていない
- **Expected Behavior**: 
  - useAuth hook が正しく動作する
  - login, logout, signup などの関数が呼び出せる

**Bug Condition 6: PrivateRoute tests で日本語テキストマッチング失敗**
- **Location**: `frontend/src/components/PrivateRoute.test.tsx`
- **Symptoms**: 
  - "Unable to find an element with the text: 読み込み中..."
  - 実際には "認証確認中..." というテキストが表示されている
- **Root Cause**: 
  - テストコードが古いテキストを探している
  - 実装が変更されたがテストが更新されていない
- **Expected Behavior**: 
  - "認証確認中..." テキストでテストが通る

**Bug Condition 7: CsvPreview tests で日本語テキストマッチング失敗**
- **Location**: `frontend/src/components/CsvPreview.test.tsx`
- **Symptoms**: 
  - 日本語テキストが見つからない
  - 実際には英語テキスト "No data to preview" が表示されている
- **Root Cause**: 
  - コンポーネントが英語で実装されているがテストが日本語を期待
- **Expected Behavior**: 
  - 実際の表示テキストに合わせたテストになる

**Bug Condition 8: ErrorBoundary tests で複数の同じテキスト要素**
- **Location**: `frontend/src/components/ErrorBoundary.test.tsx`
- **Symptoms**: 
  - "Found multiple elements with the text: /エラーが発生しました/i"
- **Root Cause**: 
  - `getByText` ではなく `getAllByText` を使うべき
- **Expected Behavior**: 
  - 複数の要素があっても正しくテストが通る

**Bug Condition 9: TransactionForm tests で select 要素の user.clear() エラー**
- **Location**: `frontend/src/components/TransactionForm.test.tsx`
- **Symptoms**: 
  - "clear()` is only supported on editable elements"
  - select要素に対してclear()を呼んでいる
- **Root Cause**: 
  - select要素はclear()できない
  - selectOneOptionを使うべき
- **Expected Behavior**: 
  - select要素の選択変更が正しく動作する

**Bug Condition 10: useTransactions cache invalidation tests が失敗**
- **Location**: `frontend/src/hooks/useTransactions.test.tsx`
- **Symptoms**: 
  - "expected "vi.fn()" to be called 2 times, but got 1 times"
  - キャッシュ無効化後の再fetchが呼ばれない
- **Root Cause**: 
  - waitFor のタイミングが短すぎる
  - またはReact Query のキャッシュ無効化が正しく動作していない
- **Expected Behavior**: 
  - create/update/delete後にgetTransactionsが再度呼ばれる

**Bug Condition 11: Navigation.integration tests で AuthContext エラー**
- **Location**: `frontend/src/components/Navigation.integration.test.tsx`
- **Symptoms**: 
  - "useAuthContext must be used within AuthProvider"
- **Root Cause**: 
  - テストのrender関数でAuthProviderがwrapされていない
- **Expected Behavior**: 
  - TopNavigationを使った統合テストが動作する

**Bug Condition 12: その他の小さな失敗**
- auth.test.ts: isTokenExpired が exp フィールドなしトークンを false 返す
- TransactionCard.test.tsx: 金額フォーマットの正規表現マッチ失敗

## Requirements

### Requirement 1: Backend S3 mock を修正
- **Priority**: High
- **Description**: 
  - csv-import.test.ts のS3Client mockを正しい構造に修正する
  - AWS SDK v3の実際の構造に合わせる
  - Body の transformToString() を正しく mock する
- **Acceptance Criteria**:
  - csv-import.test.ts の6テストすべてが合格
  - CSVパース、BOM処理、改行コード処理が正しく動作

### Requirement 2: TopNavigation import を修正
- **Priority**: High
- **Description**: 
  - TopNavigation.test.tsx の import 文を修正する
  - export/import の不一致を解消する
- **Acceptance Criteria**:
  - TopNavigation.test.tsx の9テストすべてが合格

### Requirement 3: transactions API tests の mock を修正
- **Priority**: High
- **Description**: 
  - localStorage.getItem の mock を各テストで正しく設定する
  - fetch mock を正しく設定して実際のデータが返らないようにする
- **Acceptance Criteria**:
  - transactions.test.ts の認証・エラー処理関連テストが合格

### Requirement 4: CSV API tests の localStorage mock を修正
- **Priority**: High
- **Description**: 
  - csv.test.ts で localStorage mock を各テストの beforeEach で設定する
  - presigned URL 取得前にトークンが設定されるようにする
- **Acceptance Criteria**:
  - csv.test.ts の8テストすべてが合格

### Requirement 5: useAuth hook tests の wrapper を修正
- **Priority**: High
- **Description**: 
  - renderHook に AuthProvider wrapper を追加する
  - またはuseAuthのmockを正しく設定する
- **Acceptance Criteria**:
  - useAuth.test.ts の16失敗テストが合格

### Requirement 6: PrivateRoute tests のテキストマッチを修正
- **Priority**: Medium
- **Description**: 
  - "読み込み中..." → "認証確認中..." に変更
- **Acceptance Criteria**:
  - PrivateRoute.test.tsx の3テストが合格

### Requirement 7: CsvPreview tests のテキストマッチを修正
- **Priority**: Medium
- **Description**: 
  - 日本語テキストを実際の英語テキストに変更
  - または CsvPreview コンポーネントを日本語化
- **Acceptance Criteria**:
  - CsvPreview.test.tsx の8テストが合格

### Requirement 8: ErrorBoundary tests で getAllByText を使用
- **Priority**: Low
- **Description**: 
  - getByText → getAllByText に変更
  - または最初の要素を取得するようにする
- **Acceptance Criteria**:
  - ErrorBoundary.test.tsx の2テストが合格

### Requirement 9: TransactionForm tests の select 操作を修正
- **Priority**: Medium
- **Description**: 
  - user.clear(select) を削除
  - user.selectOptions() を使用
- **Acceptance Criteria**:
  - TransactionForm.test.tsx の9テストが合格

### Requirement 10: useTransactions cache invalidation の waitFor を修正
- **Priority**: Medium
- **Description**: 
  - waitFor のタイムアウトを延長
  - またはReact Query の invalidateQueries を正しく await
- **Acceptance Criteria**:
  - useTransactions.test.tsx の3キャッシュ無効化テストが合格

### Requirement 11: Navigation.integration tests の wrapper を修正
- **Priority**: Medium
- **Description**: 
  - render に AuthProvider を追加
- **Acceptance Criteria**:
  - Navigation.integration.test.tsx の3テストが合格

### Requirement 12: その他の小さな失敗を修正
- **Priority**: Low
- **Description**: 
  - auth.test.ts の isTokenExpired のロジックを修正
  - TransactionCard.test.tsx の金額表示の正規表現を修正
- **Acceptance Criteria**:
  - 残りの失敗テストが合格

## Success Metrics
- バックエンドテスト: 76テスト中76テスト合格 (100%)
- フロントエンドテスト: 188テスト中188テスト合格 (100%)
