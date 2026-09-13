import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { coverageObjectives, coverageSubject } = await jiti.import('../lib/coverage-catalog.ts');
const { coverageCounts, resultPercent } = await jiti.import('../lib/coverage-types.ts');
const { coverageResult, coverageResults, coverageUrl, validateCoverageRecord } = await jiti.import('../lib/coverage-validation.ts');
const { validateBackup, BACKUP_FORMAT, BACKUP_VERSION } = await jiti.import('../lib/backup.ts');

const hhl = { code: 'HHL', canvasCourseId: '26896' };
const hsc = { code: 'HSC', canvasCourseId: '31469' };
const topics = coverageObjectives(hhl, []);
assert(topics.length >= 60 && coverageObjectives(hsc, []).length >= 60, 'Both requested courses have a substantive catalog');
assert.equal(new Set(topics.map(topic => topic.key)).size, topics.length);
assert.equal(coverageSubject({ code: 'hsc', canvasCourseId: null }).code, 'HSC');
assert.equal(coverageSubject({ code: 'HCVS–2', canvasCourseId: null }).code, 'HCVS-2');
assert.equal(coverageSubject({ code: 'Renamed course', canvasCourseId: '26896' }).code, 'HHL');
assert.equal(coverageObjectives({ code: 'TBL', canvasCourseId: null }, []).length, 0, 'No invented objectives for unmatched courses');

const attempt = { id: 'practice-1', label: 'WilliamsHub practice', correct: 0, total: 10, recordedAt: '2026-09-13T03:00:00.000Z', url: 'https://williamshub.vercel.app/practice/hhl-anemia-classification' };
assert.equal(resultPercent(coverageResult(attempt)), 0, 'A genuine zero score is preserved');
for (const invalid of [{ ...attempt, correct: 11 }, { ...attempt, total: 0 }, { ...attempt, correct: 1.5 }, { ...attempt, recordedAt: 'yesterday' }]) assert.throws(() => coverageResult(invalid));
for (const url of ['javascript:alert(1)', 'data:text/html,x', 'https://user:secret@example.com']) assert.throws(() => coverageUrl(url));
assert.equal(coverageUrl(''), null);
assert.throws(() => coverageResults([attempt, attempt]), /Duplicate/);

const saved = validateCoverageRecord({ ...topics[0], status: 'tested', results: [attempt], notes: 'Needs another pass', noteUrl: 'https://example.com/my-notes', revision: 2, updatedAt: attempt.recordedAt });
const withProgress = coverageObjectives(hhl, [saved]);
assert.equal(withProgress.length, topics.length, 'Saved evidence overlays its existing topic');
assert.equal(withProgress.find(topic => topic.key === saved.key).notes, 'Needs another pass');
assert.deepEqual(coverageCounts(withProgress), { total: topics.length, untouched: topics.length - 1, reviewed: 0, tested: 1 });
assert.equal(coverageCounts(coverageObjectives(hhl, [])).tested, 0, 'A separate course or account starts untouched');
assert.equal(coverageObjectives({ code: 'TBL', canvasCourseId: null }, [saved])[0].results[0].correct, 0, 'A code change retains saved evidence');
const custom = { ...saved, key: 'custom:own-objective', sourceTopicId: null, title: 'Compare mechanisms', section: 'My objectives' };
assert.equal(coverageObjectives(hhl, [custom]).length, topics.length + 1);
assert.throws(() => validateCoverageRecord({ ...saved, sourceTopicId: 'different-topic' }));

const course = { id: 'course1', ...hhl, name: 'HHL', canvasUrl: null, notebookUrl: null, sortOrder: 0, exams: [], coverage: [saved, custom] };
const backup = { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: attempt.recordedAt, tasks: [], milestones: [], notes: [], papers: [], documents: [], semesters: [{ id: 'semester1', name: 'Semester', startsAt: null, endsAt: null, archivedAt: null, courses: [course] }], planDays: [], focusSessions: [], preferences: {} };
const restored = validateBackup(JSON.parse(JSON.stringify(backup)));
assert.deepEqual(restored.semesters[0].courses[0].coverage, [saved, custom], 'Backup round trip retains statuses, notes, links, and all scores');
const legacy = JSON.parse(JSON.stringify(backup));
legacy.version = 1;
delete legacy.semesters[0].courses[0].coverage;
assert.deepEqual(validateBackup(legacy).semesters[0].courses[0].coverage, [], 'Existing backups remain restorable');
assert.throws(() => validateBackup({ ...backup, version: 999 }));
console.log(`Coverage checks passed: HHL ${topics.length}, HSC ${coverageObjectives(hsc, []).length}; status counts, source mapping, evidence validation, and backup compatibility.`);
