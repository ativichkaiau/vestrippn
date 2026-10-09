import { collectErrors, expect, ready, test } from './fixtures';

test('phone: drawer explorer, no horizontal scroll', async ({ signedIn: page }) => {
  const errors = collectErrors(page);
  await page.goto('/systems/vestrippn');
  await ready(page);
  await expect(page.locator('.sys-activitybar')).toBeHidden();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await expect(drawer.getByRole('link', { name: 'medicine' })).toBeVisible();
  await drawer.getByRole('link', { name: 'medicine' }).click();
  await expect(page).toHaveURL(/\/medicine$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
