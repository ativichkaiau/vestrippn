import { collectErrors, expect, ready, test } from './fixtures';

test.describe('study tools', () => {
  test('drug cards: filter the index, open a card, reach it from ⌘K and the terminal', async ({ signedIn: page }) => {
    const errors = collectErrors(page);
    await page.goto('/drugs');
    await ready(page);
    const filter = page.getByRole('searchbox', { name: 'Filter drug cards' });
    await filter.fill('opioid receptor');
    const tiles = page.locator('.sys-drug-tile');
    await expect(tiles).toHaveCount(3); // fentanyl, morphine, naloxone
    await tiles.filter({ hasText: 'Naloxone' }).click();
    await expect(page).toHaveURL(/\/drugs\/naloxone$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Naloxone');
    await expect(page.locator('.sys-page-header')).toContainText('C19H21NO4');
    await expect(page.getByRole('note')).toContainText('study aid');
    await expect(page.locator('.sys-drug-structure svg line').first()).toBeAttached();

    await page.keyboard.press('Control+k');
    await page.getByRole('combobox', { name: 'Search VESTRIPPN' }).fill('noradrenaline');
    await page.getByRole('group', { name: 'DRUG' }).getByRole('option').first().click();
    await expect(page).toHaveURL(/\/drugs\/noradrenaline$/);

    await page.keyboard.press('Control+Backquote');
    const terminal = page.getByLabel('Terminal command');
    await terminal.fill('drug sux');
    await terminal.press('Enter');
    await expect(page).toHaveURL(/\/drugs\/suxamethonium$/);
    expect(errors).toEqual([]);
  });

  test('the Study view finds drug cards and asks to sign in for personal queues', async ({ signedIn: page }) => {
    await page.goto('/systems');
    await ready(page);
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    const view = page.getByRole('complementary', { name: 'study view' });
    await expect(view).toContainText('Sign in to see your exam countdowns');
    await view.getByRole('searchbox', { name: 'Find a drug card' }).fill('TXA');
    await view.getByRole('link', { name: /Tranexamic acid/ }).click();
    await expect(page).toHaveURL(/\/drugs\/tranexamic-acid$/);
  });

  test('the case editor is closed to anyone but the owner', async ({ signedIn: page }) => {
    await page.goto('/study/editor');
    await ready(page);
    await expect(page.getByText("The case editor is for the owner's account.")).toBeVisible();
    const res = await page.request.get('/api/learn/cases/anything/source');
    expect(res.status()).toBe(403);
    const create = await page.request.post('/api/learn/cases', { data: {} });
    expect(create.status()).toBe(403);
  });
});
