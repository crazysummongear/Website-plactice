/**
 * Dashboard Page Component
 * Displays financial overview with summary cards and charts
 */

import { useAuthContext } from '../context/AuthContext';
import {
  useTransactions,
  useTransactionSummary,
  useTransactionsByCategory,
} from '../hooks/useTransactions';

export function DashboardPage() {
  const { user } = useAuthContext();
  
  // Get current month's date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  // Fetch current month's transactions
  const { data, isLoading, error } = useTransactions({
    startDate: startOfMonth,
    endDate: endOfMonth,
  });

  // Calculate summary
  const summary = useTransactionSummary(data?.items);
  const byCategory = useTransactionsByCategory(data?.items);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">エラー</h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 data-testid="dashboard-title" className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p data-testid="user-greeting" className="mt-2 text-sm text-gray-600">
            {user?.email} さん、こんにちは
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <div data-testid="income-card" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の収入</p>
                <p data-testid="income-amount" className="mt-2 text-3xl font-bold text-green-600">
                  ¥{summary.totalIncome.toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div data-testid="expense-card" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の支出</p>
                <p data-testid="expense-amount" className="mt-2 text-3xl font-bold text-red-600">
                  ¥{summary.totalExpense.toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div data-testid="balance-card" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今月の収支</p>
                <p
                  data-testid="balance-amount"
                  className={`mt-2 text-3xl font-bold ${
                    summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}
                >
                  {summary.balance >= 0 ? '+' : ''}¥
                  {summary.balance.toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {byCategory.length > 0 && (
          <div data-testid="category-breakdown" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">カテゴリ別支出</h2>
            <div className="space-y-3">
              {byCategory.slice(0, 5).map((item) => (
                <div key={item.category} data-testid={`category-item-${item.category}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ¥{item.total.toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.total / summary.totalExpense) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {data?.items && data.items.length > 0 && (
          <div data-testid="recent-transactions" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">最近の取引</h2>
            <div className="space-y-3">
              {data.items.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  data-testid={`transaction-item-${transaction.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.category}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      transaction.incomeExpense === 'INCOME'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.incomeExpense === 'INCOME' ? '+' : '-'}¥
                    {transaction.amount.toLocaleString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!data?.items || data.items.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              データがありません
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              収支を追加して、家計管理を始めましょう
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
