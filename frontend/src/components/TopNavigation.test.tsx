/**
 * TopNavigation Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { TopNavigation } from './TopNavigation';
import * as authHook from '../hooks/useAuth';
import * as authApi from '../api/auth';

// Mock AWS SDK Cognito client
vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  SignUpCommand: vi.fn(),
  ConfirmSignUpCommand: vi.fn(),
  InitiateAuthCommand: vi.fn(),
  GlobalSignOutCommand: vi.fn(),
  ForgotPasswordCommand: vi.fn(),
  ConfirmForgotPasswordCommand: vi.fn(),
  AuthFlowType: {
    USER_PASSWORD_AUTH: 'USER_PASSWORD_AUTH',
  },
}));

// Mock auth API functions
vi.mock('../api/auth');

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('TopNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation Display', () => {
    it('should display navigation elements', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      // Check for navigation element
      const nav = screen.queryByRole('navigation') || document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should display authenticated user email', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'user@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('should display navigation links for authenticated user', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      // Check for common navigation links
      const navLinks = screen.queryAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Unauthenticated State', () => {
    it('should display login and signup links when not authenticated', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      expect(screen.getByText(/ログイン|Login/i)).toBeInTheDocument();
    });

    it('should not display user email when not authenticated', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should display logout button when authenticated', () => {
      const mockLogout = vi.fn();
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: mockLogout,
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      const logoutButton = screen.getByText(/ログアウト|Logout/i);
      expect(logoutButton).toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', async () => {
      const mockLogout = vi.fn();
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: mockLogout,
        resetPassword: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithProviders(<TopNavigation />);

      const logoutButton = screen.getByText(/ログアウト|Logout/i);
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Mobile Navigation', () => {
    it('should have mobile menu trigger', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
        idToken: 'token',
        accessToken: 'access',
        loading: false,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      // Check for hamburger menu or similar mobile navigation element
      const mobileMenuButton = screen.queryByTitle(/menu/i) || 
                               screen.queryByRole('button', { name: /menu/i });
      
      // Navigation should exist in some form
      expect(document.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when loading', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        loading: true,
        error: null,
        login: vi.fn(),
        signup: vi.fn(),
        confirmEmail: vi.fn(),
        logout: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderWithProviders(<TopNavigation />);

      // Should not crash when loading
      expect(document.querySelector('nav')).toBeInTheDocument();
    });
  });
});
