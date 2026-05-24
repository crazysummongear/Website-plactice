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
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    idToken: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Store tokens in localStorage
   */
  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  }, []);

  /**
   * Clear tokens from localStorage
   */
  const clearTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
  }, [clearTokens]);

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
    []
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
    []
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
    [storeTokens]
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
