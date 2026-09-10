import { validateFocusSession, validatePreferences, type SyncedPreferences, type SyncedSession } from './device-sync';

export const BACKUP_FORMAT = 'vestrippn-w85-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_MAX_BYTES = 8_000_000;

export type BackupTask = { id: string; title: string; completed: boolean; category: string; dueAt: string | null; estimatedMinutes: number; priority: number };
export type BackupMilestone = { id: string; title: string; completed: boolean; dueAt: string | null; estimatedMinutes: number };
export type BackupNote = { id: string; text: string; updatedAt: string };
export type BackupPaper = { id: string; pmid: string | null; title: string; authors: string | null; journal: string | null; url: string | null; source: string | null; doi: string | null; abstract: string | null; year: number | null; status: string; createdAt: string };
export type BackupDocument = { id: string; title: string; sourceType: string; originalUrl: string | null; status: string; pages: number | null; processedAt: string | null; createdAt: string };
export type BackupExam = { id: string; title: string; scheduledAt: string };
export type BackupCourse = { id: string; code: string; name: string; canvasCourseId: string | null; canvasUrl: string | null; notebookUrl: string | null; sortOrder: number; exams: BackupExam[] };
export type BackupSemester = { id: string; name: string; startsAt: string | null; endsAt: string | null; archivedAt: string | null; courses: BackupCourse[] };
export type BackupPlanDay = { id: string; day: string; availableMinutes: number; completedItems: string[]; updatedAt: string };
export type BackupFocusSession = SyncedSession;

export type BackupPayload = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  tasks: BackupTask[];
  milestones: BackupMilestone[];
  notes: BackupNote[];
  papers: BackupPaper[];
  documents: BackupDocument[];
  semesters: BackupSemester[];
  planDays: BackupPlanDay[];
  focusSessions: BackupFocusSession[];
  preferences: SyncedPreferences;
};

const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max ? value : null;
const id = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,200}$/.test(value) ? value : null;
const iso = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const optionalIso = (value: unknown) => value == null || value === '' ? null : iso(value);
const int = (value: unknown, min: number, max: number, fallback: number) => Number.isInteger(value) && Number(value) >= min && Number(value) <= max ? Number(value) : fallback;
const bool = (value: unknown) => value === true;

function rowId(value: unknown, label: string): string {
  const result = id(value);
  if (!result) throw new Error(`${label} has an invalid ID.`);
  return result;
}

function rowText(value: unknown, label: string, max: number): string {
  const result = text(value, max);
  if (!result || !result.trim()) throw new Error(`${label} is invalid.`);
  return result.trim();
}

function validateTask(value: unknown): BackupTask {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid task in backup.');
  const row = value as Record<string, unknown>;
  return { id: rowId(row.id, 'Task'), title: rowText(row.title, 'Task title', 200), completed: bool(row.completed), category: rowText(row.category ?? 'GENERAL', 'Task category', 80), dueAt: optionalIso(row.dueAt), estimatedMinutes: int(row.estimatedMinutes, 5, 480, 25), priority: int(row.priority, 0, 2, 1) };
}

function validateMilestone(value: unknown): BackupMilestone {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid milestone in backup.');
  const row = value as Record<string, unknown>;
  return { id: rowId(row.id, 'Milestone'), title: rowText(row.title, 'Milestone title', 200), completed: bool(row.completed), dueAt: optionalIso(row.dueAt), estimatedMinutes: int(row.estimatedMinutes, 5, 480, 45) };
}

function validateNote(value: unknown): BackupNote {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid note in backup.');
  const row = value as Record<string, unknown>;
  return { id: rowId(row.id, 'Note'), text: rowText(row.text, 'Note text', 200_000), updatedAt: iso(row.updatedAt) ?? new Date(0).toISOString() };
}

function validatePaper(value: unknown): BackupPaper {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid paper in backup.');
  const row = value as Record<string, unknown>;
  const year = row.year == null ? null : int(row.year, 1800, 2200, 0) || null;
  return { id: rowId(row.id, 'Paper'), pmid: text(row.pmid, 100), title: rowText(row.title, 'Paper title', 1000), authors: text(row.authors, 4000), journal: text(row.journal, 1000), url: text(row.url, 2048), source: text(row.source, 80), doi: text(row.doi, 500), abstract: text(row.abstract, 200_000), year, status: rowText(row.status ?? 'UNSCREENED', 'Paper status', 60), createdAt: iso(row.createdAt) ?? new Date(0).toISOString() };
}

