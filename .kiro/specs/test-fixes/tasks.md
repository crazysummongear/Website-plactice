# Implementation Plan - Test Fixes

**プロジェクト名**: test-fixes (Kakei テスト修正)
**作成日**: 2026年6月6日
**目標**: 失敗している86個のテストを修正（バックエンド6個、フロントエンド80個）

---

## Overview

Kakei プロジェクトのテストスイートで失敗している86個のテストを体系的に修正します。主な問題は mock 設定、テキストマッチング、非同期処理のタイミングです。

---

## Tasks

### 1. Backend Tests

#### 1.1: Fix Backend S3 Mock
- [x] Task 1.1
- Status: not_started
- Description: Modify S3Client mock structure to match AWS SDK v3
- Files: backend/src/handlers/csv-import.test.ts
- Verification: Run `npm test -- csv-import.test.ts` - all 6 tests pass

### 2. Frontend High Priority

#### 2.1: Fix TopNavigation Import
- [ ] Task 2.1  
- Status: not_started
- Description: Fix TopNavigation component import error
- Files: frontend/src/components/TopNavigation.test.tsx
- Verification: Run `npm test -- TopNavigation.test.tsx` - all 9 tests pass
- Dependencies: None

#### 2.2: Fix transactions API localStorage Mock
- [ ] Task 2.2
- Status: not_started
- Description: Add localStorage mock in beforeEach
- Files: frontend/src/api/transactions.test.ts
- Verification: Run `npm test -- transactions.test.ts`
- Dependencies: None

#### 2.3: Fix CSV API localStorage Mock
- [ ] Task 2.3
- Status: not_started
- Description: Add localStorage mock for CSV API tests
- Files: frontend/src/api/csv.test.ts
- Verification: Run `npm test -- csv.test.ts` - all 8 tests pass
- Dependencies: None

#### 2.4: Fix useAuth Hook Tests
- [ ] Task 2.4
- Status: not_started
- Description: Add AuthProvider wrapper to useAuth tests
- Files: frontend/src/hooks/useAuth.test.ts
- Verification: Run `npm test -- useAuth.test.ts`
- Dependencies: None

### 3. Frontend Medium Priority

#### 3.1: Fix PrivateRoute Text Matching
- [ ] Task 3.1
- Status: not_started
- Description: Update loading text to "認証確認中..."
- Files: frontend/src/components/PrivateRoute.test.tsx
- Verification: Run `npm test -- PrivateRoute.test.tsx`
- Dependencies: None

#### 3.2: Fix CsvPreview Text Matching  
- [ ] Task 3.2
- Status: not_started
- Description: Update text expectations to match English
- Files: frontend/src/components/CsvPreview.test.tsx
- Verification: Run `npm test -- CsvPreview.test.tsx`
- Dependencies: None

#### 3.3: Fix ErrorBoundary Multiple Elements
- [ ] Task 3.3
- Status: not_started
- Description: Use getAllByText or more specific queries
- Files: frontend/src/components/ErrorBoundary.test.tsx
- Verification: Run `npm test -- ErrorBoundary.test.tsx`
- Dependencies: None

#### 3.4: Fix TransactionForm Select Operations
- [ ] Task 3.4
- Status: not_started
- Description: Remove user.clear() on select elements
- Files: frontend/src/components/TransactionForm.test.tsx
- Verification: Run `npm test -- TransactionForm.test.tsx`
- Dependencies: None

#### 3.5: Fix useTransactions Cache Invalidation
- [ ] Task 3.5
- Status: not_started
- Description: Increase waitFor timeout
- Files: frontend/src/hooks/useTransactions.test.tsx
- Verification: Run `npm test -- useTransactions.test.tsx`
- Dependencies: None

#### 3.6: Fix Navigation Integration Tests
- [ ] Task 3.6
- Status: not_started
- Description: Add AuthProvider wrapper
- Files: frontend/src/components/Navigation.integration.test.tsx
- Verification: Run `npm test -- Navigation.integration.test.tsx`
- Dependencies: None

### 4. Frontend Low Priority

#### 4.1: Fix TransactionCard Amount Display
- [ ] Task 4.1
- Status: not_started
- Description: Update regex to match formatted amount
- Files: frontend/src/components/TransactionCard.test.tsx
- Verification: Run `npm test -- TransactionCard.test.tsx`
- Dependencies: None

#### 4.2: Fix auth.test.ts isTokenExpired
- [ ] Task 4.2
- Status: not_started
- Description: Return true when exp field is missing
- Files: frontend/src/api/auth.ts, frontend/src/api/auth.test.ts
- Verification: Run `npm test -- auth.test.ts`
- Dependencies: None

### 5. Final Verification

#### 5.1: Run Full Test Suite
- [ ] Task 5.1
- Status: not_started
- Description: Execute complete test suite
- Dependencies: [1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2]
- Verification: Backend 76/76, Frontend 188/188 tests passing

