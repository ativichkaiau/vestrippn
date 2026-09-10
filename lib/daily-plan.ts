export type AgendaKind = 'canvas' | 'anki' | 'task' | 'milestone';

export interface AgendaItem {
  id: string;
  sourceId: string;
  kind: AgendaKind;
  title: string;
  context: string;
  dueAt: string | null;
  estimatedMinutes: number;
  priority: number;
  completed: boolean;
  url?: string;
  reason: string;
  rank: number;
}

export interface PlanRecord {
  id: string;
  title: string;
  completed: boolean;
  dueAt: Date | string | null;
  estimatedMinutes: number;
  priority?: number;
  category?: string;
}

export interface PlanDeadline {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  dueAt: string;
  url?: string;
}

export function studyDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function urgency(dueAt: string | null, priority: number, now: Date): { rank: number; reason: string } {
  if (dueAt && Number.isFinite(Date.parse(dueAt))) {
    const due = new Date(dueAt);
    if (due.getTime() < now.getTime()) return { rank: 600, reason: 'Overdue — address first' };
    if (studyDay(due) === studyDay(now)) return { rank: 500, reason: 'Due today' };
    if (due.getTime() - now.getTime() <= 48 * 3_600_000) return { rank: 400, reason: 'Due within 48 hours' };
    if (due.getTime() - now.getTime() <= 7 * 86_400_000) return { rank: 300, reason: 'Due this week' };
  }
  return { rank: priority === 2 ? 250 : priority === 0 ? 100 : 200, reason: priority === 2 ? 'High priority' : priority === 0 ? 'Low priority' : 'Keep making progress' };
}

export function buildAgenda(input: {
  tasks: PlanRecord[];
  milestones: PlanRecord[];
  deadlines: PlanDeadline[];
  ankiDue: number;
  completedItems: string[];
  now: Date;
}): AgendaItem[] {
  const completed = new Set(input.completedItems);
  const records = (items: PlanRecord[], kind: 'task' | 'milestone'): AgendaItem[] => items.map(item => {
    const dueAt = item.dueAt ? new Date(item.dueAt).toISOString() : null;
    const priority = item.priority ?? 1;
    return {
      id: `${kind}:${item.id}`, sourceId: item.id, kind, title: item.title,
      context: kind === 'milestone' ? 'Research milestone' : item.category || 'Personal task',
      dueAt, estimatedMinutes: Math.max(5, Math.min(480, item.estimatedMinutes)),
      priority, completed: item.completed, ...urgency(dueAt, priority, input.now),
    };
  });
  const items = [...records(input.tasks, 'task'), ...records(input.milestones, 'milestone')];
  for (const deadline of input.deadlines) {
    if (!Number.isFinite(Date.parse(deadline.dueAt))) continue;
    const id = `canvas:${deadline.courseId}:${deadline.id}`;
    items.push({
      id, sourceId: deadline.id, kind: 'canvas', title: deadline.name,
      context: deadline.courseName, dueAt: deadline.dueAt, estimatedMinutes: 50,
      priority: 1, completed: completed.has(id), url: safeAgendaUrl(deadline.url),
      ...urgency(deadline.dueAt, 1, input.now),
    });
  }
  if (input.ankiDue > 0) {
    const id = `anki:${studyDay(input.now)}`;
    items.push({
      id, sourceId: id, kind: 'anki', title: `Review ${input.ankiDue} due Anki cards`,
      context: 'Latest Anki snapshot · estimate at 2 cards/min', dueAt: null,
      estimatedMinutes: Math.max(5, Math.min(240, Math.ceil(input.ankiDue / 2))),
      priority: 1, completed: completed.has(id), reason: 'Daily spaced repetition', rank: 350,
    });
  }
  return items.sort((a, b) => Number(a.completed) - Number(b.completed) || b.rank - a.rank ||
    (a.dueAt ? Date.parse(a.dueAt) : Infinity) - (b.dueAt ? Date.parse(b.dueAt) : Infinity) || a.id.localeCompare(b.id));
}

export function safeAgendaUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export interface PlannedSession { itemId: string; minutes: number; sequence: number }

/** Give each selected priority item a useful first block, then deepen the work.
 * Five-minute breaks are optional and are not subtracted from study time. */
export function scheduleAgenda(items: AgendaItem[], selectedIds: string[], availableMinutes: number): PlannedSession[] {
  let remaining = Number.isFinite(availableMinutes) ? Math.max(0, Math.min(720, Math.floor(availableMinutes))) : 0;
  const selected = new Set(selectedIds);
  const work = items.filter(item => !item.completed && selected.has(item.id))
    .map(item => ({ item, remaining: item.estimatedMinutes }));
  const sessions: PlannedSession[] = [];
  while (remaining >= 5 && work.some(entry => entry.remaining >= 5)) {
    for (const entry of work) {
      if (entry.remaining < 5 || remaining < 5) continue;
      let minutes = Math.min(25, entry.remaining, remaining);
      // Avoid leaving a 1–4 minute fragment of an otherwise complete item.
      if (entry.remaining > minutes && entry.remaining - minutes < 5 && entry.remaining <= remaining) minutes = entry.remaining;
      sessions.push({ itemId: entry.item.id, minutes, sequence: sessions.length + 1 });
      entry.remaining -= minutes;
      remaining -= minutes;
    }
  }
  return sessions;
}

export interface StudyPlanResponse {
  day: string;
  availableMinutes: number;
  items: AgendaItem[];
  canvas: { status: string; syncedAt: string | null };
  anki: { due: number; lastSync: string | null; stale: boolean };
}

export type FocusRequest = { title: string; minutes: number; agendaItemId?: string };

export function launchAgendaFocus(item: AgendaItem, minutes: number): void {
  window.dispatchEvent(new CustomEvent<FocusRequest>('vest:focus-open', {
    detail: { title: item.title, minutes: Math.max(5, Math.min(120, minutes)), agendaItemId: item.id },
  }));
}
