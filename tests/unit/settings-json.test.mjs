import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { toSettingsJson, parseSettingsJson, stripJsonc, changedSettings, DEFAULT_SETTINGS } = await load('lib/system/settings-json.ts');

test('settings.json round-trips the defaults', () => {
  const text = toSettingsJson(DEFAULT_SETTINGS);
  const parsed = parseSettingsJson(text);
  assert.equal(parsed.ok, true);
  assert.deepEqual(changedSettings(DEFAULT_SETTINGS, parsed.settings), []);
});

test('settings.json accepts JSONC and resets missing keys to defaults', () => {
  const parsed = parseSettingsJson(`// hi\n{\n  /* theme */ "workbench.colorTheme": "vscode-modern",\n  "vestrippn.watermark": false, // off\n}\n`);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.settings.colorTheme, 'vscode-modern');
  assert.equal(parsed.settings.watermark, false);
  assert.equal(parsed.settings.appearance, 'dark');
  assert.deepEqual(changedSettings(DEFAULT_SETTINGS, parsed.settings).sort(), ['colorTheme', 'watermark']);
});

test('settings.json keeps strings intact while stripping comments', () => {
  assert.equal(JSON.parse(stripJsonc('{"a": "http://x // y, ]"}')).a, 'http://x // y, ]');
});

test('settings.json reports bad values with their line', () => {
  const parsed = parseSettingsJson('{\n  "window.appearance": "dim",\n  "vestrippn.nope": 1,\n  "vestrippn.lowPower": "yes"\n}');
  assert.equal(parsed.ok, false);
  const byLine = Object.fromEntries(parsed.errors.map((error) => [error.line, error.message]));
  assert.match(byLine[2], /window\.appearance/);
  assert.match(byLine[3], /unknown setting/);
  assert.match(byLine[4], /true or false/);
  assert.equal(parseSettingsJson('{ "a": }').ok, false);
  assert.equal(parseSettingsJson('[]').ok, false);
  const tabs = parseSettingsJson('{ "vestrippn.tabs": [{ "id": "custom:x", "group": "environment" }] }');
  assert.equal(tabs.ok, false);
});
