/**
 * @eato/shared - Shared code for Web and Mobile
 *
 * This package contains all business logic shared between the Vite Web app
 * and the Expo Mobile app:
 *
 * - **types/**: TypeScript interfaces matching the backend Prisma schema
 * - **api/**: Axios-based API client with platform-adaptive storage
 * - **stores/**: Zustand state management (auth, cart, order, theme)
 * - **utils/**: Pure utility functions (formatting, validation, calculations)
 * - **constants/**: Application-wide constants and enum configs
 *
 * @packageDocumentation
 */

// ── Types ──────────────────────────────────────────────────────
export * from './types';

// ── API ────────────────────────────────────────────────────────
export * from './api';

// ── Stores ─────────────────────────────────────────────────────
export * from './stores';

// ── Utils ──────────────────────────────────────────────────────
export * from './utils';

// ── Constants ──────────────────────────────────────────────────
export * from './constants';
