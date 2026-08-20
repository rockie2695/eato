/**
 * Mobile Store Instances.
 *
 * Creates Zustand store instances configured for the mobile platform.
 * Uses Expo SecureStore as the storage adapter.
 */

import { createAuthStore, createCartStore, createOrderStore, createNotificationStore } from '@eato/shared/stores';
import { createApiClient, createMobileStorage } from '@eato/shared/api';
import {
  createAuthApi,
  createMenuApi,
  createCartApi,
  createOrderApi,
  createNotificationApi,
} from '@eato/shared/api';
import * as SecureStore from 'expo-secure-store';

// Create mobile storage adapter using Expo SecureStore
const mobileStorage = createMobileStorage({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

// Create API client
const apiClient = createApiClient(mobileStorage);
const authApi = createAuthApi(apiClient);
const orderApi = createOrderApi(apiClient);
const notificationApi = createNotificationApi(apiClient);

/** Authentication store */
export const useAuthStore = createAuthStore(mobileStorage, authApi);

/** Shopping cart store */
export const useCartStore = createCartStore(mobileStorage);

/** Order management store */
export const useOrderStore = createOrderStore(orderApi);

/** Notification store (tickers + popups) */
export const useNotificationStore = createNotificationStore();

/** Export API modules for screen use */
export { createMenuApi, createCartApi, notificationApi };
export const menuApi = createMenuApi(apiClient);
export const cartApi = createCartApi(apiClient);
