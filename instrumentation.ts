import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentry } = await import("./lib/monitoring/sentry")
    await initSentry()
  }
}

export const onRequestError = Sentry.captureRequestError
