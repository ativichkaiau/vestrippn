// Refresh the checked-in topic catalog from a local WilliamsHub checkout.
// Runtime reads only the generated catalog; it never needs the other checkout.
import { createJiti } from 'jiti';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-coverage-catalog.mjs /path/to/WilliamsHub');
const root = resolve(source);
const jiti = createJiti(import.meta.url);
const { curriculum, lecturesBySubject } = await jiti.import(resolve(root, 'content/index.ts'));
const seen = new Set();
const subjects = curriculum.flatMap(year => year.subjects.map(subject => ({
  code: subject.code,
  name: subject.name,
  year: year.label,
  topics: (lecturesBySubject[subject.code] || []).map(lecture => {
    if (seen.has(lecture.id)) throw new Error(`Duplicate topic: ${lecture.id}`);
    seen.add(lecture.id);
    if (!/^[a-z0-9-]+$/.test(lecture.id) || !lecture.title || !lecture.source) throw new Error('Invalid source topic.');
    return {
      id: lecture.id,
      title: lecture.title,
      section: lecture.source,
      objective: `Explain and apply the core concepts of ${lecture.title}.`,
      prompts: [
        ...(lecture.mechanism?.title ? [`Explain the mechanism: ${lecture.mechanism.title}.`] : []),
        ...(lecture.examFindings?.length || lecture.investigations?.length ? ['Interpret the key findings and investigations in this topic.'] : []),
        ...(lecture.treatment?.length ? ['Explain the management choices and their rationale.'] : []),
      ],
      questionCount: lecture.quiz?.length || 0,
    };
  }).sort((a, b) => a.section.localeCompare(b.section, 'en', { numeric: true }) || a.title.localeCompare(b.title)),
}))).filter(subject => subject.topics.length);
const catalog = {
  source: 'WilliamsHub',
  sourceUrl: 'https://williamshub.vercel.app',
  sourceRevision: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  importedAt: new Date().toISOString(),
  basis: 'Study objectives adapted from WilliamsHub topic titles and section structure; not an official exam blueprint.',
  subjects,
};
const destination = fileURLToPath(new URL('../content/coverage/williamshub.json', import.meta.url));
mkdirSync(resolve(destination, '..'), { recursive: true });
writeFileSync(destination, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Imported ${seen.size} topics across ${subjects.length} subjects.`);
for (const subject of subjects.filter(s => ['HHL', 'HSC'].includes(s.code))) console.log(`${subject.code}: ${subject.topics.length} topics`);
