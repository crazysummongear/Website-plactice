/**
 * Navigation Integration Tests
 * Tests complete navigation flow including TopNavigation and BottomNavigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { BottomNavigation } from './BottomNavigation';
import * as useAuthModule from '../hooks/useAuth';

// Mock useAuth hook
vi.mock('../hooks/useAuth');

// Mock pages
const MockDashboard = () => <div>Dashboard Page</div>;
const MockTransactions = () => <div>Transactions Page</div>;
const MockCsvImport = () => <div>CSV Import Page</div>;
const MockCategories = () => <div>Categories Page</div>;
const MockLogin = () => <div>Login Page</div>;

describe('Navigation Integration', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Navigation Flow', () => {
    it('should navigate between all pages using TopNavigation', async () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'test@example.com', createdAt: '2024-01-01' },
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: 'token',
        accessToken: 'token',
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
          <Routes>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/transactions" element={<MockTransactions />} />
            <Route path="/csv-import" element={<MockCsvImport />} />
            <Route path="/categories" element={<MockCategories />} />
          </Routes>
        </MemoryRouter>
      );

      // Start at dashboard
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();

      // Navigate to transactions
      fireEvent.click(screen.getByText('収支入力'));
      await waitFor(() => {
        expect(screen.getByText('Transactions Page')).toBeInTheDocument();
      });

      // Navigate to CSV import
      fireEvent.click(screen.getByText('インポート'));
      await waitFor(() => {
        expect(screen.getByText('CSV Import Page')).toBeInTheDocument();
      });

      // Navigate to categories
      fireEvent.click(screen.getByText('カテゴリ'));
      await waitFor(() => {
        expect(screen.getByText('Categories Page')).toBeInTheDocument();
      });

      // Navigate back to dashboard
      fireEvent.click(screen.getByText('ダッシュボード'));
      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });

    it('should navigate between all pages using BottomNavigation', async () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'test@example.com', createdAt: '2024-01-01' },
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: 'token',
        accessToken: 'token',
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/transactions" element={<MockTransactions />} />
            <Route path="/csv-import" element={<MockCsvImport />} />
            <Route path="/categories" element={<MockCategories />} />
          </Routes>
          <BottomNavigation />
        </MemoryRouter>
      );

      // Start at dashboard
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();

      // Navigate to transactions (一覧)
      const transactionsButton = screen.getByText('一覧').closest('button');
      fireEvent.click(transactionsButton!);
      await waitFor(() => {
        expect(screen.getByText('Transactions Page')).toBeInTheDocument();
      });

      // Navigate to CSV import
      const importButton = screen.getByText('インポート').closest('button');
      fireEvent.click(importButton!);
      await waitFor(() => {
        expect(screen.getByText('CSV Import Page')).toBeInTheDocument();
      });

      // Navigate to categories
      const categoriesButton = screen.getByText('カテゴリ').closest('button');
      fireEvent.click(categoriesButton!);
      await waitFor(() => {
        expect(screen.getByText('Categories Page')).toBeInTheDocument();
      });

      // Navigate back to dashboard
      const dashboardButton = screen.getByText('ダッシュボード').closest('button');
      fireEvent.click(dashboardButton!);
      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  describe('Active State Synchronization', () => {
    it('should highlight correct item in TopNavigation based on current route', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'test@example.com', createdAt: '2024-01-01' },
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: 'token',
        accessToken: 'token',
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      // Test dashboard active
      const { unmount } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      let dashboardLink = screen.getByText('ダッシュボード').closest('a');
      expect(dashboardLink).toHaveClass('bg-blue-50');
      expect(dashboardLink).toHaveClass('text-blue-700');

      unmount();

      // Test transactions active
      render(
        <MemoryRouter initialEntries={['/transactions']}>
          <TopNavigation />
        </MemoryRouter>
      );

      const transactionsLink = screen.getByText('収支入力').closest('a');
      expect(transactionsLink).toHaveClass('bg-blue-50');
      expect(transactionsLink).toHaveClass('text-blue-700');
    });

    it('should highlight correct item in BottomNavigation based on current route', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'test@example.com', createdAt: '2024-01-01' },
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: 'token',
        accessToken: 'token',
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      // Test dashboard active
      const { unmount } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <BottomNavigation />
        </MemoryRouter>
      );

      let dashboardButton = screen.getByText('ダッシュボード').closest('button');
      expect(dashboardButton).toHaveClass('text-blue-600');
      expect(dashboardButton).toHaveClass('bg-blue-50');

      unmount();

      // Test transactions active
      render(
        <MemoryRouter initialEntries={['/transactions']}>
          <BottomNavigation />
        </MemoryRouter>
      );

      const transactionsButton = screen.getByText('一覧').closest('button');
      expect(transactionsButton).toHaveClass('text-blue-600');
      expect(transactionsButton).toHaveClass('bg-blue-50');
    });
  });

  describe('Logout Flow', () => {
    it('should logout and redirect to login page', async () => {
      mockLogout.mockResolvedValue(undefined);

      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'test@example.com', createdAt: '2024-01-01' },
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: 'token',
        accessToken: 'token',
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
          <Routes>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/login" element={<MockLogin />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();

      // Click logout
      const logoutButton = screen.getByText('ログアウト');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });

      // Simulate auth state change
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
        loading: false,
        error: null,
        idToken: null,
        accessToken: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        resetPassword: vi.fn(),
      });

      rerender(
        <MemoryRouter initialEntries={['/login']}>
          <TopNavigation />
          <Routes>
            <Route path="/dashboard" element={<MockDashboard />} />
            <Route path="/login" element={<MockLogin />} />
          </Routes>
        </MemoryRouter>
      );

      // Should be on login page and TopNavigation should not render
      expect(screen.queryByText('家計簿アプリ')).not.toBeInTheDocument();
    });
  });
});
