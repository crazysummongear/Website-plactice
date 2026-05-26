/**
 * Transaction List Page
 * Displays a list of transactions with filtering and search
 */

import { useState, useMemo } from 'react';
import {
  useTransactions,
  useDeleteTransaction,
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionForm } from '../components/TransactionForm';
import type { Transaction } from '../api/transactions';

/**
 * Transaction List Page Component
 */
export function TransactionListPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [incomeExpense, setIncomeExpense] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch transactions with filters
  const { data, isLoading, error } = useTransactions({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    category: category || undefined,
    incomeExpense: incomeExpense || undefined,
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Filter transactions by search query (client-side)
  const filteredTransactions = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery) return data.items;

    const query = searchQuery.toLowerCase();
    return data.items.filter(
      (t) =>
        t.category.toLowerCase().includes(query) ||
        t.memo?.toLowerCase().includes(query) ||
        t.amount.toString().includes(query)
    );
  }, [data?.items, searchQuery]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction.id,
          updates: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('保存に失敗しました');
    }
  };

  // Handle edit
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('削除に失敗しました');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  // Clear filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCategory('');
    setIncomeExpense('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">収支一覧</h1>
          <p className="mt-2 text-sm text-gray-600">
            収支の履歴を確認・編集できます
          </p>
        </div>

        {/* Add Transaction Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + 収支を追加
            </button>
          </div>
        )}

        {/* Transaction Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTransaction ? '収支を編集' : '収支を追加'}
            </h2>
            <TransactionForm
              transaction={editingTransaction || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">フィルター</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="食費">食費</option>
                <option value="交通費">交通費</option>
                <option value="住居費">住居費</option>
                <option value="光熱費">光熱費</option>
                <option value="通信費">通信費</option>
                <option value="娯楽費">娯楽費</option>
                <option value="医療費">医療費</option>
                <option value="教育費">教育費</option>
                <option value="給与">給与</option>
                <option value="副業">副業</option>
                <option value="投資">投資</option>
              </select>
            </div>

            {/* Income/Expense */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種別
              </label>
              <select
                value={incomeExpense}
                onChange={(e) => setIncomeExpense(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                <option value="INCOME">収入</option>
                <option value="EXPENSE">支出</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="カテゴリ、メモ、金額で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              フィルターをクリア
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div>
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              エラーが発生しました: {error.message}
            </div>
          )}

          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600">収支データがありません</p>
            </div>
          )}

          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
