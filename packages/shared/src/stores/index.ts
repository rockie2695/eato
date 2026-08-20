/**
 * Stores barrel export.
 *
 * Re-exports all Zustand store creators.
 * Each store is a factory function that accepts platform-specific dependencies.
 */

export { createAuthStore } from './authStore';
export type { AuthStore } from './authStore';

export { createCartStore } from './cartStore';
export type { CartStore } from './cartStore';

export { createOrderStore } from './orderStore';
export type { OrderStore } from './orderStore';

export { createThemeStore } from './themeStore';
export type { ThemeStore, Theme } from './themeStore';
