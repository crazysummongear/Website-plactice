# Test Fixes - Design

## Overview
このspecは、Kakeiプロジェクトで失敗している86個のテスト（バックエンド6個、フロントエンド80個）を修正します。

## Architecture

### Test Fix Categories

1. **Mock Configuration Fixes** (高優先度)
   - S3Client mock (Backend)
   - localStorage mock (Frontend)
   - fetch mock (Frontend)
   - AuthProvider/Context mock (Frontend)

2. **Text Matching Fixes** (中優先度)
   - 日本語/英語テキストの不一致修正
   - コンポーネント実装とテストの同期

3. **User Event Fixes** (中優先度)
   - select要素操作の修正
   - user-event API の正しい使用

4. **Timing/Async Fixes** (中優先度)
   - React Query cache invalidation
   - waitFor timeout調整

## Implementation Plan

### Phase 1: Backend Test Fixes (csv-import.test.ts)

#### Fix 1: S3Client Mock Structure
**File**: `backend/src/handlers/csv-import.test.ts`

**Problem**: 現在のmock構造が AWS SDK v3 の実際の構造と一致していない

**Current Mock**:
```typescript
jest.mocked(S3Client).mockImplementation(() => ({
  send: jest.fn().mockResolvedValue({
    Body: {
      transformToString: jest.fn().mockResolvedValue(csvContent),
    },
  }),
} as any));
```

**Issue**: AWS SDK v3 の `GetObjectCommand` のレスポンスは `Body` が `ReadableStream` または `Blob` で、`transformToString()` メソッドを直接持っていない

**Solution**: 
```typescript
import { Readable } from 'stream';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Create a mock readable stream
const mockStream = new Readable();
mockStream.push(csvContent);
mockStream.push(null); // End of stream

jest.mocked(S3Client).mockImplementation(() => {
  return {
    send: jest.fn().mockImplementation((command) => {
      if (command instanceof GetObjectCommand) {
        return Promise.resolve({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        });
      }
      return Promise.resolve({});
    }),
  } as any;
});
```

**Alternative (Simpler)**:
実装コード側で `Body` の型チェックを追加し、テスト時には直接文字列を返すmockを許容する：

```typescript
// In csv-import.ts
const response = await s3.send(new GetObjectCommand(params));
if (!response.Body) {
  console.error('No body in S3 response');
  return;
}

// Handle mock objects in tests
const bodyContent = typeof response.Body.transformToString === 'function'
  ? await response.Body.transformToString('utf-8')
  : await streamToString(response.Body as Readable);
```

**Recommended Approach**: Option 2 (簡単な方)
- テストで `Body` オブジェクトに直接 `transformToString` を追加
- ただし、実装コードも `undefined` チェックを追加

### Phase 2: Frontend High Priority Fixes

#### Fix 2: TopNavigation Import
**File**: `frontend/src/components/TopNavigation.test.tsx`

**Investigation Steps**:
1. TopNavigation.tsx の export を確認
2. import文を修正

**Expected Fix**:
```typescript
// If TopNavigation uses default export
import TopNavigation from './TopNavigation';

// If TopNavigation uses named export
import { TopNavigation } from './TopNavigation';
```

#### Fix 3: transactions API Tests - localStorage Mock
**File**: `frontend/src/api/transactions.test.ts`

**Problem**: localStorage.getItem が mock されていない、または mock が効いていない

**Solution**:
```typescript
describe('transactions.ts - Transaction API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default localStorage mocks
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'kakei_id_token') return 'mock-token-123';
      if (key === 'kakei_access_token') return 'mock-access-123';
      return null;
    });
    
    // Setup default fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });
  });
  
  it('should throw error when not authenticated', async () => {
    // Override the mock for this specific test
    Storage.prototype.getItem = vi.fn(() => null);
    
    await expect(getTransactions()).rejects.toThrow('Not authenticated');
  });
});
```

#### Fix 4: CSV API Tests - localStorage Mock
**File**: `frontend/src/api/csv.test.ts`

**Same approach as Fix 3**: Setup localStorage mock in beforeEach

#### Fix 5: useAuth Hook Tests - AuthProvider Wrapper
**File**: `frontend/src/hooks/useAuth.test.ts`

**Problem**: renderHook needs AuthProvider wrapper

**Solution 1** - Use real AuthProvider:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

it('should login user successfully', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper });
  
  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });
  
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

