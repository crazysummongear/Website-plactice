# テスト駆動開発（TDD）完全ガイド

**対象**: テストの書き方を学びたい人  
**作成日**: 2026年5月26日  
**目的**: kakeiプロジェクトでのテスト戦略を理解する

---

## 📚 目次

1. [テスト駆動開発とは](#1-テスト駆動開発とは)
2. [3つのテストレベル](#2-3つのテストレベル)
3. [TDDのサイクル](#3-tddのサイクル)
4. [kakeiプロジェクトのテスト現状](#4-kakeiプロジェクトのテスト現状)
5. [実装例：TransactionForm](#5-実装例transactionform)
6. [実装例：Lambda ハンドラー](#6-実装例lambda-ハンドラー)
7. [テスト戦略の選択](#7-テスト戦略の選択)

---

## 1. テスト駆動開発とは

### 1.1 TDD（Test-Driven Development）の定義

**TDD** = テストを先に書いて、そのテストを通すコードを実装する開発手法

```
従来の開発:
コード実装 → テスト作成 → テスト実行 → バグ修正

TDD:
テスト作成 → コード実装 → テスト実行 → リファクタリング
```

### 1.2 TDDの3つのステップ（Red-Green-Refactor）

```
┌─────────────────────────────────────┐
│  1️⃣ RED: テストを書く（失敗する）    │
│  テストを実行 → 失敗                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  2️⃣ GREEN: コードを書く（成功させる）│
│  最小限のコードを実装                 │
│  テストを実行 → 成功                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  3️⃣ REFACTOR: コードを改善する      │
│  テストを実行 → 成功を保つ           │
│  コードを整理・最適化                 │
└─────────────────────────────────────┘
```

### 1.3 TDDのメリット・デメリット

| メリット | デメリット |
|---------|----------|
| ✅ バグが少ない | ❌ 時間がかかる |
| ✅ 設計が良くなる | ❌ 学習コストが高い |
| ✅ リファクタリングが安全 | ❌ テスト保守が大変 |
| ✅ ドキュメント代わり | ❌ 全員が理解する必要 |

---

## 2. 3つのテストレベル

### 2.1 単体テスト（Unit Test）

**対象**: 1つの関数・コンポーネント

```typescript
// 例: 金額を検証する関数
function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000;
}

// テスト
describe('validateAmount', () => {
  it('正の数を受け取ると true を返す', () => {
    expect(validateAmount(1000)).toBe(true);
  });
  
  it('0 以下の数を受け取ると false を返す', () => {
    expect(validateAmount(0)).toBe(false);
  });
  
  it('100万を超える数を受け取ると false を返す', () => {
    expect(validateAmount(1000001)).toBe(false);
  });
});
```

**特徴**:
- 🎯 テスト対象が明確
- ⚡ 実行が速い
- 🔧 デバッグが簡単

**kakeiの例**: PrivateRoute の単体テスト

### 2.2 統合テスト（Integration Test）

**対象**: 複数のコンポーネント・モジュール間の連携

```typescript
// 例: ログイン画面 + 認証API + ダッシュボード
describe('ログインフロー', () => {
  it('ログイン → ダッシュボード表示', async () => {
    // 1. ログイン画面を表示
    render(<LoginPage />);
    
    // 2. メール・パスワードを入力
    fireEvent.change(screen.getByPlaceholderText('メール'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' }
    });
    
    // 3. ログインボタンをクリック
    fireEvent.click(screen.getByText('ログイン'));
    
    // 4. ダッシュボードが表示される
    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });
  });
});
```

**特徴**:
- 🔗 複数の部品の連携をテスト
- ⏱️ 実行が遅い
- 🐛 デバッグが難しい

**kakeiの例**: PrivateRoute の統合テスト

### 2.3 E2E テスト（End-to-End Test）

**対象**: ユーザーの操作全体

```typescript
// 例: Cypress を使ったE2Eテスト
describe('家計簿アプリ全体フロー', () => {
  it('ユーザーがログイン → 収支入力 → 確認できる', () => {
    // 1. ログインページにアクセス
    cy.visit('https://kakei.example.com/login');
    
    // 2. ログイン
    cy.get('input[placeholder="メール"]').type('test@example.com');
    cy.get('input[placeholder="パスワード"]').type('password123');
    cy.get('button:contains("ログイン")').click();
    
    // 3. ダッシュボードが表示される
    cy.url().should('include', '/dashboard');
    
    // 4. 「収支を追加」ボタンをクリック
    cy.get('button:contains("収支を追加")').click();
    
    // 5. フォームに入力
    cy.get('input[type="date"]').type('2026-05-26');
    cy.get('select').select('食費');
    cy.get('input[type="number"]').type('1500');
    cy.get('textarea').type('スーパーで買い物');
    
    // 6. 保存ボタンをクリック
    cy.get('button:contains("登録")').click();
    
    // 7. 収支が一覧に表示される
    cy.get('text:contains("食費")').should('be.visible');
    cy.get('text:contains("¥1,500")').should('be.visible');
  });
});
```

**特徴**:
- 👤 ユーザー視点でテスト
- 🐢 実行が非常に遅い
- 🔍 デバッグが最も難しい

**kakeiの例**: まだ実装されていない

---

## 3. TDDのサイクル

### 3.1 具体例：TransactionForm のバリデーション

#### ステップ1️⃣: RED（テストを書く）

```typescript
// TransactionForm.test.tsx
describe('TransactionForm', () => {
  it('金額が空の場合、エラーメッセージを表示する', () => {
    render(<TransactionForm onSubmit={jest.fn()} />);
    
    // 金額フィールドを空のまま
    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);
    
    // エラーメッセージが表示される
    expect(screen.getByText('金額は正の数である必要があります')).toBeInTheDocument();
  });
  
  it('金額が負の数の場合、エラーメッセージを表示する', () => {
    render(<TransactionForm onSubmit={jest.fn()} />);
    
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '-1000' } });
    
    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('金額は正の数である必要があります')).toBeInTheDocument();
  });
  
  it('すべてのフィールドが有効な場合、onSubmit が呼ばれる', () => {
    const mockOnSubmit = jest.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);
    
    // フォームに入力
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1500' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2026-05-26' } });
    
    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);
    
    // onSubmit が呼ばれる
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
```

**この時点でテストを実行 → 失敗（コードがまだない）**

#### ステップ2️⃣: GREEN（コードを書く）

```typescript
// TransactionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive('金額は正の数である必要があります'),
  date: z.string().min(1, '日付を入力してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
});

export function TransactionForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="number"
        placeholder="0"
        {...register('amount', { valueAsNumber: true })}
      />
      {errors.amount && <p>{errors.amount.message}</p>}
      
      <input type="date" {...register('date')} />
      {errors.date && <p>{errors.date.message}</p>}
      
      <select {...register('category')}>
        <option value="">選択してください</option>
        <option value="food">食費</option>
      </select>
      {errors.category && <p>{errors.category.message}</p>}
      
      <button type="submit">登録</button>
    </form>
  );
}
```

**テストを実行 → 成功！**

#### ステップ3️⃣: REFACTOR（コードを改善）

```typescript
// より読みやすく、保守しやすくする
export function TransactionForm({ onSubmit, transaction }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction || {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
    },
  });
  
  const incomeExpense = watch('incomeExpense');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ... */}
    </form>
  );
}
```

**テストを実行 → 成功を保つ！**

---

## 4. kakeiプロジェクトのテスト現状

### 4.1 現在のテスト状況

| コンポーネント | 単体テスト | 統合テスト | E2E テスト |
|--------------|----------|----------|----------|
| PrivateRoute | ✅ 完成 | ✅ 完成 | ❌ なし |
| LoginPage | ❌ なし | ❌ なし | ❌ なし |
| SignupPage | ❌ なし | ❌ なし | ❌ なし |
| TransactionForm | ❌ なし | ❌ なし | ❌ なし |
| Lambda handlers | ❌ なし | ❌ なし | ❌ なし |

### 4.2 優先度別テスト計画

**🔴 最優先（セキュリティ・ビジネスロジック）**:
- LoginPage バリデーション
- SignupPage バリデーション
- Lambda ハンドラー（transactions）
- Lambda ハンドラー（categories）

**🟡 中優先（ユーザー体験）**:
- TransactionForm バリデーション
- TransactionCard 表示
- DashboardPage 計算ロジック

**🟢 低優先（UI）**:
- スタイル・レイアウト
- アニメーション

---

## 5. 実装例：TransactionForm

### 5.1 テストコード（先に書く）

```typescript
// TransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';

describe('TransactionForm', () => {
  describe('バリデーション', () => {
    it('金額が空の場合、エラーを表示', async () => {
      const mockOnSubmit = jest.fn();
      render(<TransactionForm onSubmit={mockOnSubmit} />);
      
      fireEvent.click(screen.getByText('登録'));
      
      await waitFor(() => {
        expect(screen.getByText('金額は正の数である必要があります')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    
    it('金額が負の数の場合、エラーを表示', async () => {
      const mockOnSubmit = jest.fn();
      render(<TransactionForm onSubmit={mockOnSubmit} />);
      
      const amountInput = screen.getByPlaceholderText('0');
      fireEvent.change(amountInput, { target: { value: '-1000' } });
      fireEvent.click(screen.getByText('登録'));
      
      await waitFor(() => {
        expect(screen.getByText('金額は正の数である必要があります')).toBeInTheDocument();
      });
    });
    
    it('カテゴリが未選択の場合、エラーを表示', async () => {
      const mockOnSubmit = jest.fn();
      render(<TransactionForm onSubmit={mockOnSubmit} />);
      
      fireEvent.click(screen.getByText('登録'));
      
      await waitFor(() => {
        expect(screen.getByText('カテゴリを選択してください')).toBeInTheDocument();
      });
    });
  });
  
  describe('正常系', () => {
    it('すべてのフィールドが有効な場合、onSubmit が呼ばれる', async () => {
      const mockOnSubmit = jest.fn();
      render(<TransactionForm onSubmit={mockOnSubmit} />);
      
      // フォームに入力
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1500' } });
      fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2026-05-26' } });
      
      const categorySelect = screen.getByDisplayValue('選択してください');
      fireEvent.change(categorySelect, { target: { value: 'food' } });
      
      fireEvent.click(screen.getByText('登録'));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 1500,
            date: '2026-05-26',
            category: 'food',
          })
        );
      });
    });
    
    it('編集モードの場合、既存データが入力される', () => {
      const transaction = {
        id: 'tx-001',
        date: '2026-05-20',
        category: 'food',
        amount: 2000,
        incomeExpense: 'EXPENSE',
        memo: 'スーパー',
      };
      
      render(<TransactionForm transaction={transaction} onSubmit={jest.fn()} />);
      
      expect(screen.getByDisplayValue('2026-05-20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('スーパー')).toBeInTheDocument();
    });
  });
});
```

### 5.2 実装コード（テストを通すために書く）

```typescript
// TransactionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Transaction } from '../api/transactions';

const transactionSchema = z.object({
  date: z.string().min(1, '日付を入力してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  amount: z.number().positive('金額は正の数である必要があります'),
  incomeExpense: z.enum(['INCOME', 'EXPENSE'], {
    message: '収入または支出を選択してください',
  }),
  memo: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          date: transaction.date,
          category: transaction.category,
          amount: transaction.amount,
          incomeExpense: transaction.incomeExpense,
          memo: transaction.memo || '',
        }
      : {
          date: new Date().toISOString().split('T')[0],
          category: '',
          amount: 0,
          incomeExpense: 'EXPENSE',
          memo: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          金額 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="amount"
          placeholder="0"
          {...register('amount', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          日付 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          {...register('date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">選択してください</option>
          <option value="food">食費</option>
          <option value="transport">交通費</option>
        </select>
        {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
      </div>

      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          id="memo"
          {...register('memo')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="メモを入力（任意）"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? '保存中...' : transaction ? '更新' : '登録'}
      </button>
    </form>
  );
}
```

---

## 6. 実装例：Lambda ハンドラー

### 6.1 テストコード

```typescript
// transactions.test.ts
import { getTransactions, createTransaction } from './transactions';

describe('transactions Lambda handler', () => {
  describe('createTransaction', () => {
    it('有効なデータで収支を作成できる', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          date: '2026-05-26',
          category: 'food',
          amount: 1500,
          incomeExpense: 'EXPENSE',
          memo: 'スーパー',
        }),
        requestContext: {
          authorizer: {
            claims: { sub: 'user-123' },
          },
        },
      };
      
      const result = await createTransaction(event);
      
      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.id).toBeDefined();
      expect(body.amount).toBe(1500);
      expect(body.category).toBe('food');
    });
    
    it('金額が負の数の場合、エラーを返す', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          date: '2026-05-26',
          category: 'food',
          amount: -1000,
          incomeExpense: 'EXPENSE',
        }),
        requestContext: {
          authorizer: {
            claims: { sub: 'user-123' },
          },
        },
      };
      
      const result = await createTransaction(event);
      
      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('Invalid');
    });
    
    it('必須フィールドが欠けている場合、エラーを返す', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          date: '2026-05-26',
          // category が欠けている
          amount: 1500,
          incomeExpense: 'EXPENSE',
        }),
        requestContext: {
          authorizer: {
            claims: { sub: 'user-123' },
          },
        },
      };
      
      const result = await createTransaction(event);
      
      expect(result.statusCode).toBe(400);
    });
  });
  
  describe('getTransactions', () => {
    it('ユーザーの収支一覧を取得できる', async () => {
      const event = {
        httpMethod: 'GET',
        queryStringParameters: null,
        requestContext: {
          authorizer: {
            claims: { sub: 'user-123' },
          },
        },
      };
      
      const result = await getTransactions(event);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(Array.isArray(body.items)).toBe(true);
    });
    
    it('期間でフィルタできる', async () => {
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          startDate: '2026-05-01',
          endDate: '2026-05-31',
        },
        requestContext: {
          authorizer: {
            claims: { sub: 'user-123' },
          },
        },
      };
      
      const result = await getTransactions(event);
      
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      body.items.forEach((item) => {
        expect(item.date).toBeGreaterThanOrEqual('2026-05-01');
        expect(item.date).toBeLessThanOrEqual('2026-05-31');
      });
    });
  });
});
```

---

## 7. テスト戦略の選択

### 7.1 kakeiプロジェクトに最適なテスト戦略

**推奨**: 「実装後テスト」 + 「優先度ベース」

```
理由:
1. 既にコードが実装されている
2. 1人開発なので、柔軟に対応できる
3. 優先度の高い部分から始める
```

### 7.2 実装計画

**Phase 1（今すぐ）**: 優先度の高いテスト
- [ ] LoginPage バリデーション
- [ ] SignupPage バリデーション
- [ ] Lambda ハンドラー（transactions）

**Phase 2（1週間後）**: 中優先度
- [ ] TransactionForm バリデーション
- [ ] Lambda ハンドラー（categories）

**Phase 3（2週間後）**: 低優先度
- [ ] UI テスト
- [ ] E2E テスト

### 7.3 テスト実行コマンド

```bash
# 単体テストを実行
npm run test

# 特定のファイルのテストを実行
npm run test -- TransactionForm.test.tsx

# カバレッジレポートを生成
npm run test -- --coverage

# ウォッチモード（ファイル変更時に自動実行）
npm run test:watch
```

---

## 📌 まとめ

### テスト駆動開発の流れ

```
1. テストを書く（失敗する）
2. コードを書く（テストを通す）
3. コードを改善する（テストを通し続ける）
4. 繰り返す
```

### kakeiプロジェクトの場合

- ✅ 既にコードが実装されている
- ✅ 優先度の高い部分からテストを追加
- ✅ 段階的にテストカバレッジを増やす

### 次のステップ

1. LoginPage のテストを書く
2. TransactionForm のテストを書く
3. Lambda ハンドラーのテストを書く
4. E2E テストを追加

---

**テストは品質保証の最後の砦です。焦らず、着実に進めましょう！**
