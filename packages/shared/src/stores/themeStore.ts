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
  /** Apply dark/light class to document root */
  _applyDarkMode: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

/** Default theme colors — warm food palette */
const DEFAULT_COLORS = {
  primaryColor: '#ea580c',    // Orange-600
  secondaryColor: '',          // Empty = use CSS default (light/dark aware)
  accentColor: '#f97316',     // Orange-500
};

/** Storage key for theme persistence */
const THEME_KEY = 'eato_theme_config';

/** Storage version — bump to force reset old configs */
const THEME_VERSION = 2;
const THEME_VERSION_KEY = 'eato_theme_version';

/** Get system dark mode preference */
function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
    systemDark: getSystemDark(),

    // ── Actions ──────────────────────────────────────────────

    setTheme: (theme) => {
      set({ theme });
      get()._persistTheme();
      get()._applyDarkMode();
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
      get()._applyDarkMode();
    },

    loadTheme: async () => {
      try {
        const savedVersion = await storage.getItem(THEME_VERSION_KEY);
        const saved = await storage.getItem(THEME_KEY);

        if (saved && savedVersion === String(THEME_VERSION)) {
          const config = JSON.parse(saved);
          set(config);
        } else if (saved) {
          // Old config — clear it and use new defaults
          await storage.removeItem(THEME_KEY);
          await storage.setItem(THEME_VERSION_KEY, String(THEME_VERSION));
        } else {
          await storage.setItem(THEME_VERSION_KEY, String(THEME_VERSION));
        }
      } catch {
        // Use defaults
      }
      // Apply theme after loading
      get()._applyDarkMode();
      get()._applyThemeVars();
    },

    // ── Private Helpers ──────────────────────────────────────

    _persistTheme: async () => {
      const { theme, primaryColor, secondaryColor, accentColor, borderRadius } = get();
      await storage.setItem(
        THEME_KEY,
        JSON.stringify({ theme, primaryColor, secondaryColor, accentColor, borderRadius })
      );
    },

    _applyDarkMode: () => {
      if (typeof document === 'undefined') return;

      const { theme, systemDark } = get();
      const isDark = theme === 'dark' || (theme === 'system' && systemDark);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    _applyThemeVars: () => {
      if (typeof document === 'undefined') return;

      const root = document.documentElement;
      const { primaryColor, secondaryColor, accentColor } = get();

      // Only apply admin-customized colors via JS.
      // Empty string = use CSS defaults (which handle light/dark properly).

      if (primaryColor) {
        const hsl = hexToHsl(primaryColor);
        root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }

      if (secondaryColor) {
        const hsl = hexToHsl(secondaryColor);
        root.style.setProperty('--secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty('--secondary-foreground', hsl.l > 50 ? '20 14% 10%' : '40 20% 95%');
      }

      if (accentColor) {
        const hsl = hexToHsl(accentColor);
        root.style.setProperty('--accent', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty('--accent-foreground', '0 0% 100%');
      }

      // If no admin colors set, clear inline styles so CSS defaults take over
      if (!primaryColor) {
        root.style.removeProperty('--primary');
        root.style.removeProperty('--ring');
      }
      if (!secondaryColor) {
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--secondary-foreground');
      }
      if (!accentColor) {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-foreground');
      }
    },
  }));
}

/** Convert hex color to HSL */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 25, s: 95, l: 53 }; // fallback to orange

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
