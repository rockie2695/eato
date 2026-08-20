/**
 * Theme Store (Zustand)
 *
 * Manages UI theme state including color scheme and admin-customizable colors.
 * Persists theme selection to storage.
 *
 * Usage:
 *   const { theme, primaryColor, setTheme, setPrimaryColor } = useThemeStore();
 */

import { create } from 'zustand';
import type { StorageAdapter } from '../api/client';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  /** Active theme mode */
  theme: Theme;
  /** Primary brand color (hex) */
  primaryColor: string;
  /** Secondary brand color (hex) */
  secondaryColor: string;
  /** Accent color (hex) */
  accentColor: string;
  /** Border radius style */
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  /** Whether system preference is dark */
  systemDark: boolean;
}

interface ThemeActions {
  /** Set theme mode */
  setTheme: (theme: Theme) => void;
  /** Set primary color (admin can customize) */
  setPrimaryColor: (color: string) => void;
  /** Set secondary color */
  setSecondaryColor: (color: string) => void;
  /** Set accent color */
  setAccentColor: (color: string) => void;
  /** Set border radius */
  setBorderRadius: (radius: ThemeState['borderRadius']) => void;
  /** Update system dark mode preference */
  setSystemDark: (isDark: boolean) => void;
  /** Load saved theme from storage */
  loadTheme: () => Promise<void>;
  /** Persist theme to local storage */
  _persistTheme: () => Promise<void>;
  /** Apply CSS custom properties to document */
  _applyThemeVars: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

/** Default theme colors */
const DEFAULT_COLORS = {
  primaryColor: '#ea580c',    // Orange-600
  secondaryColor: '#1e293b',  // Slate-800
  accentColor: '#f97316',     // Orange-500
};

/** Storage key for theme persistence */
const THEME_KEY = 'eato_theme_config';

/**
 * Create the theme store.
 * @param storage - Platform storage adapter
 */
export function createThemeStore(storage: StorageAdapter) {
  return create<ThemeStore>((set, get) => ({
    // ── State ────────────────────────────────────────────────
    theme: 'system',
    ...DEFAULT_COLORS,
    borderRadius: 'medium',
    systemDark: false,

    // ── Actions ──────────────────────────────────────────────

    setTheme: (theme) => {
      set({ theme });
      get()._persistTheme();
    },

    setPrimaryColor: (primaryColor) => {
      set({ primaryColor });
      get()._persistTheme();
      get()._applyThemeVars();
    },

    setSecondaryColor: (secondaryColor) => {
      set({ secondaryColor });
      get()._persistTheme();
      get()._applyThemeVars();
    },

    setAccentColor: (accentColor) => {
      set({ accentColor });
      get()._persistTheme();
      get()._applyThemeVars();
    },

    setBorderRadius: (borderRadius) => {
      set({ borderRadius });
      get()._persistTheme();
    },

    setSystemDark: (isDark) => {
      set({ systemDark: isDark });
    },

    loadTheme: async () => {
      try {
        const saved = await storage.getItem(THEME_KEY);
        if (saved) {
          const config = JSON.parse(saved);
          set(config);
        }
      } catch {
        // Use defaults
      }
    },

    // ── Private Helpers ──────────────────────────────────────

    _persistTheme: async () => {
      const { theme, primaryColor, secondaryColor, accentColor, borderRadius } = get();
      await storage.setItem(
        THEME_KEY,
        JSON.stringify({ theme, primaryColor, secondaryColor, accentColor, borderRadius })
      );
    },

    _applyThemeVars: () => {
      // Apply CSS custom properties for web
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const { primaryColor, secondaryColor, accentColor } = get();
        root.style.setProperty('--color-primary', primaryColor);
        root.style.setProperty('--color-secondary', secondaryColor);
        root.style.setProperty('--color-accent', accentColor);
      }
    },
  }));
}
