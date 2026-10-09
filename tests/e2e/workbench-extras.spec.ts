import { collectErrors, expect, ready, test } from './fixtures';

test.describe('VS Code workbench: recent, outline, settings.json, split', () => {
  test('⌘K lists recently opened pages; Alt+← and Alt+→ move through history', async ({ signedIn: page }) => {
    await page.goto('/tools');
    await ready(page);
    await page.locator('.sys-tree-item', { hasText: 'systems' }).first().click();
    await expect(page).toHaveURL(/\/systems$/);
    await page.locator('.sys-tree-item', { hasText: 'garage' }).first().click();
    await expect(page).toHaveURL(/\/garage$/);

    await page.locator('body').click({ position: { x: 900, y: 400 } });
    await page.keyboard.press('Alt+ArrowLeft');
    await expect(page).toHaveURL(/\/systems$/);
    await page.keyboard.press('Alt+ArrowRight');
    await expect(page).toHaveURL(/\/garage$/);

    await page.keyboard.press('Control+k');
    const recent = page.getByRole('group', { name: 'RECENT' });
    // Newest first, without the page you are on.
    await expect(recent.getByRole('option')).toHaveText([/^systems/, /^tools/]);
    await recent.getByRole('option').first().click();
    await expect(page).toHaveURL(/\/systems$/);
  });

  test('the Outline view lists the page headings and jumps to them', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/archive');
    await ready(page);
    await page.getByRole('button', { name: 'Outline', exact: true }).click();
    const outline = page.getByRole('navigation', { name: 'Outline of this page' });
    const links = outline.getByRole('link');
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThan(2);
    const last = links.last();
    const label = (await last.textContent())?.trim() ?? '';
    await last.click();
    await expect(last).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('#main').getByRole('heading', { name: label, exact: true }).first()).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test('settings.json shows every setting, rejects bad input, and applies a valid edit', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/systems');
    await ready(page);
    await page.keyboard.press('Control+Comma');
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.locator('.sys-tab[data-active] .sys-tab-label')).toHaveText('settings.json');
    const editor = page.getByRole('textbox', { name: 'settings.json' });
    await expect(editor).toHaveValue(/"workbench\.colorTheme": "vestrippn"/);
    await expect(editor).toHaveValue(/"vestrippn\.tabs": \[/);

    const original = await editor.inputValue();
    await editor.fill(original.replace('"window.appearance": "dark"', '"window.appearance": "dim"'));
    await page.getByRole('button', { name: 'Save' }).click();
    const problems = page.getByRole('alert').filter({ hasText: 'problems' });
    await expect(problems).toContainText('window.appearance');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vestrippn');

    await editor.fill(original.replace('"workbench.colorTheme": "vestrippn"', '"workbench.colorTheme": "vscode-modern"').replace('"vestrippn.watermark": true', '"vestrippn.watermark": false, // off'));
    await editor.press('Control+s');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vscode-modern');
    await expect(page.locator('html')).toHaveClass(/no-watermark/);
    await expect(problems).toHaveCount(0);
    // The saved file is the canonical form again.
    await expect(editor).toHaveValue(/"vestrippn\.watermark": false,\n {2}"vestrippn\.tabs"/);
    await expect(editor).not.toHaveValue(/\/\/ off/);
    expect(errors).toEqual([]);
  });

  test('split editor: open to the side, follow navigation inside it, resize, close', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/systems');
    await ready(page);
    await page.goto('/tools');
    await ready(page);
    await page.locator('.sys-tab', { hasText: 'systems' }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Open to the Side' }).click();

    const pane = page.getByRole('region', { name: 'Side editor: systems' });
    await expect(pane).toBeVisible();
    const frame = page.frameLocator('iframe.sys-split-frame');
    // The framed page shows content only: no title bar, tabs or activity bar.
    await expect(frame.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(frame.locator('.sys-topbar')).toBeHidden();
    await expect(frame.locator('.sys-tabs')).toBeHidden();
    // The framed page never opens tabs in the main window.
    await expect(page.locator('.sys-tab-label')).toHaveText(['systems', 'tools']);

    // Keyboard resize on the divider.
    const divider = page.getByRole('separator', { name: 'Resize editor groups' });
    await expect(divider).toHaveAttribute('aria-valuenow', '50');
    await divider.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(divider).toHaveAttribute('aria-valuenow', '45');

    // Navigation inside the frame retitles the group and survives a reload.
    await frame.locator('#main a[href="/systems/studyex_medeetomihub"]').first().click();
    const moved = page.getByRole('region', { name: 'Side editor: studyex_medeetomihub' });
    await expect(moved).toBeVisible();
    await page.reload();
    await expect(moved).toBeVisible();
    await expect(page.locator('.sys-tab-label')).toHaveText(['systems', 'tools']);

    await page.locator('body').click({ position: { x: 300, y: 400 } });
    await page.keyboard.press('Control+Backslash');
    await expect(page.locator('.sys-split-pane')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
