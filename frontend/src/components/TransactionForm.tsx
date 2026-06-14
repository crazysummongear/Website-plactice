/**
 * Transaction Form Component
 * Form for creating and editing transactions with validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Transaction } from '../api/transactions';

/**
 * Form validation schema
 */
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

/**
 * Transaction Form Component
 */
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
    watch,
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

  const incomeExpense = watch('incomeExpense');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Income/Expense Radio Buttons */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="INCOME"
            data-testid="transaction-income-radio"
            {...register('incomeExpense')}
            className="w-4 h-4 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">収入</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="EXPENSE"
            data-testid="transaction-expense-radio"
            {...register('incomeExpense')}
            className="w-4 h-4 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-medium text-gray-700">支出</span>
        </label>
      </div>
      {errors.incomeExpense && (
        <p className="text-sm text-red-600">{errors.incomeExpense.message}</p>
      )}

      {/* Date Input */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          日付 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          data-testid="transaction-date-input"
          {...register('date')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
      </div>

      {/* Category Input */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          data-testid="transaction-category-select"
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">選択してください</option>
          {incomeExpense === 'INCOME' ? (
            <>
              <option value="給与">給与</option>
              <option value="副業">副業</option>
              <option value="投資">投資</option>
              <option value="その他収入">その他収入</option>
            </>
          ) : (
            <>
              <option value="食費">食費</option>
              <option value="交通費">交通費</option>
              <option value="住居費">住居費</option>
              <option value="光熱費">光熱費</option>
              <option value="通信費">通信費</option>
              <option value="娯楽費">娯楽費</option>
              <option value="医療費">医療費</option>
              <option value="教育費">教育費</option>
              <option value="その他支出">その他支出</option>
            </>
          )}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          金額 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            id="amount"
            data-testid="transaction-amount-input"
            step="1"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          <span className="absolute right-3 top-2 text-gray-500">円</span>
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      {/* Memo Input */}
      <div>
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          id="memo"
          data-testid="transaction-memo-input"
          rows={3}
          {...register('memo')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="メモを入力（任意）"
        />
        {errors.memo && <p className="mt-1 text-sm text-red-600">{errors.memo.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          data-testid="transaction-submit-button"
          disabled={isLoading}
          className={`flex-1 px-4 py-2 text-white rounded-md font-medium ${
            incomeExpense === 'INCOME'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            incomeExpense === 'INCOME' ? 'focus:ring-green-500' : 'focus:ring-red-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? '保存中...' : transaction ? '更新' : '登録'}
        </button>
        {onCancel && (
          <button
            type="button"
            data-testid="transaction-cancel-button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
