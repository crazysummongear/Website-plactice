/**
 * TopNavigation Component Unit Tests
 * Tests navigation rendering, active states, and logout functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import * as useAuthModule from '../hooks/useAuth';

// Mock useAuth hook
vi.mock('../hooks/useAuth');

describe('TopNavigation', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when user is not authenticated', () => {
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

      const { container } = render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render on login page', () => {
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

      const { container } = render(
        <MemoryRouter initialEntries={['/login']}>
          <TopNavigation />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render on signup page', () => {
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

      const { container } = render(
        <MemoryRouter initialEntries={['/signup']}>
          <TopNavigation />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when authenticated on protected pages', () => {
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
        </MemoryRouter>
      );

      expect(screen.getByText('家計簿アプリ')).toBeInTheDocument();
    });
  });

  describe('Navigation Items', () => {
    beforeEach(() => {
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
    });

    it('should render all navigation items', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('収支入力')).toBeInTheDocument();
      expect(screen.getByText('インポート')).toBeInTheDocument();
      expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    });

    it('should highlight active page', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      const dashboardLink = screen.getByText('ダッシュボード').closest('a');
      expect(dashboardLink).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('should not highlight inactive pages', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      const transactionsLink = screen.getByText('収支入力').closest('a');
      expect(transactionsLink).not.toHaveClass('bg-blue-50');
      expect(transactionsLink).toHaveClass('text-gray-700');
    });
  });

  describe('User Information', () => {
    it('should display user email', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { userId: '1', email: 'user@example.com', createdAt: '2024-01-01' },
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
        </MemoryRouter>
      );

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should render logout button', () => {
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
        </MemoryRouter>
      );

      expect(screen.getByText('ログアウト')).toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', async () => {
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

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <TopNavigation />
        </MemoryRouter>
      );

      const logoutButton = screen.getByText('ログアウト');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Logo Link', () => {
    it('should link to dashboard', () => {
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
        <MemoryRouter initialEntries={['/transactions']}>
          <TopNavigation />
        </MemoryRouter>
      );

      const logoLink = screen.getByText('家計簿アプリ').closest('a');
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });
  });
});
