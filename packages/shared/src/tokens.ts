/**
 * Shared Design Tokens
 *
 * Color values and design constants shared between Web and Mobile.
 * Web uses these via CSS variables; Mobile uses them directly in StyleSheet/NativeWind.
 */

// ─── Color Palette ────────────────────────────────────────────

export const colors = {
  // Primary (Warm Orange)
  primary: {
    50: '#fff8f0',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Cream (Warm Neutrals)
  cream: {
    50: '#fefdfb',
    100: '#fdf8f0',
    200: '#faf0de',
    300: '#f5e6c8',
  },

  // Sage (Cool Neutrals)
  sage: {
    50: '#f6f7f6',
    100: '#e3e5e3',
    200: '#c7cbc6',
    300: '#a3a9a2',
    400: '#7f867e',
    500: '#636962',
    600: '#4f534e',
    700: '#424541',
    800: '#373937',
    900: '#2f312f',
  },

  // Semantic
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
} as const;

// ─── Typography ───────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ─── Border Radius ────────────────────────────────────────────

export const radii = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

// ─── Shadows ──────────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.2)',
  glow: '0 0 20px rgba(234, 88, 12, 0.2)',
  'glow-lg': '0 0 40px rgba(234, 88, 12, 0.3)',
} as const;

// ─── Animation Durations ──────────────────────────────────────

export const durations = {
  instant: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

// ─── Breakpoints (for mobile reference) ───────────────────────

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
