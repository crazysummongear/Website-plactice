import type { ReactNode } from 'react';

interface DashboardProps {
  userId: string;
  idToken: string;
  onLogout: () => void;
}

export default function Dashboard({ userId, onLogout }: DashboardProps) {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">KakeiApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">ユーザーID: {userId}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <nav className="flex gap-8 mb-8 border-b border-gray-200">
            <button className="pb-4 px-2 text-blue-600 font-medium border-b-2 border-blue-600">
              ダッシュボード
            </button>
            <button className="pb-4 px-2 text-gray-600 font-medium hover:text-gray-900">
              収支入力
            </button>
            <button className="pb-4 px-2 text-gray-600 font-medium hover:text-gray-900">
              履歴
            </button>
            <button className="pb-4 px-2 text-gray-600 font-medium hover:text-gray-900">
              インポート
            </button>
          </nav>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Summary Cards */}
            <SummaryCard
              title="今月の支出"
              amount="¥0"
              color="text-red-600"
            />
            <SummaryCard
              title="今月の収入"
              amount="¥0"
              color="text-green-600"
            />
            <SummaryCard
              title="残高"
              amount="¥0"
              color="text-blue-600"
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              最近の取引
            </h2>
            <div className="text-center py-12 text-gray-500">
              取引データはまだありません
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2026 KakeiApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  amount: string;
  color: string;
}

function SummaryCard({ title, amount, color }: SummaryCardProps): ReactNode {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{amount}</p>
    </div>
  );
}