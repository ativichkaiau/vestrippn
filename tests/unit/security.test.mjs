import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { isAllowedEmail, allowList, PRIMARY_EMAIL } = await load('lib/auth/allow-list.ts');
const { rateLimit, resetRateLimits, clientIp } = await load('lib/rate-limit.ts');

test('default allow-list keeps the owner and @gmail.com', () => {
  const env = {};
  assert(isAllowedEmail(PRIMARY_EMAIL, env));
  assert(isAllowedEmail('Friend@Gmail.com ', env));
  assert(!isAllowedEmail('someone@example.com', env));
  assert(!isAllowedEmail('x@gmail.com.evil.com', env));
  assert(!isAllowedEmail(null, env));
  assert(!isAllowedEmail('not-an-email', env));
});

test('AUTH_ALLOWED_EMAILS narrows or widens access; the owner always passes', () => {
  const env = { AUTH_ALLOWED_EMAILS: 'friend@gmail.com, @cmu.ac.th', OWNER_EMAIL: 'me@example.org' };
  assert.deepEqual(allowList(env), ['me@example.org', 'friend@gmail.com', '@cmu.ac.th']);
  assert(isAllowedEmail('me@example.org', env));
  assert(isAllowedEmail('student@cmu.ac.th', env));
  assert(isAllowedEmail('friend@gmail.com', env));
  assert(!isAllowedEmail('other@gmail.com', env), 'gmail is no longer open once a list is set');
});

test('rate limit counts per key within a window', () => {
  resetRateLimits();
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) assert(rateLimit('k', 3, 60_000, now).ok);
  const blocked = rateLimit('k', 3, 60_000, now + 1000);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.retryAfterSec, 59);
  assert(rateLimit('other', 3, 60_000, now).ok, 'keys are independent');
  assert(rateLimit('k', 3, 60_000, now + 60_001).ok, 'a new window starts fresh');
});

test('client ip comes from the first forwarded address', () => {
  assert.equal(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })), '203.0.113.9');
  assert.equal(clientIp(new Headers()), 'unknown');
});
