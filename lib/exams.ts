// Single source of truth for the exam schedule. Imported by the Academics hub
// (countdowns) and the notification reminders so a date is never duplicated.
// Times are 08:00 Bangkok (Buddhist year 2569 = 2026).

export const HCVS_EXAM_TARGET = new Date('2026-08-04T08:00:00+07:00');
export const HGB_EXAM_TARGET = new Date('2026-08-07T08:00:00+07:00');
export const HRS_EXAM_TARGET = new Date('2026-08-11T08:00:00+07:00');

export type UpcomingExam = { name: string; fullName: string; date: Date };

export const UPCOMING_EXAMS: UpcomingExam[] = [
  { name: 'HCVS-2', fullName: 'Human Cardiovascular System', date: HCVS_EXAM_TARGET },
  { name: 'HGB-2', fullName: 'Human Gastrointestinal & Biliary Tract System', date: HGB_EXAM_TARGET },
  { name: 'HRS-2', fullName: 'Human Respiratory System', date: HRS_EXAM_TARGET },
];

// Whole days until the exam (ceil, so "1" means it's within the last 24h).
export function daysUntil(date: Date, now: number = Date.now()): number {
  return Math.ceil((date.getTime() - now) / 86_400_000);
}

export function countdownLabel(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

// T-minus buckets that fire a native reminder (largest → most urgent).
export const REMINDER_BUCKETS = [14, 7, 3, 1, 0] as const;
