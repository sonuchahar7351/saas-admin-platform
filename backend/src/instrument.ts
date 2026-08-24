import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0, // sample less in prod to control cost, capture everything in dev
  profilesSampleRate: 0.2,
  enabled: !!process.env.SENTRY_DSN, // no-ops cleanly if DSN isn't set — safe for local dev without a Sentry account
});