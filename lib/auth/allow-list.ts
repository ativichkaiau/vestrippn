/* ════════════════════════════════════════════════════════════════════════
   Who may sign in with Google or LINE.

   AUTH_ALLOWED_EMAILS: comma-separated emails and/or "@domain" entries,
   e.g. "me@uni.ac.th, friend@gmail.com, @cmu.ac.th". Unset keeps the
   historical default: the owner plus any @gmail.com account (other accounts
   get their own empty workspace; owner integrations stay owner-only). The
   owner is always allowed.
   ════════════════════════════════════════════════════════════════════════ */

export const PRIMARY_EMAIL = "ativichkaiau2549@gmail.com";

type AllowEnv = { AUTH_ALLOWED_EMAILS?: string; OWNER_EMAIL?: string };
const fromProcess = (): AllowEnv => ({ AUTH_ALLOWED_EMAILS: process.env.AUTH_ALLOWED_EMAILS, OWNER_EMAIL: process.env.OWNER_EMAIL });

export function allowList(env: AllowEnv = fromProcess()): string[] {
  const owner = env.OWNER_EMAIL?.trim().toLowerCase() || PRIMARY_EMAIL;
  const configured = env.AUTH_ALLOWED_EMAILS?.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  return [owner, ...(configured?.length ? configured : ["@gmail.com"])];
}

export function isAllowedEmail(email: string | null | undefined, env?: AllowEnv): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(normalized)) return false;
  return allowList(env).some((entry) => (entry.startsWith("@") ? normalized.endsWith(entry) : normalized === entry));
}
