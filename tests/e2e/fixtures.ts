import { test as base, expect, type Page } from '@playwright/test';

/* A placeholder session cookie gets past the proxy's presence check. There
   is no database or auth secret in these runs, so pages that read private
   data are not exercised; the shell and static pages are. */
export const test = base.extend<{ signedIn: Page }>({
  signedIn: async ({ page, context, baseURL }, provide) => {
    await context.addCookies([{ name: 'authjs.session-token', value: 'e2e', url: baseURL! }]);
    await provide(page);
  },
});

export { expect };

/** Wait until the shell has hydrated: its effect has opened the page's tab. */
export async function ready(page: Page): Promise<void> {
  await expect(page.locator('.sys-tab[data-active]')).toBeAttached();
}

/** Errors that matter: uncaught exceptions and console errors, minus the
 *  expected ones (no auth secret / database in e2e). */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/authjs|errors\.authjs\.dev|Failed to load resource|ERR_CONNECTION/.test(text)) return;
    errors.push(text);
  });
  return errors;
}
