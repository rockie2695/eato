/**
 * API module barrel export.
 *
 * Re-exports the client factory, storage adapters, and all endpoint creators.
 *
 * Usage:
 *   import { createApiClient, webStorage, createAuthApi } from '@eato/shared/api';
 */

export { createApiClient, webStorage, createMobileStorage } from './client';
export type { StorageAdapter } from './client';
export {
  createAuthApi,
  createMenuApi,
  createCartApi,
  createOrderApi,
  createStaffApi,
  createNotificationApi,
  createAnalyticsApi,
} from './endpoints';