**Solution 2** - Mock the entire hook:
```typescript
// If tests are too complex, mock useAuth completely
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    // ... etc
  })),
}));
```

**Recommended**: Solution 1 (real AuthProvider) for unit tests of useAuth

### Phase 3: Frontend Medium Priority Fixes

#### Fix 6: PrivateRoute Text Matching
**File**: `frontend/src/components/PrivateRoute.test.tsx`

**Simple Find & Replace**:
- `'読み込み中...'` → `'認証確認中...'`

#### Fix 7: CsvPreview Text Matching
**File**: `frontend/src/components/CsvPreview.test.tsx`

**Options**:
1. Update tests to match English text
2. Update component to use Japanese text

**Recommended**: Option 1 (update tests)
```typescript
// Change from:
expect(screen.getByText('CSV データがありません')).toBeInTheDocument();

// To:
expect(screen.getByText('No data to preview')).toBeInTheDocument();
```

Or add `data-testid` for more reliable testing:
```typescript
// In component:
<div data-testid="empty-state">No data to preview</div>

// In test:
expect(screen.getByTestId('empty-state')).toBeInTheDocument();
```

#### Fix 8: ErrorBoundary Multiple Elements
**File**: `frontend/src/components/ErrorBoundary.test.tsx`

**Solution**:
```typescript
// Change from:
expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();

// To:
expect(screen.getAllByText(/エラーが発生しました/)[0]).toBeInTheDocument();

// Or use more specific query:
expect(screen.getByRole('heading', { name: /エラーが発生しました/ })).toBeInTheDocument();
```

#### Fix 9: TransactionForm Select Operations
**File**: `frontend/src/components/TransactionForm.test.tsx`

**Problem**: Cannot call `user.clear()` on select element

**Solution**:
```typescript
// Remove this line:
await user.clear(categoryInput);

// Replace with:
await user.selectOptions(categoryInput, '食費');

// Or if you need to "clear" selection:
await user.selectOptions(categoryInput, ''); // Select empty option
```

#### Fix 10: useTransactions Cache Invalidation
**File**: `frontend/src/hooks/useTransactions.test.tsx`

**Problem**: React Query refetch not happening within waitFor timeout

**Solution**:
```typescript
await waitFor(() => {
  expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledTimes(2);
}, {
  timeout: 3000, // Increase timeout
  interval: 100, // Check more frequently
});

// Or explicitly trigger refetch:
await result.current.create.mutateAsync(newTransaction);
await queryClient.invalidateQueries(['transactions']);
await waitFor(() => {
  expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledTimes(2);
});
```

#### Fix 11: Navigation Integration Tests
**File**: `frontend/src/components/Navigation.integration.test.tsx`

**Solution**: Add AuthProvider wrapper to render
```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

it('should navigate between all pages', async () => {
  renderWithProviders(<TopNavigation />);
  // ... test logic
});
```

### Phase 4: Frontend Low Priority Fixes

#### Fix 12: Misc Small Fixes

**auth.test.ts - isTokenExpired**:
```typescript
// In auth.ts
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true; // Treat missing exp as expired
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

**TransactionCard.test.tsx - Amount Regex**:
```typescript
// Current test looks for "5000"
// But component displays "¥5,000" with comma

// Change from:
expect(screen.getByText(/5000/)).toBeInTheDocument();

// To:
expect(screen.getByText(/5,000/)).toBeInTheDocument();
// Or:
expect(screen.getByText(/¥.*5.*000/)).toBeInTheDocument();
```

## Testing Strategy

### Test Execution Order
1. Fix Backend tests first (easier, fewer dependencies)
2. Fix Frontend high-priority (mock configuration issues)
3. Fix Frontend medium-priority (text matching, user events)
4. Fix Frontend low-priority (small fixes)

### Verification After Each Fix
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# Specific file
npm test -- csv-import.test.ts
```

## Risk Analysis

### Low Risk Fixes
- Text matching changes
- Adding waitFor timeouts
- Removing user.clear() calls

### Medium Risk Fixes
- Mock configuration changes (might affect other tests)
- AuthProvider wrapper (might change test behavior)

### High Risk Fixes
- S3Client mock structure (might require implementation changes)
- fetch/localStorage mocks (wide-reaching)

## Rollback Plan
- Each test file modification is isolated
- Can revert individual files if tests fail
- Git commit after each successful category fix
