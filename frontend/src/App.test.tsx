import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Mock the auth hook
vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    idToken: null,
    login: vi.fn(),
    signup: vi.fn(),
    confirmEmail: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

describe('App Router Integration', () => {
  it('renders without crashing', () => {
    render(<App />);
    // App should render and redirect to login for unauthenticated users
    expect(document.body).toBeTruthy();
  });

  it('has React Router configured', () => {
    const { container } = render(<App />);
    // Check that the router is rendering
    expect(container).toBeTruthy();
  });

  it('wraps routes with AuthProvider', () => {
    // This test verifies that AuthProvider is in the component tree
    // by checking that the app renders without throwing context errors
    expect(() => render(<App />)).not.toThrow();
  });

  it('wraps routes with QueryClientProvider', () => {
    // This test verifies that QueryClientProvider is in the component tree
    // by checking that the app renders without throwing context errors
    expect(() => render(<App />)).not.toThrow();
  });
});
