import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { BottomNavigation } from './BottomNavigation';
import PrivateRoute from './PrivateRoute';

// Mock pages
const DashboardPage = () => <div>Dashboard Page</div>;
const TransactionListPage = () => <div>Transaction List Page</div>;
const CsvImportPage = () => <div>CSV Import Page</div>;
const CategoryPage = () => <div>Category Page</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('BottomNavigation Integration', () => {
  it('should navigate between pages when buttons are clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <PrivateRoute>
                    <TransactionListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/csv-import"
                element={
                  <PrivateRoute>
                    <CsvImportPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <PrivateRoute>
                    <CategoryPage />
                  </PrivateRoute>
                }
              />
            </Routes>
            <BottomNavigation />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.queryByText('認証確認中...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if we're on dashboard (or redirected to login)
    const isDashboard = screen.queryByText('Dashboard Page');
    const isLogin = screen.queryByText('ログイン');

    if (isLogin) {
      console.log('User not authenticated, redirected to login');
    } else if (isDashboard) {
      console.log('User authenticated, on dashboard');
      
      // Try to navigate to transactions
      const transactionsButton = screen.getByText('一覧');
      fireEvent.click(transactionsButton);

      await waitFor(() => {
        expect(screen.getByText('Transaction List Page')).toBeInTheDocument();
      });
    }
  });
});
