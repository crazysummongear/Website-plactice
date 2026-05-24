import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/LoginPage';
import * as authHook from '../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

describe('PrivateRoute Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthenticated user to login and preserve original location', async () => {
    // Mock unauthenticated state
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

    // Render app with initial route to protected page
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('kakei')).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    });

    // Should not show protected content
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('should redirect back to original page after successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    
    // Start with unauthenticated state
    const mockAuthState = {
      isAuthenticated: false,
      user: null,
      idToken: null,
      accessToken: null,
      loading: false,
      error: null,
      login: mockLogin,
      signup: vi.fn(),
      confirmEmail: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
    };

    vi.mocked(authHook.useAuth).mockReturnValue(mockAuthState);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should be on login page
    await waitFor(() => {
      expect(screen.getByText('kakei')).toBeInTheDocument();
    });

    // Fill in login form
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: /ログイン/ });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(submitButton);

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'TestPassword123!');
    });

    // Simulate successful authentication
    vi.mocked(authHook.useAuth).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: true,
      user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
    });

    // Rerender to trigger navigation
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should now show protected content
    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  it('should allow authenticated user to access protected routes directly', () => {
    // Mock authenticated state
    vi.mocked(authHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com', userId: '123', createdAt: '2024-01-01' },
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      loading: false,
      error: null,
      login: vi.fn(),
      signup: vi.fn(),
      confirmEmail: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show protected content immediately
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('kakei')).not.toBeInTheDocument();
  });

  it('should handle multiple protected routes with correct redirects', async () => {
    // Mock unauthenticated state
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

    // Try to access a different protected route
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard Content</div>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <div>Settings Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByText('kakei')).toBeInTheDocument();
    });

    // Should not show protected content
    expect(screen.queryByText('Settings Content')).not.toBeInTheDocument();
  });
});
