/**
 * Web API Client Setup.
 *
 * Initializes the shared API client with localStorage adapter.
 * This is the single source of truth for all API calls.
 */

import {
  createApiClient,
  webStorage,
  createAuthApi,
  createMenuApi,
  createCartApi,
  createOrderApi,
  createStaffApi,
  createNotificationApi,
  createAnalyticsApi,
} from '@eato/shared/api';

/** API client instance configured for web platform */
const apiClient = createApiClient(webStorage);

/** API modules */
export const authApi = createAuthApi(apiClient);
export const menuApi = createMenuApi(apiClient);
export const cartApi = createCartApi(apiClient);
export const orderApi = createOrderApi(apiClient);
export const staffApi = createStaffApi(apiClient);
export const notificationApi = createNotificationApi(apiClient);
export const analyticsApi = createAnalyticsApi(apiClient);

/** Export storage for store initialization */
export { webStorage as storage };
