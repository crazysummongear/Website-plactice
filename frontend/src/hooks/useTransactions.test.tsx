/**
 * useTransactions Hooks Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useTransactionSummary,
  useTransactionsByCategory,
  useTransactionsByMonth,
} from './useTransactions';
import * as transactionApi from '../api/transactions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import type { Transaction, CreateTransactionRequest } from '../api/transactions';

// Mock the transaction API
vi.mock('../api/transactions');

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-123',
    date: '2024-01-01',
    category: '給料',
    amount: 300000,
    incomeExpense: 'INCOME',
    memo: '1月給料',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'user-123',
    date: '2024-01-15',
    category: '食費',
    amount: 5000,
    incomeExpense: 'EXPENSE',
    memo: 'スーパー',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'tx-3',
    userId: 'user-123',
    date: '2024-01-20',
    category: '交通費',
    amount: 3000,
    incomeExpense: 'EXPENSE',
    memo: '電車代',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'tx-4',
    userId: 'user-123',
    date: '2024-02-01',
    category: '食費',
    amount: 4500,
    incomeExpense: 'EXPENSE',
    memo: '食材',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

describe('useTransactions Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTransactions', () => {
    it('should fetch transactions successfully', async () => {
      vi.mocked(transactionApi.getTransactions).mockResolvedValue({
        items: mockTransactions,
      });

      const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(4);
      expect(result.current.data?.items?.[0].category).toBe('給料');
    });

    it('should apply filter parameters', async () => {
      vi.mocked(transactionApi.getTransactions).mockResolvedValue({
        items: mockTransactions.slice(0, 1),
      });

      const { result } = renderHook(() => useTransactions({ incomeExpense: 'INCOME' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledWith({
        incomeExpense: 'INCOME',
      });
    });

    it('should handle error gracefully', async () => {
      vi.mocked(transactionApi.getTransactions).mockRejectedValue(new Error('Fetch error'));

      const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCreateTransaction', () => {
    it('should create a transaction successfully', async () => {
      const newTransaction: CreateTransactionRequest = {
        date: '2024-01-25',
        category: '娯楽',
        amount: 8000,
        incomeExpense: 'EXPENSE',
        memo: '映画',
      };

      const createdTransaction: Transaction = {
        id: 'new-tx',
        userId: 'user-123',
        ...newTransaction,
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: '2024-01-25T00:00:00Z',
      };

      vi.mocked(transactionApi.createTransaction).mockResolvedValue(createdTransaction);

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        result.current.mutate(newTransaction);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(createdTransaction);
    });

    it('should handle creation error', async () => {
      const newTransaction: CreateTransactionRequest = {
        date: '2024-01-25',
        category: '娯楽',
        amount: 8000,
        incomeExpense: 'EXPENSE',
      };

      vi.mocked(transactionApi.createTransaction).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        result.current.mutate(newTransaction);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateTransaction', () => {
    it('should update a transaction successfully', async () => {
      const updates = {
        category: '食費',
        amount: 6000,
      };

      const updatedTransaction: Transaction = {
        ...mockTransactions[0],
        ...updates,
      };

      vi.mocked(transactionApi.updateTransaction).mockResolvedValue(updatedTransaction);

      const { result } = renderHook(() => useUpdateTransaction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        result.current.mutate({ id: 'tx-1', updates });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedTransaction);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache after creating transaction', async () => {
      vi.mocked(transactionApi.getTransactions).mockResolvedValue({
        items: mockTransactions,
      });

      const newTransaction: CreateTransactionRequest = {
        date: '2024-01-25',
        category: '娯楽',
        amount: 8000,
        incomeExpense: 'EXPENSE',
        memo: '映画',
      };

      const createdTransaction: Transaction = {
        id: 'new-tx',
        userId: 'user-123',
        ...newTransaction,
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: '2024-01-25T00:00:00Z',
      };

      vi.mocked(transactionApi.createTransaction).mockResolvedValue(createdTransaction);

      const { result: listResult } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(listResult.current.isSuccess).toBe(true);
      });

      const { result: createResult } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        createResult.current.mutate(newTransaction);
      });

      // Should refetch after creation
      await waitFor(() => {
        expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledTimes(2);
      });
    });

    it('should invalidate cache after updating transaction', async () => {
      vi.mocked(transactionApi.getTransactions).mockResolvedValue({
        items: mockTransactions,
      });

      const updates = { amount: 6000 };

      const updatedTransaction: Transaction = {
        ...mockTransactions[0],
        ...updates,
      };

      vi.mocked(transactionApi.updateTransaction).mockResolvedValue(updatedTransaction);

      const { result: listResult } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(listResult.current.isSuccess).toBe(true);
      });

      const { result: updateResult } = renderHook(() => useUpdateTransaction(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        updateResult.current.mutate({ id: 'tx-1', updates });
      });

      // Should refetch after update
      await waitFor(() => {
        expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledTimes(2);
      });
    });

    it('should invalidate cache after deleting transaction', async () => {
      vi.mocked(transactionApi.getTransactions).mockResolvedValue({
        items: mockTransactions,
      });

      vi.mocked(transactionApi.deleteTransaction).mockResolvedValue(undefined);

      const { result: listResult } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(listResult.current.isSuccess).toBe(true);
      });

      const { result: deleteResult } = renderHook(() => useDeleteTransaction(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        deleteResult.current.mutate('tx-1');
      });

      // Should refetch after deletion
      await waitFor(() => {
        expect(vi.mocked(transactionApi.getTransactions)).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from fetch error and allow retry', async () => {
      vi.mocked(transactionApi.getTransactions)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ items: mockTransactions });

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Retry
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(4);
    });

    it('should handle error during mutation and allow retry', async () => {
      vi.mocked(transactionApi.createTransaction)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({
          id: 'new-tx',
          userId: 'user-123',
          date: '2024-01-25',
          category: '娯楽',
          amount: 8000,
          incomeExpense: 'EXPENSE',
          memo: '映画',
          createdAt: '2024-01-25T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z',
        });

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      const newTransaction: CreateTransactionRequest = {
        date: '2024-01-25',
        category: '娯楽',
        amount: 8000,
        incomeExpense: 'EXPENSE',
        memo: '映画',
      };

      await act(async () => {
        result.current.mutate(newTransaction);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Retry
      await act(async () => {
        result.current.mutate(newTransaction);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should persist error state for display', async () => {
      const errorMessage = 'Failed to fetch transactions';
      vi.mocked(transactionApi.getTransactions).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  describe('useTransactionSummary', () => {
    it('should calculate summary correctly', () => {
      const { result } = renderHook(() => useTransactionSummary(mockTransactions));

      expect(result.current.totalIncome).toBe(300000);
      expect(result.current.totalExpense).toBe(12500);
      expect(result.current.balance).toBe(287500);
    });

    it('should return zeros for empty transactions', () => {
      const { result } = renderHook(() => useTransactionSummary([]));

      expect(result.current.totalIncome).toBe(0);
      expect(result.current.totalExpense).toBe(0);
      expect(result.current.balance).toBe(0);
    });

    it('should handle undefined transactions', () => {
      const { result } = renderHook(() => useTransactionSummary(undefined));

      expect(result.current.totalIncome).toBe(0);
      expect(result.current.totalExpense).toBe(0);
      expect(result.current.balance).toBe(0);
    });

    it('should handle only income transactions', () => {
      const incomeOnly = mockTransactions.filter((t) => t.incomeExpense === 'INCOME');
      const { result } = renderHook(() => useTransactionSummary(incomeOnly));

      expect(result.current.totalIncome).toBe(300000);
      expect(result.current.totalExpense).toBe(0);
      expect(result.current.balance).toBe(300000);
    });
  });

  describe('useTransactionsByCategory', () => {
    it('should group transactions by category', () => {
      const { result } = renderHook(() => useTransactionsByCategory(mockTransactions));

      expect(result.current).toHaveLength(3); // 給料, 食費, 交通費
      expect(result.current[0].category).toBe('食費'); // Highest total
      expect(result.current[0].total).toBe(9500); // 5000 + 4500
      expect(result.current[0].count).toBe(2);
    });

    it('should sort by total amount descending', () => {
      const { result } = renderHook(() => useTransactionsByCategory(mockTransactions));

      // Should be sorted by total descending
      for (let i = 0; i < result.current.length - 1; i++) {
        expect(result.current[i].total).toBeGreaterThanOrEqual(result.current[i + 1].total);
      }
    });

    it('should handle empty transactions', () => {
      const { result } = renderHook(() => useTransactionsByCategory([]));

      expect(result.current).toEqual([]);
    });

    it('should handle undefined transactions', () => {
      const { result } = renderHook(() => useTransactionsByCategory(undefined));

      expect(result.current).toEqual([]);
    });
  });

  describe('useTransactionsByMonth', () => {
    it('should group transactions by month', () => {
      const { result } = renderHook(() => useTransactionsByMonth(mockTransactions));

      expect(result.current).toHaveLength(2); // 2024-01, 2024-02
      expect(result.current[0].month).toBe('2024-01');
      expect(result.current[1].month).toBe('2024-02');
    });

    it('should calculate income and expense per month', () => {
      const { result } = renderHook(() => useTransactionsByMonth(mockTransactions));

      // January: 300000 income, 8000 expense
      expect(result.current[0].income).toBe(300000);
      expect(result.current[0].expense).toBe(8000);
      expect(result.current[0].balance).toBe(292000);

      // February: 0 income, 4500 expense
      expect(result.current[1].income).toBe(0);
      expect(result.current[1].expense).toBe(4500);
      expect(result.current[1].balance).toBe(-4500);
    });

    it('should sort months chronologically', () => {
      const unsortedTransactions: Transaction[] = [
        { ...mockTransactions[3], date: '2024-03-01' },
        { ...mockTransactions[0], date: '2024-01-01' },
        { ...mockTransactions[1], date: '2024-02-01' },
      ];

      const { result } = renderHook(() => useTransactionsByMonth(unsortedTransactions));

      expect(result.current[0].month).toBe('2024-01');
      expect(result.current[1].month).toBe('2024-02');
      expect(result.current[2].month).toBe('2024-03');
    });

    it('should handle empty transactions', () => {
      const { result } = renderHook(() => useTransactionsByMonth([]));

      expect(result.current).toEqual([]);
    });

    it('should handle undefined transactions', () => {
      const { result } = renderHook(() => useTransactionsByMonth(undefined));

      expect(result.current).toEqual([]);
    });
  });
});
