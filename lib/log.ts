// Structured logging with a single hook point for an error tracker. Everything
// funnels through here so wiring Sentry later is a one-place change — set
// SENTRY_DSN and forward `payload` from the two TODOs below.

type Level = "error" | "warn" | "info";

function emit(level: Level, context: string, data?: Record<string, unknown>) {
  const payload = { level, context, ...data, ts: new Date().toISOString() };
  const tag = `[${context}]`;
  if (level === "error") console.error(tag, data ?? "");
  else if (level === "warn") console.warn(tag, data ?? "");
  else console.info(tag, data ?? "");
  // TODO(sentry): if (process.env.SENTRY_DSN) forward `payload` as a breadcrumb/message.
  void payload;
}

export function logEvent(context: string, data?: Record<string, unknown>) {
  emit("info", context, data);
}

export function captureError(context: string, error: unknown, data?: Record<string, unknown>) {
  emit("error", context, {
    ...data,
    error: error instanceof Error ? error.message : String(error),
  });
  // TODO(sentry): if (process.env.SENTRY_DSN) Sentry.captureException(error, { tags: { context }, extra: data });
}
