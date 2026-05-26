/**
 * Transaction types for frontend
 */

export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateTransactionRequest {
  date: string;
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
}

export interface UpdateTransactionRequest {
  category?: string;
  amount?: number;
  incomeExpense?: 'INCOME' | 'EXPENSE';
  memo?: string;
}

export interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  incomeExpense?: 'INCOME' | 'EXPENSE';
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  summary?: TransactionSummary;
}
