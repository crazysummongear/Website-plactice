/**
 * Bottom Navigation Component
 * Mobile-friendly navigation bar
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { path: '/transactions', label: '一覧', icon: '📝' },
  { path: '/csv-import', label: 'インポート', icon: '📤' },
  { path: '/categories', label: 'カテゴリ', icon: '🏷️' },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const handleClick = (path: string) => {
    console.log('Navigation button clicked:', path);
    navigate(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      style={{ zIndex: 9999 }}
    >
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full border-none bg-transparent cursor-pointer ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
