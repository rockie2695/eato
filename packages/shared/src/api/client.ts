/**
 * API Client module.
 *
 * Provides a platform-adaptive axios instance that works on both
 * Web (localStorage) and Mobile (AsyncStorage) via dependency injection.
 *
 * Usage:
 *   import { createApiClient } from '@eato/shared/api';
 *   const api = createApiClient(storageAdapter);
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '../constants';
import type { AuthResponse, ApiError } from '../types';

// ─── Storage Adapter Interface ─────────────────────────────────

/**
 * Abstract storage interface for platform adaptation.
 * Web uses localStorage, Mobile uses AsyncStorage.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// ─── API Client Factory ────────────────────────────────────────

/**
 * Create a configured API client instance.
 * @param storage - Platform-specific storage adapter
 * @param baseURL - Optional base URL override
 */
export function createApiClient(
  storage: StorageAdapter,
  baseURL: string = API_BASE_URL
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ── Request Interceptor ────────────────────────────────────
  // Automatically attach JWT access token to every request.
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response Interceptor ───────────────────────────────────
  // Handle 401 errors by attempting token refresh, then retry.
  // On refresh failure, clear auth state and redirect to login.
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If 401 and not already retried, attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await storage.getItem(
            STORAGE_KEYS.REFRESH_TOKEN
          );

          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const { data } = await axios.post<AuthResponse>(
            `${baseURL}/auth/refresh`,
            { refreshToken }
          );

          // Store new tokens
          await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return client(originalRequest);
        } catch {
          // Refresh failed - clear auth and reject
          await storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          await storage.removeItem(STORAGE_KEYS.USER);

          // Redirect to login (platform-specific)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(error);
        }
      }

      // Format error for consistent handling
      const apiError: ApiError = {
        message:
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          'An unexpected error occurred',
        code:
          (error.response?.data as { code?: string })?.code ||
          'UNKNOWN_ERROR',
        statusCode: error.response?.status || 500,
        details: (error.response?.data as { details?: Record<string, string[]> })
          ?.details,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
}

// ─── Default Storage Adapters ──────────────────────────────────

/** Web storage adapter using localStorage */
export const webStorage: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};

/** Create a mobile storage adapter (must be passed from Expo side) */
export function createMobileStorage(
  AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }
): StorageAdapter {
  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };
}
