import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/* Automated accessibility scan (WCAG 2.1 A/AA) of the static pages, in the
   default theme and in VS Code Light Modern. Serious and critical issues
   fail the run. */

const PAGES = ['/identity', '/systems', '/projects', '/medicine', '/garage', '/archive', '/contact', '/tools', '/legal', '/learn/cases', '/drugs', '/drugs/dexmedetomidine', '/settings', '/study', '/study/drill', '/study/editor'];
const THEMES = [
  { name: 'vestrippn dark', storage: {} },
  { name: 'vscode light modern', storage: { vest_theme: 'vscode-modern', vest_mode: 'day' } },
  { name: 'vscode dark+', storage: { vest_theme: 'vscode-classic', vest_mode: 'night' } },
];

for (const theme of THEMES) {
  test.describe(theme.name, () => {
    for (const path of PAGES) {
      test(`axe ${path}`, async ({ signedIn: page }) => {
        await page.addInitScript((values) => {
          for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value as string);
        }, theme.storage);
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
        expect(
          blocking.map((violation) => `${violation.id}: ${violation.help} — ${violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join(' | ')}`),
        ).toEqual([]);
      });
    }
  });
}
