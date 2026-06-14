/**
 * TransactionCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionCard } from './TransactionCard';
import type { Transaction } from '../api/transactions';

const mockTransaction: Transaction = {
  id: 'tx-1',
  userId: 'user-123',
  date: '2024-01-15',
  category: '食費',
  amount: 5000,
  incomeExpense: 'EXPENSE',
  memo: 'スーパーで買い物',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockIncomeTransaction: Transaction = {
  ...mockTransaction,
  id: 'tx-2',
  date: '2024-01-01',
  category: '給料',
  amount: 300000,
  incomeExpense: 'INCOME',
  memo: '1月給料',
};

describe('TransactionCard', () => {
  describe('Display', () => {
    it('should display transaction information', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      expect(screen.getByText(/食費/)).toBeInTheDocument();
      expect(screen.getByText(/5000/)).toBeInTheDocument();
      expect(screen.getByText(/スーパーで買い物/)).toBeInTheDocument();
    });

    it('should format date correctly', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      // Should display date in Japanese format (2024年1月15日)
      expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
    });

    it('should format amount with thousand separators', () => {
      render(<TransactionCard transaction={mockIncomeTransaction} />);

      expect(screen.getByText(/300,000/)).toBeInTheDocument();
    });

    it('should display amount with + prefix for income', () => {
      render(<TransactionCard transaction={mockIncomeTransaction} />);

      const amountElement = screen.getByText(/\+¥300,000/);
      expect(amountElement).toBeInTheDocument();
      expect(amountElement).toHaveClass('text-green-600');
    });

    it('should display amount with - prefix for expense', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      const amountElement = screen.getByText(/\-¥5,000/);
      expect(amountElement).toBeInTheDocument();
      expect(amountElement).toHaveClass('text-red-600');
    });

    it('should display category badge with correct color for expense', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      const badge = screen.getByText('食費');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });

    it('should display category badge with correct color for income', () => {
      render(<TransactionCard transaction={mockIncomeTransaction} />);

      const badge = screen.getByText('給料');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });

    it('should display income/expense label', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      expect(screen.getByText('支出')).toBeInTheDocument();
    });

    it('should display income label for income transaction', () => {
      render(<TransactionCard transaction={mockIncomeTransaction} />);

      expect(screen.getByText('収入')).toBeInTheDocument();
    });

    it('should hide memo when not provided', () => {
      const transactionWithoutMemo = { ...mockTransaction, memo: '' };
      render(<TransactionCard transaction={transactionWithoutMemo} />);

      expect(screen.queryByText(/スーパーで買い物/)).not.toBeInTheDocument();
    });

    it('should display timestamps', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      expect(screen.getByText(/作成:/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionCard transaction={mockTransaction} onEdit={onEdit} />);

      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockTransaction);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(<TransactionCard transaction={mockTransaction} onDelete={onDelete} />);

      const deleteButton = screen.getByTitle('削除');
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('tx-1');
    });

    it('should hide edit button when onEdit is not provided', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      expect(screen.queryByTitle('編集')).not.toBeInTheDocument();
    });

    it('should hide delete button when onDelete is not provided', () => {
      render(<TransactionCard transaction={mockTransaction} />);

      expect(screen.queryByTitle('削除')).not.toBeInTheDocument();
    });

    it('should disable buttons when isDeleting is true', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TransactionCard
          transaction={mockTransaction}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={true}
        />
      );

      const editButton = screen.getByTitle('編集') as HTMLButtonElement;
      const deleteButton = screen.getByTitle('削除') as HTMLButtonElement;

      expect(editButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    it('should show loading spinner when deleting', () => {
      render(
        <TransactionCard
          transaction={mockTransaction}
          onDelete={() => {}}
          isDeleting={true}
        />
      );

      // Should have a spinner (animated SVG)
      const spinner = screen.getByTitle('削除').querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const largeTransaction = { ...mockTransaction, amount: 999999999 };
      render(<TransactionCard transaction={largeTransaction} />);

      expect(screen.getByText(/999,999,999/)).toBeInTheDocument();
    });

    it('should handle small amounts', () => {
      const smallTransaction = { ...mockTransaction, amount: 1 };
      render(<TransactionCard transaction={smallTransaction} />);

      expect(screen.getByText(/¥1/)).toBeInTheDocument();
    });

    it('should handle long memo text', () => {
      const longMemo =
        'これは非常に長いメモです。複数行の内容が含まれる可能性があります。このような長いメモでも正しく表示される必要があります。';
      const transactionWithLongMemo = { ...mockTransaction, memo: longMemo };

      render(<TransactionCard transaction={transactionWithLongMemo} />);

      expect(screen.getByText(longMemo)).toBeInTheDocument();
    });

    it('should handle special characters in category name', () => {
      const specialCategory = { ...mockTransaction, category: '医療・健康' };
      render(<TransactionCard transaction={specialCategory} />);

      expect(screen.getByText('医療・健康')).toBeInTheDocument();
    });
  });
});
