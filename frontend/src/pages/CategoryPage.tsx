/**
 * Category Management Page
 * Allows users to view and manage transaction categories
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '給料', type: 'income', color: '#10b981' },
  { id: '2', name: '副業', type: 'income', color: '#3b82f6' },
  { id: '3', name: '食費', type: 'expense', color: '#ef4444' },
  { id: '4', name: '交通費', type: 'expense', color: '#f59e0b' },
  { id: '5', name: '娯楽', type: 'expense', color: '#8b5cf6' },
  { id: '6', name: '光熱費', type: 'expense', color: '#ec4899' },
];

export const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryType === 'income' ? '#10b981' : '#ef4444',
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowAddForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('このカテゴリを削除してもよろしいですか？')) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← 戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">カテゴリ管理</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + 追加
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Category Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              新しいカテゴリを追加
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ名
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 食費"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  種別
                </label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income Categories */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              収入カテゴリ ({incomeCategories.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                収入カテゴリがありません
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              支出カテゴリ ({expenseCategories.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                支出カテゴリがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
