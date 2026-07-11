// ════════════════════════════════════════════════════════════════════════
// Typed environment access + capability flags.
//
// Philosophy: NEVER throw on a missing var. A missing integration disables
// that feature (see `flags`) instead of breaking a whole page. Critical vars
// (auth secret, database) are *warned* at boot via logEnvReport(), not thrown,
// so a read still renders in a degraded mode. Kept dependency-free.
// ════════════════════════════════════════════════════════════════════════

function str(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Auth.js accepts either name.
  authSecret: str(process.env.AUTH_SECRET) ?? str(process.env.NEXTAUTH_SECRET),
  databaseUrl: str(process.env.VESTRIPPN_PRISMA_DATABASE_URL),
  ownerEmail: str(process.env.OWNER_EMAIL),
  // Canvas telemetry — CANVAS_TOKEN preferred, CANVAS_API_TOKEN legacy alias.
  canvasToken: str(process.env.CANVAS_TOKEN) ?? str(process.env.CANVAS_API_TOKEN),
  canvasBaseUrl: str(process.env.CANVAS_BASE_URL) ?? 'https://mango-cmu.instructure.com',
  googleClientId: str(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: str(process.env.GOOGLE_CLIENT_SECRET),
  lineClientId: str(process.env.LINE_CLIENT_ID),
  lineClientSecret: str(process.env.LINE_CLIENT_SECRET),
  openaiApiKey: str(process.env.OPENAI_API_KEY),
  openaiModel: str(process.env.OPENAI_MODEL) ?? 'gpt-4o-mini',
  notionApiKey: str(process.env.NOTION_API_KEY),
  notionDatabaseId: str(process.env.NOTION_DATABASE_ID),
  ncbiApiKey: str(process.env.NCBI_API_KEY),
  elsevierApiKey: str(process.env.ELSEVIER_API_KEY),
  ankiSyncSecret: str(process.env.ANKI_SYNC_SECRET),
  // Web push (VAPID) + cron auth.
  vapidPublic: str(process.env.VAPID_PUBLIC_KEY),
  vapidPrivate: str(process.env.VAPID_PRIVATE_KEY),
  vapidSubject: str(process.env.VAPID_SUBJECT) ?? 'mailto:admin@vestrippn.app',
  cronSecret: str(process.env.CRON_SECRET),
} as const;

// Capability flags — gate features on these instead of reading env directly, so
// an unconfigured integration degrades gracefully.
export const flags = {
  database: Boolean(env.databaseUrl),
  authSecret: Boolean(env.authSecret),
  googleAuth: Boolean(env.googleClientId && env.googleClientSecret),
  lineAuth: Boolean(env.lineClientId && env.lineClientSecret),
  canvas: Boolean(env.canvasToken),
  openai: Boolean(env.openaiApiKey),
  notion: Boolean(env.notionApiKey && env.notionDatabaseId),
  pubmed: Boolean(env.ncbiApiKey),
  anki: Boolean(env.ankiSyncSecret),
  push: Boolean(env.vapidPublic && env.vapidPrivate),
} as const;

export function envReport() {
  const missingCritical: string[] = [];
  if (!flags.authSecret) missingCritical.push('AUTH_SECRET');
  if (!flags.database) missingCritical.push('VESTRIPPN_PRISMA_DATABASE_URL');
  const integrations = (Object.keys(flags) as (keyof typeof flags)[])
    .filter((k) => k !== 'authSecret' && k !== 'database')
    .map((k) => `${flags[k] ? '✓' : '·'} ${k}`);
  return { missingCritical, integrations };
}

let reported = false;
export function logEnvReport() {
  if (reported) return;
  reported = true;
  const { missingCritical, integrations } = envReport();
  if (missingCritical.length) {
    console.warn(`[env] Degraded — missing critical vars: ${missingCritical.join(', ')} (see .env.example)`);
  }
  console.info(`[env] Integrations  ${integrations.join('   ')}`);
}
