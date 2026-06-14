import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from '../context/AuthContext';
import * as authHook from '../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when authentication is loading', () => {
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

    render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should show loading indicator
    const loadingElement = screen.getByText('読み込み中...');
    expect(loadingElement).toBeInTheDocument();
    
    // Protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should transition from loading to authenticated state', () => {
    const mockUseAuth = vi.mocked(authHook.useAuth);
    
    // First render: loading state
    mockUseAuth.mockReturnValue({
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

    const { rerender } = render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should show loading
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    // Simulate loading completing with authentication success
    mockUseAuth.mockReturnValue({
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

    rerender(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should now show protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
  });

  it('should handle loading timeout gracefully', async () => {
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

    render(
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Loading should continue if state doesn't update
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should redirect to /login when user is not authenticated', () => {
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

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div>Protected Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
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
      <BrowserRouter>
        <AuthProvider>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should save current location when redirecting to login', () => {
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

    const TestLoginPage = () => {
      const location = useLocation();
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      
      return (
        <div>
          <div>Login Page</div>
          <div data-testid="from-location">{from || 'no-location'}</div>
        </div>
      );
    };

    render(
      <MemoryRouter initialEntries={['/protected-page']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<TestLoginPage />} />
            <Route
              path="/protected-page"
              element={
                <PrivateRoute>
                  <div>Protected Content</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    
    // Check that location state contains the original path
    const fromLocation = screen.getByTestId('from-location');
    expect(fromLocation.textContent).toBe('/protected-page');
  });
});
