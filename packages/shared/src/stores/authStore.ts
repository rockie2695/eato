/**
 * Authentication Store (Zustand)
 *
 * Manages user authentication state, token lifecycle, and login/logout flows.
 * Shared between Web and Mobile - UI subscribes to store changes.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 */

import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types';
import type { StorageAdapter } from '../api/client';
import { STORAGE_KEYS } from '../constants';

interface AuthState {
  /** Currently authenticated user (null if not logged in) */
  user: User | null;
  /** JWT access token */
  accessToken: string | null;
  /** JWT refresh token */
  refreshToken: string | null;
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  /** Last auth error message */
  error: string | null;
  /** Whether user is authenticated (computed) */
  isAuthenticated: boolean;
}

interface AuthActions {
  /** Initialize auth state from storage (call on app start) */
  initialize: () => Promise<void>;
  /** Authenticate with email/password */
  login: (data: LoginRequest) => Promise<void>;
  /** Register a new account */
  register: (data: RegisterRequest) => Promise<void>;
  /** Update stored tokens after refresh */
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  /** Update user profile */
  setUser: (user: User) => void;
  /** Clear all auth state and storage */
  logout: () => Promise<void>;
  /** Clear error message */
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

/**
 * Create the auth store with a platform-specific storage adapter.
 * @param storage - localStorage (Web) or AsyncStorage (Mobile)
 * @param api - Auth API instance
 */
export function createAuthStore(
  storage: StorageAdapter,
  api: {
    login: (data: LoginRequest) => Promise<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>;
    register: (data: RegisterRequest) => Promise<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>;
    me: () => Promise<User>;
  }
) {
  return create<AuthStore>((set, get) => ({
    // ── State ────────────────────────────────────────────────
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    // ── Actions ──────────────────────────────────────────────

    /**
     * Initialize auth state from persistent storage.
     * Called once on app startup to restore session.
     */
    initialize: async () => {
      try {
        const [accessToken, refreshToken, userJson] = await Promise.all([
          storage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          storage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          storage.getItem(STORAGE_KEYS.USER),
        ]);

        if (accessToken && refreshToken && userJson) {
          const user = JSON.parse(userJson) as User;
          set({ user, accessToken, refreshToken, isAuthenticated: true });
        }
      } catch {
        // Storage corrupted - clear everything
        await get().logout();
      }
    },

    /**
     * Login with email and password.
     * Stores tokens and user data on success.
     */
    login: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const result = await api.login(data);

        // Persist to storage
        await Promise.all([
          storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken),
          storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken),
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user)),
        ]);

        set({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Login failed';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    /**
     * Register a new customer account.
     * Automatically logs in on success.
     */
    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const result = await api.register(data);

        await Promise.all([
          storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken),
          storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken),
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user)),
        ]);

        set({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    /** Update tokens (called after refresh) */
    setTokens: async (accessToken, refreshToken) => {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      set({ accessToken, refreshToken });
    },

    /** Update user profile data */
    setUser: (user) => {
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      set({ user });
    },

    /**
     * Logout - clears all auth state and persistent storage.
     */
    logout: async () => {
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        storage.removeItem(STORAGE_KEYS.USER),
      ]);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
        isAuthenticated: false,
      });
    },

    /** Clear error message */
    clearError: () => set({ error: null }),
  }));
}
