/**
 * Sentry Configuration.
 *
 * Initializes Sentry for error tracking and performance monitoring.
 * Uses free tier - no billing required.
 *
 * Set SENTRY_DSN in .env to enable. Leave empty to disable.
 */

import * as Sentry from '@sentry/node';
import { config } from './index.js';

export function initSentry() {
  if (!config.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    // Free tier: 5K transactions/month, 10K errors/month
    tracesSampleRate: config.NODE_ENV === 'production' ? 0.2 : 1.0,
    // Don't send PII
    sendDefaultPii: false,
    // Only send errors in production or if explicitly enabled
    enabled: config.NODE_ENV === 'production' || config.SENTRY_DSN.includes('dev'),
  });

  console.log('✅ Sentry initialized');
}

export function setupExpressErrorHandler(app: any) {
  Sentry.setupExpressErrorHandler(app);
}

export { Sentry };
