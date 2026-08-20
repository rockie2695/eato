/**
 * Utility functions shared across Web and Mobile.
 * Pure functions with no platform-specific dependencies.
 */

import { EMAIL_REGEX, PHONE_REGEX, MIN_PASSWORD_LENGTH } from '../constants';

// ─── Currency Formatting ───────────────────────────────────────

/**
 * Format a number as currency string.
 * @param amount - The amount in cents (e.g., 1299 = $12.99)
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted string like "$12.99"
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Parse a price string back to cents.
 * @param priceStr - String like "$12.99" or "12.99"
 * @returns Amount in cents
 */
export function parsePriceToCents(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

// ─── Date & Time ───────────────────────────────────────────────

/**
 * Format a date string to relative time (e.g., "5 min ago").
 * @param dateStr - ISO date string
 * @returns Human-readable relative time
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDay > 365 ? 'numeric' : undefined,
  });
}

/**
 * Format a date to display string.
 * @param dateStr - ISO date string
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format preparation time in minutes.
 * @param minutes - Number of minutes
 * @returns Formatted string like "15-20 min"
 */
export function formatPrepTime(minutes: number): string {
  if (minutes <= 0) return 'Ready now';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ─── Validation ────────────────────────────────────────────────

/** Validation result type */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format.
 * @param email - Email string to validate
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}

/**
 * Validate password strength.
 * @param password - Password string to validate
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain a number' };
  }
  return { isValid: true };
}

/**
 * Validate phone number format.
 * @param phone - Phone string to validate
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  if (!PHONE_REGEX.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  return { isValid: true };
}

// ─── Cart Calculations ─────────────────────────────────────────

/**
 * Calculate cart total from items.
 * @param items - Array of { price, quantity }
 * @returns Total in cents
 */
export function calculateCartTotal(
  items: { price: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate total item count in cart.
 * @param items - Array of { quantity }
 * @returns Total number of items
 */
export function calculateItemCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── String Helpers ────────────────────────────────────────────

/**
 * Truncate a string to max length with ellipsis.
 * @param str - Input string
 * @param maxLength - Maximum characters
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Generate initials from a name (e.g., "John Doe" → "JD").
 * @param name - Full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Capitalize first letter of each word.
 * @param str - Input string
 */
export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

// ─── Array Helpers ─────────────────────────────────────────────

/**
 * Group an array by a key function.
 * @param items - Array to group
 * @param keyFn - Function that returns the group key
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Debounce a function call.
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
