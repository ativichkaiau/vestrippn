import { expect, test } from '@playwright/test';

test('security headers on pages', async ({ request }) => {
  const response = await request.get('/legal');
  const headers = response.headers();
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-powered-by']).toBeUndefined();
});

test('anonymous visitors are sent to sign in', async ({ request }) => {
  const response = await request.get('/academics', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toContain('/auth/signin?callbackUrl=%2Facademics');
});

test('owner data is not served anonymously', async ({ request }) => {
  expect((await request.get('/api/canvas')).status()).toBe(401);
  expect((await request.get('/api/notifications')).status()).toBe(401);
  for (const removed of ['/api/mail', '/api/tasks', '/api/test', '/api/literature']) {
    expect((await request.get(removed)).status(), removed).toBe(404);
  }
});

test('retired entries redirect to their replacements', async ({ request }) => {
  for (const [from, to] of [
    ['/systems/williamshub', '/systems/studyex_medeetomihub'],
    ['/systems/studyex', '/systems/studyex_medeetomihub'],
    ['/projects/williamshub', '/projects/studyex_medeetomihub'],
    ['/logs/001', '/'],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(response.headers().location, from).toBe(to);
  }
  for (const gone of ['/systems/terra', '/projects/cardiac_sim_physics', '/systems/code_till_i_am_bored']) {
    expect((await request.get(gone, { headers: { cookie: 'authjs.session-token=e2e' } })).status(), gone).toBe(404);
  }
});
