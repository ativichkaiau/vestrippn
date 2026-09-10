export class CurriculumInputError extends Error {}

export function curriculumRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CurriculumInputError('Expected a JSON object.');
  return value as Record<string, unknown>;
}

export function curriculumText(value: unknown, label: string, max = 180): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new CurriculumInputError(`${label} must contain 1–${max} characters.`);
  }
  return value.trim();
}

function dateValue(value: unknown, label: string, required = false): Date | null {
  if (value == null || value === '') {
    if (required) throw new CurriculumInputError(`${label} is required.`);
    return null;
  }
  if (typeof value !== 'string') throw new CurriculumInputError(`${label} is invalid.`);
  // Date-only semester boundaries and local exam input are explicitly Bangkok.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const local = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
  const zoned = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  if (!dateOnly && !local && !zoned) throw new CurriculumInputError(`${label} is invalid.`);
  const result = new Date(dateOnly ? `${value}T00:00:00+07:00` : local ? `${value}:00+07:00` : value);
  const day = value.slice(0, 10);
  const parts = day.split('-').map(Number);
  const calendar = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (!Number.isFinite(result.getTime()) || calendar.toISOString().slice(0, 10) !== day || parts[0] < 1900 || parts[0] > 2200) {
    throw new CurriculumInputError(`${label} is invalid.`);
  }
  return result;
}

function httpsLink(value: unknown, label: string): URL | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2048) throw new CurriculumInputError(`${label} is invalid.`);
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new CurriculumInputError(`${label} must be a full HTTPS link.`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new CurriculumInputError(`${label} must be a full HTTPS link without credentials.`);
  return url;
}

export function validateSemester(value: unknown) {
  const input = curriculumRecord(value);
  const name = curriculumText(input.name, 'Semester name', 120);
  const startsAt = dateValue(input.startsAt, 'Start date');
  const endsAt = dateValue(input.endsAt, 'End date');
  if (startsAt && endsAt && endsAt < startsAt) throw new CurriculumInputError('End date must be on or after the start date.');
  if (input.archived !== undefined && typeof input.archived !== 'boolean') throw new CurriculumInputError('Archive status is invalid.');
  return { name, startsAt, endsAt, ...(typeof input.archived === 'boolean' ? { archivedAt: input.archived ? new Date() : null } : {}) };
}

export function validateCourse(value: unknown, canvasBaseUrl = 'https://mango-cmu.instructure.com') {
  const input = curriculumRecord(value);
  const code = curriculumText(input.code, 'Course code', 40);
  const name = curriculumText(input.name, 'Course name');
  const semesterId = curriculumText(input.semesterId, 'Semester', 200);
  const canvas = httpsLink(input.canvasUrl, 'Canvas link');
  const notebook = httpsLink(input.notebookUrl, 'NotebookLM link');
  const canvasCourseId = canvas?.pathname.match(/^\/courses\/(\d+)(?:\/|$)/)?.[1] ?? null;
  if (canvas && (!canvasCourseId || canvas.origin !== new URL(canvasBaseUrl).origin)) {
    throw new CurriculumInputError(`Use a Canvas course link from ${new URL(canvasBaseUrl).hostname} (…/courses/12345).`);
  }
  if (notebook && (!['notebook.google.com', 'notebooklm.google.com'].includes(notebook.hostname) || !/^\/notebook\/[a-zA-Z0-9-]+\/?$/.test(notebook.pathname))) {
    throw new CurriculumInputError('Use a NotebookLM notebook link.');
  }
  const sortOrder = input.sortOrder ?? 0;
  if (!Number.isInteger(sortOrder) || (sortOrder as number) < 0 || (sortOrder as number) > 10000) throw new CurriculumInputError('Course order is invalid.');
  return { code, name, semesterId, canvasCourseId, canvasUrl: canvas?.href ?? null, notebookUrl: notebook?.href ?? null, sortOrder: sortOrder as number };
}

export function validateExam(value: unknown) {
  const input = curriculumRecord(value);
  return {
    courseId: curriculumText(input.courseId, 'Course', 200),
    title: curriculumText(input.title, 'Exam title'),
    scheduledAt: dateValue(input.scheduledAt, 'Exam date and time', true)!,
  };
}
