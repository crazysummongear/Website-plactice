/**
 * TransactionForm Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../api/transactions';

const mockTransaction: Transaction = {
  id: 'tx-1',
  userId: 'user-123',
  date: '2024-01-15',
  category: '食費',
  amount: 5000,
  incomeExpense: 'EXPENSE',
  memo: 'スーパー',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('TransactionForm', () => {
  describe('Rendering', () => {
    it('should render form fields for new transaction', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/日付/)).toBeInTheDocument();
      expect(screen.getByLabelText(/カテゴリ/)).toBeInTheDocument();
      expect(screen.getByLabelText(/金額/)).toBeInTheDocument();
      expect(screen.getByLabelText(/メモ/)).toBeInTheDocument();
    });

    it('should render income/expense toggle buttons', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/収入/)).toBeInTheDocument();
      expect(screen.getByLabelText(/支出/)).toBeInTheDocument();
    });

    it('should set default income/expense to EXPENSE', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm onSubmit={onSubmit} />);

      const expenseRadio = screen.getByLabelText(/支出/) as HTMLInputElement;
      expect(expenseRadio.checked).toBe(true);
    });

    it('should render submit and cancel buttons', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm onSubmit={onSubmit} />);

      expect(screen.getByText(/登録/i)).toBeInTheDocument();
      expect(screen.getByText(/キャンセル/i)).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should populate form with existing transaction data', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm transaction={mockTransaction} onSubmit={onSubmit} />);

      const dateInput = screen.getByDisplayValue('2024-01-15') as HTMLInputElement;
      expect(dateInput.value).toBe('2024-01-15');

      const categoryInput = screen.getByDisplayValue('食費') as HTMLInputElement;
      expect(categoryInput.value).toBe('食費');

      const amountInput = screen.getByDisplayValue('5000') as HTMLInputElement;
      expect(amountInput.value).toBe('5000');

      const memoInput = screen.getByDisplayValue('スーパー') as HTMLInputElement;
      expect(memoInput.value).toBe('スーパー');
    });

    it('should select correct income/expense radio for existing transaction', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm transaction={mockTransaction} onSubmit={onSubmit} />);

      const expenseRadio = screen.getByLabelText(/支出/) as HTMLInputElement;
      expect(expenseRadio.checked).toBe(true);
    });

    it('should select INCOME for income transaction', () => {
      const incomeTransaction = { ...mockTransaction, incomeExpense: 'INCOME' };
      const onSubmit = vi.fn();
      render(<TransactionForm transaction={incomeTransaction} onSubmit={onSubmit} />);

      const incomeRadio = screen.getByLabelText(/収入/) as HTMLInputElement;
      expect(incomeRadio.checked).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const dateInput = screen.getByLabelText(/日付/) as HTMLInputElement;
      const categoryInput = screen.getByLabelText(/カテゴリ/) as HTMLInputElement;
      const amountInput = screen.getByLabelText(/金額/) as HTMLInputElement;

      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-01');

      await user.clear(categoryInput);
      await user.type(categoryInput, '食費');

      await user.clear(amountInput);
      await user.type(amountInput, '3000');

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-02-01',
            category: '食費',
            amount: 3000,
            incomeExpense: 'EXPENSE',
          })
        );
      });
    });

    it('should not submit with invalid data', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const amountInput = screen.getByLabelText(/金額/) as HTMLInputElement;
      await user.clear(amountInput);
      await user.type(amountInput, '-1000'); // Negative amount

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/正の数である必要があります/)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for missing date', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const dateInput = screen.getByLabelText(/日付/);
      await user.clear(dateInput);

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/日付を入力してください/)).toBeInTheDocument();
      });
    });

    it('should show validation error for missing category', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const categoryInput = screen.getByLabelText(/カテゴリ/);
      await user.clear(categoryInput);

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/カテゴリを選択してください/)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} onCancel={onCancel} />);

      const cancelButton = screen.getByText(/キャンセル/i);
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should not call onSubmit when cancel is clicked', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} onCancel={onCancel} />);

      const cancelButton = screen.getByText(/キャンセル/i);
      await user.click(cancelButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when isLoading is true', () => {
      const onSubmit = vi.fn();
      const { rerender } = render(<TransactionForm onSubmit={onSubmit} />);

      const submitButton = screen.getByText(/登録/i) as HTMLButtonElement;
      expect(submitButton).not.toBeDisabled();

      rerender(<TransactionForm onSubmit={onSubmit} isLoading={true} />);

      const updatedSubmitButton = screen.getByText(/登録/i) as HTMLButtonElement;
      expect(updatedSubmitButton).toBeDisabled();
    });

    it('should show loading indicator when isLoading is true', () => {
      const onSubmit = vi.fn();
      render(<TransactionForm onSubmit={onSubmit} isLoading={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Income/Expense Toggle', () => {
    it('should switch between income and expense', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const incomeRadio = screen.getByLabelText(/収入/);
      await user.click(incomeRadio);

      const incomeRadioChecked = screen.getByLabelText(/収入/) as HTMLInputElement;
      expect(incomeRadioChecked.checked).toBe(true);

      const expenseRadio = screen.getByLabelText(/支出/);
      await user.click(expenseRadio);

      const expenseRadioChecked = screen.getByLabelText(/支出/) as HTMLInputElement;
      expect(expenseRadioChecked.checked).toBe(true);
    });
  });

  describe('Optional Fields', () => {
    it('should allow submission without memo', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const dateInput = screen.getByLabelText(/日付/);
      const categoryInput = screen.getByLabelText(/カテゴリ/);
      const amountInput = screen.getByLabelText(/金額/);

      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-01');

      await user.clear(categoryInput);
      await user.type(categoryInput, '食費');

      await user.clear(amountInput);
      await user.type(amountInput, '3000');

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const amountInput = screen.getByLabelText(/金額/);
      await user.clear(amountInput);
      await user.type(amountInput, '999999999');

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 999999999,
          })
        );
      });
    });

    it('should handle decimal amounts', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(<TransactionForm onSubmit={onSubmit} />);

      const amountInput = screen.getByLabelText(/金額/);
      await user.clear(amountInput);
      await user.type(amountInput, '1234.56');

      const submitButton = screen.getByText(/登録/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 1234.56,
          })
        );
      });
    });
  });
});
