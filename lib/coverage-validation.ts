import { COVERAGE_STATUSES, type CoverageRecord, type CoverageResult, type CoverageStatus } from './coverage-types';

export class CoverageInputError extends Error {}

export function coverageObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CoverageInputError('Invalid coverage data.');
  return value as Record<string, unknown>;
}

export function coverageText(value: unknown, label: string, max: number, allowEmpty = false): string {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) throw new CoverageInputError(`${label} must contain ${allowEmpty ? '0' : '1'}–${max} characters.`);
  return value.trim();
}

export function coverageKey(value: unknown): string {
  if (typeof value !== 'string' || !/^(hub:[a-z0-9-]+|custom:[a-zA-Z0-9-]+)$/.test(value) || value.length > 180) throw new CoverageInputError('Invalid learning objective.');
  return value;
}

export function coverageStatus(value: unknown): CoverageStatus {
  if (!COVERAGE_STATUSES.includes(value as CoverageStatus)) throw new CoverageInputError('Choose untouched, reviewed, or tested.');
  return value as CoverageStatus;
}

export function coverageUrl(value: unknown): string | null {
  if (value == null || value === '') return null;
  const text = coverageText(value, 'Link', 2048);
  let url: URL;
  try { url = new URL(text); } catch { throw new CoverageInputError('Use a full HTTPS link.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new CoverageInputError('Use a full HTTPS link without credentials.');
  return url.href;
}

export function coverageResult(value: unknown): CoverageResult {
  const row = coverageObject(value);
  if (typeof row.id !== 'string' || !/^[a-zA-Z0-9:_-]{1,180}$/.test(row.id)) throw new CoverageInputError('Invalid practice result ID.');
  if (!Number.isInteger(row.total) || Number(row.total) < 1 || Number(row.total) > 10_000 || !Number.isInteger(row.correct) || Number(row.correct) < 0 || Number(row.correct) > Number(row.total)) throw new CoverageInputError('Enter a score between 0 and the total number of questions.');
  if (typeof row.recordedAt !== 'string' || !Number.isFinite(Date.parse(row.recordedAt))) throw new CoverageInputError('Invalid practice date.');
  return { id: row.id, label: coverageText(row.label, 'Practice name', 120), correct: Number(row.correct), total: Number(row.total), recordedAt: new Date(row.recordedAt).toISOString(), url: coverageUrl(row.url) };
}

export function coverageResults(value: unknown): CoverageResult[] {
  if (!Array.isArray(value) || value.length > 100) throw new CoverageInputError('Keep at most 100 practice results per objective.');
  const results = value.map(coverageResult);
  if (new Set(results.map(result => result.id)).size !== results.length) throw new CoverageInputError('Duplicate practice result IDs.');
  return results.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function validateCoverageRecord(value: unknown): CoverageRecord {
  const row = coverageObject(value);
  const key = coverageKey(row.key);
  const sourceTopicId = key.startsWith('hub:') ? key.slice(4) : null;
  if (row.sourceTopicId !== sourceTopicId) throw new CoverageInputError('The source topic does not match the objective.');
  if (!Number.isInteger(row.revision) || Number(row.revision) < 0) throw new CoverageInputError('Invalid coverage revision.');
  if (row.updatedAt !== null && (typeof row.updatedAt !== 'string' || !Number.isFinite(Date.parse(row.updatedAt)))) throw new CoverageInputError('Invalid coverage date.');
  return { key, sourceTopicId, title: coverageText(row.title, 'Objective', 500), section: coverageText(row.section, 'Topic group', 300), status: coverageStatus(row.status), notes: coverageText(row.notes, 'Notes', 20_000, true), noteUrl: coverageUrl(row.noteUrl), results: coverageResults(row.results), revision: Number(row.revision), updatedAt: row.updatedAt === null ? null : new Date(row.updatedAt as string).toISOString() };
}
