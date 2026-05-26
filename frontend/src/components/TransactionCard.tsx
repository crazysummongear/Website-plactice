/**
 * Transaction Card Component
 * Displays a single transaction with edit and delete actions
 */

import type { Transaction } from '../api/transactions';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Format date to Japanese format (YYYY年MM月DD日)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * Format amount with thousand separators
 */
function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP');
}

/**
 * Transaction Card Component
 */
export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  isDeleting = false,
}: TransactionCardProps) {
  const isIncome = transaction.incomeExpense === 'INCOME';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Transaction Info */}
        <div className="flex-1">
          {/* Date */}
          <div className="text-sm text-gray-500 mb-1">{formatDate(transaction.date)}</div>

          {/* Category */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isIncome
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {transaction.category}
            </span>
            <span className="text-xs text-gray-500">
              {isIncome ? '収入' : '支出'}
            </span>
          </div>

          {/* Amount */}
          <div
            className={`text-2xl font-bold mb-2 ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}¥{formatAmount(transaction.amount)}
          </div>

          {/* Memo */}
          {transaction.memo && (
            <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {transaction.memo}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              disabled={isDeleting}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="編集"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="削除"
            >
              {isDeleting ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <div>作成: {new Date(transaction.createdAt).toLocaleString('ja-JP')}</div>
        {transaction.updatedAt !== transaction.createdAt && (
          <div>更新: {new Date(transaction.updatedAt).toLocaleString('ja-JP')}</div>
        )}
      </div>
    </div>
  );
}