function validateDocument(value: unknown): BackupDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid document in backup.');
  const row = value as Record<string, unknown>;
  const sourceType = rowText(row.sourceType, 'Document source type', 20);
  const status = rowText(row.status ?? 'ready', 'Document status', 20);
  if (!['pdf', 'text', 'url', 'docx'].includes(sourceType)) throw new Error('Document source type is invalid.');
  if (!['processing', 'ready', 'failed'].includes(status)) throw new Error('Document status is invalid.');
  return { id: rowId(row.id, 'Document'), title: rowText(row.title, 'Document title', 1000), sourceType, originalUrl: text(row.originalUrl, 2048), status, pages: row.pages == null ? null : int(row.pages, 0, 1_000_000, 0), processedAt: optionalIso(row.processedAt), createdAt: iso(row.createdAt) ?? new Date(0).toISOString() };
}

function validateSemesters(value: unknown): BackupSemester[] {
  if (!Array.isArray(value)) throw new Error('Invalid semesters in backup.');
  return value.map((semester) => {
    if (!semester || typeof semester !== 'object' || Array.isArray(semester)) throw new Error('Invalid semester in backup.');
    const row = semester as Record<string, unknown>;
    if (!Array.isArray(row.courses)) throw new Error('Invalid courses in backup.');
    return {
      id: rowId(row.id, 'Semester'), name: rowText(row.name, 'Semester name', 120), startsAt: optionalIso(row.startsAt), endsAt: optionalIso(row.endsAt), archivedAt: optionalIso(row.archivedAt),
      courses: row.courses.map((course) => {
        if (!course || typeof course !== 'object' || Array.isArray(course)) throw new Error('Invalid course in backup.');
        const item = course as Record<string, unknown>;
        if (!Array.isArray(item.exams)) throw new Error('Invalid exams in backup.');
        return {
          id: rowId(item.id, 'Course'), code: rowText(item.code, 'Course code', 40), name: rowText(item.name, 'Course name', 180), canvasCourseId: text(item.canvasCourseId, 40), canvasUrl: text(item.canvasUrl, 2048), notebookUrl: text(item.notebookUrl, 2048), sortOrder: int(item.sortOrder, 0, 10_000, 0),
          exams: item.exams.map((exam) => { if (!exam || typeof exam !== 'object' || Array.isArray(exam)) throw new Error('Invalid exam in backup.'); const e = exam as Record<string, unknown>; return { id: rowId(e.id, 'Exam'), title: rowText(e.title, 'Exam title', 180), scheduledAt: iso(e.scheduledAt) ?? (() => { throw new Error('Exam date is invalid.'); })() }; }),
        };
      }),
    };
  });
}

export function validateBackup(value: unknown): BackupPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Backup must be a JSON object.');
  const row = value as Record<string, unknown>;
  if (row.format !== BACKUP_FORMAT || row.version !== BACKUP_VERSION) throw new Error('This backup is from an unsupported VESTRIPPN edition.');
  const createdAt = iso(row.createdAt);
  if (!createdAt) throw new Error('Backup timestamp is invalid.');
  const list = <T>(key: string, validate: (value: unknown) => T, max: number): T[] => { if (!Array.isArray(row[key]) || row[key].length > max) throw new Error(`Backup ${key} is invalid or too large.`); return (row[key] as unknown[]).map(validate); };
  const planDays = list('planDays', (value) => { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid plan day in backup.'); const item = value as Record<string, unknown>; if (!Array.isArray(item.completedItems)) throw new Error('Invalid plan completion list.'); return { id: rowId(item.id, 'Plan day'), day: rowText(item.day, 'Plan day', 20), availableMinutes: int(item.availableMinutes, 5, 720, 120), completedItems: item.completedItems.filter((entry): entry is string => typeof entry === 'string' && entry.length <= 240).slice(0, 500), updatedAt: iso(item.updatedAt) ?? new Date(0).toISOString() }; }, 4000);
  const preferences = validatePreferences(row.preferences ?? {});
  const focusSessions = list('focusSessions', validateFocusSession, 10_000);
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt, tasks: list('tasks', validateTask, 10_000), milestones: list('milestones', validateMilestone, 10_000), notes: list('notes', validateNote, 10_000), papers: list('papers', validatePaper, 10_000), documents: list('documents', validateDocument, 5000), semesters: validateSemesters(row.semesters), planDays, focusSessions, preferences };
}
