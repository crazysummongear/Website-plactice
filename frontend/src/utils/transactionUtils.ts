/**
 * Utility functions for transaction calculations and formatting
 */

import type { Transaction, TransactionSummary } from '../types/transaction';

/**
 * Calculate summary from transactions
 * @param transactions - Array of transactions
 * @returns Summary with total income, expense, and balance
 */
export function calculateSummary(transactions: Transaction[]): TransactionSummary {
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
 * Group transactions by category
 * @param transactions - Array of transactions
 * @returns Object with category as key and total amount as value
 */
export function groupByCategory(
  transactions: Transaction[]
): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Group transactions by month
 * @param transactions - Array of transactions
 * @returns Object with month (YYYY-MM) as key and summary as value
 */
export function groupByMonth(
  transactions: Transaction[]
): Record<string, TransactionSummary> {
  const grouped = transactions.reduce((acc, transaction) => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    
    if (!acc[month]) {
      acc[month] = { totalIncome: 0, totalExpense: 0, balance: 0 };
    }
    
    if (transaction.incomeExpense === 'INCOME') {
      acc[month].totalIncome += transaction.amount;
    } else {
      acc[month].totalExpense += transaction.amount;
    }
    
    acc[month].balance = acc[month].totalIncome - acc[month].totalExpense;
    
    return acc;
  }, {} as Record<string, TransactionSummary>);
  
  return grouped;
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Format date to Japanese format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get current month date range
 * @returns Object with startDate and endDate for current month
 */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  
  return { startDate, endDate };
}
