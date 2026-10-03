import { collectErrors, expect, ready, test } from './fixtures';

test.describe('VS Code workbench', () => {
  test('opens pages as editor tabs and manages them', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/tools');
    await ready(page);
    await page.goto('/systems');
    await ready(page);
    await page.locator('.sys-tree-item', { hasText: 'garage' }).first().click();
    await expect(page).toHaveURL(/\/garage$/);
    const labels = page.locator('.sys-tab-label');
    await expect(labels).toHaveText(['tools', 'systems', 'garage']);
    await expect(page.locator('.sys-tab[data-active] .sys-tab-label')).toHaveText('garage');

    // Close with the keyboard: goes to the neighbour.
    await page.locator('body').click({ position: { x: 900, y: 400 } });
    await page.keyboard.press('Alt+KeyW');
    await expect(page).toHaveURL(/\/systems$/);
    await expect(labels).toHaveText(['tools', 'systems']);

    // Pin from the context menu; pinned tabs lead.
    await page.locator('.sys-tab', { hasText: 'systems' }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Pin' }).click();
    await expect(labels).toHaveText(['systems', 'tools']);
    await expect(page.locator('.sys-tab[data-pinned]')).toHaveCount(1);

    // Tabs survive a reload (per device).
    await page.reload();
    await expect(labels).toHaveText(['systems', 'tools']);
    expect(errors).toEqual([]);
  });

  test('activity bar switches views and Ctrl+B hides the side bar', async ({ signedIn: page }) => {
    await page.goto('/projects');
    await ready(page);
    await expect(page.getByRole('complementary', { name: 'explorer view' })).toBeVisible();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search VESTRIPPN' }).fill('anki');
    await expect(page.locator('.sys-search-hit').first()).toBeVisible();
    await page.keyboard.press('Control+b');
    await expect(page.locator('aside.sys-sidebar')).toHaveCount(0);
    await page.keyboard.press('Control+Shift+E');
    await expect(page.getByRole('complementary', { name: 'explorer view' })).toBeVisible();
  });

  test('terminal navigates and changes settings', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/systems');
    await ready(page);
    await page.keyboard.press('Control+Backquote');
    const input = page.getByLabel('Terminal command');
    await input.fill('cd medicine');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/medicine$/);
    await input.fill('theme classic');
    await input.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vscode-classic');
    await input.fill('nonsense');
    await input.press('Enter');
    await expect(page.locator('.sys-terminal pre[data-kind="err"]').last()).toContainText('command not found');
    await page.getByRole('tab', { name: 'output' }).click();
    await expect(page.locator('.sys-output-line').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('command palette: quick open and > commands', async ({ signedIn: page }) => {
    await page.goto('/systems');
    await ready(page);
    await page.keyboard.press('Control+Shift+P');
    const input = page.locator('dialog.sys-palette[open] input').first();
    await expect(input).toHaveValue('>');
    await input.fill('>color theme');
    await expect(page.locator('.sys-palette-option b').first()).toContainText('Color Theme');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+/');
    await expect(page.getByRole('dialog', { name: 'keyboard shortcuts' })).toBeVisible();
  });
});
