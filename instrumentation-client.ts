import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.05")

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.05,
  debug: false,
  replaysOnErrorSampleRate: dsn ? 1.0 : 0,
  replaysSessionSampleRate: dsn ? 0.01 : 0,
  beforeSend(event) {
    if (event.request?.data) event.request.data = "[Filtered]"
    if (event.request?.cookies) event.request.cookies = "[Filtered]"
    return event
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
