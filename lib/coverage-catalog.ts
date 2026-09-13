import catalog from '../content/coverage/williamshub.json';
import type { CoverageObjective, CoverageRecord } from './coverage-types';

const legacyCanvasSubjects: Record<string, string> = {
  '26141': 'HEN-2', '26393': 'HNS-2', '26702': 'HMS-2', '27415': 'HCVS-2',
  '30964': 'HRS-2', '31275': 'HGB-2', '26896': 'HHL', '31469': 'HSC',
};
const byCode = new Map(catalog.subjects.map(subject => [subject.code, subject]));
const topicsById = new Map(catalog.subjects.flatMap(subject => subject.topics.map(topic => [topic.id, topic] as const)));

export const coverageSource = {
  name: catalog.source, url: catalog.sourceUrl, revision: catalog.sourceRevision,
  importedAt: catalog.importedAt, basis: catalog.basis,
};

export function coverageSubject(course: { code: string; canvasCourseId: string | null }) {
  const normalized = course.code.trim().toUpperCase().replace(/\s+/g, '').replace(/[–—]/g, '-');
  return byCode.get(normalized) ?? byCode.get(legacyCanvasSubjects[course.canvasCourseId ?? '']);
}

export function coverageObjectives(course: { code: string; canvasCourseId: string | null }, saved: CoverageRecord[]): CoverageObjective[] {
  const rows = new Map<string, CoverageObjective>();
  for (const topic of coverageSubject(course)?.topics ?? []) {
    rows.set(`hub:${topic.id}`, {
      key: `hub:${topic.id}`, title: topic.title, section: topic.section, sourceTopicId: topic.id,
      objective: topic.objective, prompts: topic.prompts,
      lessonUrl: `${catalog.sourceUrl}/lecture/${topic.id}`,
      practiceUrl: `${catalog.sourceUrl}/practice/${topic.id}`,
      status: 'untouched', notes: '', noteUrl: null, results: [], revision: 0, updatedAt: null,
    });
  }
  for (const record of saved) {
    const existing = rows.get(record.key);
    const topic = record.sourceTopicId ? topicsById.get(record.sourceTopicId) : undefined;
    rows.set(record.key, {
      ...record,
      // Keep saved evidence even if a course code or the source catalog changes.
      title: existing?.title ?? record.title,
      section: existing?.section ?? record.section,
      objective: topic?.objective ?? record.title,
      prompts: topic?.prompts ?? [],
      lessonUrl: record.sourceTopicId ? `${catalog.sourceUrl}/lecture/${record.sourceTopicId}` : null,
      practiceUrl: record.sourceTopicId ? `${catalog.sourceUrl}/practice/${record.sourceTopicId}` : null,
    });
  }
  return [...rows.values()].sort((a, b) => a.section.localeCompare(b.section, 'en', { numeric: true }) || a.title.localeCompare(b.title));
}
