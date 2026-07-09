// Next.js boot hook — runs once when the server starts. We use it to print a
// one-line environment report (which integrations are configured, which
// critical vars are missing) so a misconfigured deploy is obvious in the logs
// without throwing. See lib/env.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logEnvReport } = await import('./lib/env');
    logEnvReport();
  }
}
