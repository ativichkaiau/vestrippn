import { expect, ready, test } from './fixtures';

test('VS Code themes apply before paint and persist', async ({ signedIn: page }) => {
  await page.goto('/systems');
  await ready(page);
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  const themes = page.getByRole('group', { name: 'colour theme' });
  await themes.getByRole('radio', { name: /VS Code Classic/ }).check();
  const status = page.locator('.sys-statusbar');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vscode-classic');
  await expect(status).toHaveCSS('background-color', 'rgb(0, 122, 204)');

  await page.getByRole('group', { name: 'appearance' }).getByRole('radio', { name: /^light/ }).check();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.locator('.sys-editor')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  // The boot script applies the saved theme before hydration.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vscode-classic');

  await themes.getByRole('radio', { name: /^VESTRIPPN/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vestrippn');
});

test('the watermark can be switched off, and stays off before paint', async ({ signedIn: page }) => {
  await page.goto('/systems');
  await ready(page);
  const molecule = page.locator('.sys-molecule');
  await expect(molecule).toBeAttached();
  await expect(molecule).toHaveCSS('display', 'flex');
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  const toggle = page.getByRole('group', { name: 'background' }).getByRole('checkbox', { name: /dexmedetomidine watermark/ });
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect(molecule).toHaveCSS('display', 'none');

  // The boot script hides it before hydration.
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/no-watermark/);
  await expect(molecule).toHaveCSS('display', 'none');

  // The sidebar remembers its open view, so Appearance is still showing.
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(molecule).toHaveCSS('display', 'flex');
});
