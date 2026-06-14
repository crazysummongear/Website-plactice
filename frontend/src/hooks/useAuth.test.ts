/**
 * useAuth Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authApi from '../api/auth';

// Mock the auth API
vi.mock('../api/auth', () => ({
  isTokenExpired: vi.fn((token) => false),
  getUserFromToken: vi.fn((token) => ({
    userId: 'user-123',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
  })),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with unauthenticated state', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.idToken).toBeNull();
      expect(result.current.accessToken).toBeNull();
    });

    it('should restore session from localStorage', async () => {
      localStorage.setItem('kakei_id_token', 'mock-id-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.userId).toBe('user-123');
    });

    it('should clear state if saved token is expired', async () => {
      vi.mocked(authApi.isTokenExpired).mockReturnValue(true);

      localStorage.setItem('kakei_id_token', 'expired-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login user successfully', async () => {
      const { result } = renderHook(() => useAuth());

      const mockTokens = {
        idToken: 'new-id-token',
        accessToken: 'new-access-token',
      };

      vi.mocked(authApi.signIn).mockResolvedValue(mockTokens as any);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.userId).toBe('user-123');
      expect(result.current.idToken).toBe('new-id-token');
      expect(localStorage.getItem('kakei_id_token')).toBe('new-id-token');
    });

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.signIn).mockRejectedValue(new Error('Login failed'));

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toContain('Login failed');
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.signIn).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve({
                idToken: 'token',
                accessToken: 'access',
              } as any);
            }, 100)
          )
      );

      const loginPromise = act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Loading should be true during login
      expect(result.current.loading).toBe(true);

      await loginPromise;

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout user successfully', async () => {
      localStorage.setItem('kakei_id_token', 'mock-id-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authApi.signOut).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('kakei_id_token')).toBeNull();
    });

    it('should clear state even if signOut fails', async () => {
      localStorage.setItem('kakei_id_token', 'mock-id-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authApi.signOut).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      // Should still be logged out even if signOut fails
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('kakei_id_token')).toBeNull();
    });
  });

  describe('SignUp', () => {
    it('should sign up user successfully', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.signUp).mockResolvedValue('user-sub-123');

      await act(async () => {
        await result.current.signup('newuser@example.com', 'Password123!');
      });

      expect(vi.mocked(authApi.signUp)).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });

    it('should handle signup error', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.signUp).mockRejectedValue(new Error('User already exists'));

      await expect(
        act(async () => {
          await result.current.signup('existing@example.com', 'Password123!');
        })
      ).rejects.toThrow();

      expect(result.current.error).toContain('User already exists');
    });
  });

  describe('Confirm Email', () => {
    it('should confirm email successfully', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.confirmSignUp).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.confirmEmail('test@example.com', '123456');
      });

      expect(vi.mocked(authApi.confirmSignUp)).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  describe('Reset Password', () => {
    it('should initiate password reset', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authApi.resetPassword).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(vi.mocked(authApi.resetPassword)).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Session Management', () => {
    it('should restore session from localStorage', async () => {
      localStorage.setItem('kakei_id_token', 'mock-id-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.userId).toBe('user-123');
    });

    it('should clear state if saved token is expired', async () => {
      vi.mocked(authApi.isTokenExpired).mockReturnValue(true);

      localStorage.setItem('kakei_id_token', 'expired-token');
      localStorage.setItem('kakei_access_token', 'mock-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle partial token expiration (only id token expired)', async () => {
      // First call (idToken check) returns true (expired), second returns false (accessToken ok)
      vi.mocked(authApi.isTokenExpired).mockImplementationOnce(() => true);

      localStorage.setItem('kakei_id_token', 'expired-id-token');
      localStorage.setItem('kakei_access_token', 'valid-access-token');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should require re-authentication
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should detect session expiration on demand', async () => {
      localStorage.setItem('kakei_id_token', 'still-valid-token');
      localStorage.setItem('kakei_access_token', 'still-valid-access');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simulate token becoming expired
      vi.mocked(authApi.isTokenExpired).mockReturnValueOnce(true);

      // Trigger a check
      await act(async () => {
        // This would happen on API call or periodic check
        if (result.current.idToken && authApi.isTokenExpired(result.current.idToken)) {
          await result.current.logout();
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should store tokens in localStorage', async () => {
      const { result } = renderHook(() => useAuth());

      const mockTokens = {
        idToken: 'stored-id-token',
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
      };

      vi.mocked(authApi.signIn).mockResolvedValue(mockTokens as any);

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(localStorage.getItem('kakei_id_token')).toBe('stored-id-token');
      expect(localStorage.getItem('kakei_access_token')).toBe('stored-access-token');
      expect(localStorage.getItem('kakei_refresh_token')).toBe('stored-refresh-token');
    });

    it('should clear all tokens on logout', async () => {
      localStorage.setItem('kakei_id_token', 'token1');
      localStorage.setItem('kakei_access_token', 'token2');
      localStorage.setItem('kakei_refresh_token', 'token3');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('kakei_id_token')).toBeNull();
      expect(localStorage.getItem('kakei_access_token')).toBeNull();
      expect(localStorage.getItem('kakei_refresh_token')).toBeNull();
    });
  });
});
