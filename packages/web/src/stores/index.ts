/**
 * Web Store Instances.
 *
 * Creates Zustand store instances configured for the web platform.
 * Uses localStorage as the storage adapter.
 */

import { createAuthStore, createCartStore, createOrderStore, createThemeStore } from '@eato/shared/stores';
import { webStorage } from '@eato/shared/api';
import { authApi, orderApi } from './api';

/** Authentication store */
export const useAuthStore = createAuthStore(webStorage, authApi);

/** Shopping cart store */
export const useCartStore = createCartStore(webStorage);

/** Order management store */
export const useOrderStore = createOrderStore(orderApi);

/** Theme store (admin customizable) */
export const useThemeStore = createThemeStore(webStorage);
