/**
 * Top Navigation Component (Desktop only)
 * Displays horizontal navigation menu for desktop screens
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function TopNavigation() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  // Don't show navigation on login/signup pages
  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { path: '/transactions', label: '収支入力', icon: '📝' },
    { path: '/csv-import', label: 'インポート', icon: '📤' },
    { path: '/categories', label: 'カテゴリ', icon: '🏷️' },
  ];

  return (
    <nav className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900">家計簿アプリ</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
