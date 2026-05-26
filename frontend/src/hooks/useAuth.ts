import { useState, useCallback, useEffect, useRef } from 'react';
import * as authApi from '../api/auth';
import type { User, AuthTokens } from '../types/auth';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  idToken: string | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Token storage keys
 */
const STORAGE_KEYS = {
  ID_TOKEN: 'kakei_id_token',
  ACCESS_TOKEN: 'kakei_access_token',
  REFRESH_TOKEN: 'kakei_refresh_token',
} as const;

/**
 * Token expiration check interval (5 minutes)
 */
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Custom hook for authentication state management
 * Provides authentication context and functions to the frontend application
 *
 * @returns Authentication state and functions
 */
export function useAuth() {
  // 🔧 MOCK MODE: Cognitoがデプロイされていない場合のモック
  const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true';

  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    idToken: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

      const storeTokens = useCallback((tokens: AuthTokens, email?: string) => {
    localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    // メールアドレスも保存（MOCK MODEで使用）
    if (email) {
      localStorage.setItem('kakei_user_email', email);
    }
  }, []);

  /**
   * Clear tokens from localStorage
   */
  const clearTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem('kakei_user_email');
  }, []);

  /**
   * Restore session from localStorage
   */
  const restoreSession = useCallback(async () => {
    try {
      const idToken = localStorage.getItem(STORAGE_KEYS.ID_TOKEN);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!idToken || !accessToken) {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        return;
      }

      // 🔧 MOCK MODE: モックトークンの場合はそのまま復元
      if (MOCK_MODE && idToken === 'mock-id-token') {
        // ローカルストレージからメールアドレスを取得
        const storedEmail = localStorage.getItem('kakei_user_email');
        const mockUser: User = {
          userId: 'mock-user-123',
          email: storedEmail || 'test@example.com',
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: mockUser,
          idToken,
          accessToken,
          loading: false,
          error: null,
        }));
        return;
      }

      // Check if token is expired
      if (authApi.isTokenExpired(idToken)) {
        clearTokens();
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        return;
      }

      // Extract user from token
      const user = authApi.getUserFromToken(idToken);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
        idToken,
        accessToken,
        loading: false,
        error: null,
      }));
    } catch (error) {
      clearTokens();
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to restore session',
      }));
    }
  }, [MOCK_MODE, clearTokens]);

  /**
   * Check token expiration periodically
   */
  const startTokenExpirationCheck = useCallback(() => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
    }

    tokenCheckIntervalRef.current = setInterval(() => {
      const idToken = localStorage.getItem(STORAGE_KEYS.ID_TOKEN);
      if (idToken && authApi.isTokenExpired(idToken)) {
        clearTokens();
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          idToken: null,
          accessToken: null,
          error: 'Session expired. Please log in again.',
        }));
      }
    }, TOKEN_CHECK_INTERVAL);
  }, [clearTokens]);

  /**
   * Stop token expiration check
   */
  const stopTokenExpirationCheck = useCallback(() => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
  }, []);

  /**
   * Auto-restore session on app load
   */
  useEffect(() => {
    restoreSession();

    return () => {
      stopTokenExpirationCheck();
    };
  }, [restoreSession, stopTokenExpirationCheck]);

  /**
   * Start token expiration check when authenticated
   */
  useEffect(() => {
    if (state.isAuthenticated) {
      startTokenExpirationCheck();
    } else {
      stopTokenExpirationCheck();
    }
  }, [state.isAuthenticated, startTokenExpirationCheck, stopTokenExpirationCheck]);

  /**
   * Sign up a new user
   * @param email - User email
   * @param password - User password
   */
  const signup = useCallback(
    async (email: string, password: string): Promise<void> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // 🔧 MOCK MODE
        if (MOCK_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
          return;
        }

        await authApi.signUp({ email, password, confirmPassword: password });

        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Sign up failed',
        }));
        throw error;
      }
    },
    [MOCK_MODE]
  );

  /**
   * Confirm email with verification code
   * @param email - User email
   * @param code - Verification code
   */
  const confirmEmail = useCallback(
    async (email: string, code: string): Promise<void> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // 🔧 MOCK MODE
        if (MOCK_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
          return;
        }

        await authApi.confirmSignUp(email, code);

        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Email confirmation failed',
        }));
        throw error;
      }
    },
    [MOCK_MODE]
  );

  /**
   * Sign in user
   * @param email - User email
   * @param password - User password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // 🔧 MOCK MODE
        if (MOCK_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockUser: User = {
            userId: 'mock-user-123',
            email,
            createdAt: new Date().toISOString(),
          };
          const mockToken = 'mock-id-token';
          const mockAccessToken = 'mock-access-token';

          storeTokens({ idToken: mockToken, accessToken: mockAccessToken }, email);

          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user: mockUser,
            idToken: mockToken,
            accessToken: mockAccessToken,
            loading: false,
            error: null,
          }));
          return;
        }

        const tokens = await authApi.signIn({ email, password });
        const user = authApi.getUserFromToken(tokens.idToken);

        storeTokens(tokens);

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user,
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Login failed',
        }));
        throw error;
      }
    },
    [MOCK_MODE, storeTokens]
  );

  /**
   * Sign out user
   */
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        await authApi.signOut(accessToken);
      }

      clearTokens();

      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        loading: false,
        error: null,
      }));
    } catch (error) {
      // Even if sign out fails on the server, clear local state
      clearTokens();

      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        idToken: null,
        accessToken: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  }, [clearTokens]);

  /**
   * Initiate password reset
   * @param email - User email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        await authApi.resetPassword(email);

        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Password reset initiation failed',
        }));
        throw error;
      }
    },
    []
  );

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    idToken: state.idToken,
    accessToken: state.accessToken,
    loading: state.loading,
    error: state.error,

    // Functions
    login,
    signup,
    confirmEmail,
    logout,
    resetPassword,
  };
}
