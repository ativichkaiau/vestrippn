import { collectErrors, expect, ready, test } from './fixtures';

test('customize tabs: rename, hide, reorder, add, reject bad links, reset', async ({ signedIn: page }) => {
  const errors = collectErrors(page);
  await page.goto('/tools');
  await ready(page);
  await page.getByRole('button', { name: 'Customize tabs' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'customize tabs' });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Name for medicine').fill('med school');
  await dialog.locator('li', { has: page.getByLabel('Name for logs') }).getByRole('checkbox').uncheck();
  await expect(dialog.locator('li', { has: page.getByLabel('Name for root') }).getByRole('checkbox')).toBeDisabled();
  await dialog.getByRole('button', { name: 'Move garage up' }).click();

  const name = dialog.getByRole('textbox', { name: 'name', exact: true });
  const link = dialog.getByRole('textbox', { name: 'link' });
  await name.fill('evil');
  await link.fill('javascript:alert(1)');
  await dialog.locator('form button[type=submit]').click();
  await expect(dialog.locator('.sys-nav-editor-add [role=alert]')).toContainText('Only https://');

  await name.fill('cases');
  await link.fill('/learn/cases');
  await dialog.locator('form button[type=submit]').click();

  await dialog.getByLabel('Name for identity').fill('  ');
  await expect(dialog.getByRole('button', { name: /save/ })).toBeDisabled();
  await dialog.getByLabel('Name for identity').fill('identity');
  await dialog.getByRole('button', { name: /save/ }).click();
  await expect(dialog).toBeHidden();

  const explorer = page.getByRole('navigation', { name: 'VESTRIPPN' });
  await expect(explorer.getByRole('link', { name: 'med school' })).toBeVisible();
  await expect(explorer.getByRole('link', { name: /^logs/ })).toHaveCount(0);
  await expect(explorer.getByRole('link', { name: /^cases/ })).toHaveCount(2);

  await page.reload();
  await expect(explorer.getByRole('link', { name: 'med school' })).toBeVisible();

  await page.getByRole('button', { name: 'Customize tabs' }).first().click();
  await dialog.getByRole('button', { name: /reset to default/ }).click();
  await dialog.getByRole('button', { name: /save/ }).click();
  await expect(explorer.getByRole('link', { name: 'medicine' })).toBeVisible();
  expect(errors).toEqual([]);
});
