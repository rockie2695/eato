/**
 * Sentry React Integration.
 *
 * Initializes Sentry for frontend error tracking and performance monitoring.
 * Uses free tier - no billing required.
 *
 * Set VITE_SENTRY_DSN in .env to enable. Leave empty to disable.
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Free tier: 5K transactions/month, 10K errors/month
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Don't send PII
    sendDefaultPii: false,
  });

  console.log('✅ Sentry initialized');
}
