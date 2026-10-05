import { collectErrors, expect, ready, test } from './fixtures';

test('focus mode loads on first request and opens with its title', async ({ signedIn: page }) => {
  const errors = collectErrors(page);
  await page.goto('/systems');
  await ready(page);
  await expect(page.getByRole('dialog', { name: 'Focus mode' })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('vest:focus-open', { detail: { title: 'HSC · anemia', minutes: 25 } })));
  const dialog = page.getByRole('dialog', { name: 'Focus mode' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Pick your circuit' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});
