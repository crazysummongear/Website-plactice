/**
 * Transaction hooks using React Query
 * Provides data fetching, caching, and mutation logic for transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  type CreateTransactionRequest,
  type UpdateTransactionRequest,
  type TransactionQueryParams,
} from '../api/transactions';

/**
 * Query key factory for transactions
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionQueryParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

/**
 * Hook to fetch transactions with optional filters
 * @param params - Query parameters for filtering
 * @returns Query result with transactions data
 */
export function useTransactions(params: TransactionQueryParams = {}) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => getTransactions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook to create a new transaction
 * @returns Mutation object with create function
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: CreateTransactionRequest) =>
      createTransaction(transaction),
    onSuccess: () => {
      // Invalidate all transaction lists to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing transaction
 * @returns Mutation object with update function
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTransactionRequest }) =>
      updateTransaction(id, updates),
    onSuccess: (updatedTransaction) => {
      // Invalidate all transaction lists to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Update the specific transaction in cache if it exists
      queryClient.setQueryData(
        transactionKeys.detail(updatedTransaction.id),
        updatedTransaction
      );
    },
  });
}

/**
 * Hook to delete a transaction
 * @returns Mutation object with delete function
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (_, deletedId) => {
      // Invalidate all transaction lists to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Remove the specific transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(deletedId) });
    },
  });
}

/**
 * Hook to calculate transaction summary
 * @param transactions - List of transactions
 * @returns Summary with total income, expense, and balance
 */
export function useTransactionSummary(transactions: Transaction[] | undefined) {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };
  }

  const totalIncome = transactions
    .filter((t) => t.incomeExpense === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.incomeExpense === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

/**
 * Hook to group transactions by category
 * @param transactions - List of transactions
 * @returns Transactions grouped by category with totals
 */
export function useTransactionsByCategory(transactions: Transaction[] | undefined) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const categoryMap = new Map<string, { category: string; total: number; count: number }>();

  transactions.forEach((transaction) => {
    const existing = categoryMap.get(transaction.category);
    if (existing) {
      existing.total += transaction.amount;
      existing.count += 1;
    } else {
      categoryMap.set(transaction.category, {
        category: transaction.category,
        total: transaction.amount,
        count: 1,
      });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
}

/**
 * Hook to group transactions by month
 * @param transactions - List of transactions
 * @returns Transactions grouped by month with income/expense totals
 */
export function useTransactionsByMonth(transactions: Transaction[] | undefined) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const monthMap = new Map<
    string,
    { month: string; income: number; expense: number; balance: number }
  >();

  transactions.forEach((transaction) => {
    // Extract YYYY-MM from date
    const month = transaction.date.substring(0, 7);
    const existing = monthMap.get(month);

    if (existing) {
      if (transaction.incomeExpense === 'INCOME') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
      existing.balance = existing.income - existing.expense;
    } else {
      monthMap.set(month, {
        month,
        income: transaction.incomeExpense === 'INCOME' ? transaction.amount : 0,
        expense: transaction.incomeExpense === 'EXPENSE' ? transaction.amount : 0,
        balance:
          transaction.incomeExpense === 'INCOME'
            ? transaction.amount
            : -transaction.amount,
      });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}
