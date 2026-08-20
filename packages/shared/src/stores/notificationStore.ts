/**
 * Notification Store (Zustand)
 *
 * Manages notification state for tickers and popups.
 * Fetches active notifications on app start.
 *
 * Usage:
 *   const { tickers, popups, loadActive } = useNotificationStore();
 */

import { create } from 'zustand';
import type { Notification, NotificationType } from '../types';

interface NotificationState {
  /** Active ticker notifications */
  tickers: Notification[];
  /** Active popup notifications */
  popups: Notification[];
  /** Popups the user has dismissed (by ID) */
  dismissedPopups: string[];
  /** Whether notifications are loading */
  isLoading: boolean;
}

interface NotificationActions {
  /** Load active notifications from API */
  loadActive: (fetcher: (type?: NotificationType) => Promise<Notification[]>) => Promise<void>;
  /** Dismiss a popup (won't show again this session) */
  dismissPopup: (id: string) => void;
  /** Check if a popup should be shown */
  shouldShowPopup: (id: string) => boolean;
  /** Clear all notifications */
  clear: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

/**
 * Create the notification store.
 */
export function createNotificationStore() {
  return create<NotificationStore>((set, get) => ({
    // ── State ────────────────────────────────────────────────
    tickers: [],
    popups: [],
    dismissedPopups: [],
    isLoading: false,

    // ── Actions ──────────────────────────────────────────────

    /**
     * Load active notifications from the API.
     * Fetches tickers and popups separately for efficient caching.
     */
    loadActive: async (fetcher) => {
      set({ isLoading: true });
      try {
        const [tickers, popups] = await Promise.all([
          fetcher('ticker'),
          fetcher('popup'),
        ]);
        set({ tickers, popups, isLoading: false });
      } catch {
        // Fail silently - notifications are non-critical
        set({ isLoading: false });
      }
    },

    /** Dismiss a popup so it won't show again this session */
    dismissPopup: (id) => {
      const { dismissedPopups } = get();
      if (!dismissedPopups.includes(id)) {
        set({ dismissedPopups: [...dismissedPopups, id] });
      }
    },

    /** Check if a popup should be shown (not dismissed) */
    shouldShowPopup: (id) => {
      return !get().dismissedPopups.includes(id);
    },

    /** Clear all notifications */
    clear: () => {
      set({ tickers: [], popups: [], dismissedPopups: [] });
    },
  }));
}
