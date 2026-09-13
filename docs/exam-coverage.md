# Exam coverage

Open `/workspace?tab=coverage`. Course links can select a specific course with
`&course=<course-id>`. The map uses the account's existing semesters, course
codes, Canvas IDs, and exam dates. Archived semesters retain their evidence and
are read-only until restored.

## Catalog provenance

`content/coverage/williamshub.json` is a snapshot of WilliamsHub's curriculum and
topic metadata. It includes the source revision, import date, and original topic
IDs. Learning objectives and study prompts are adapted from topic titles and
section structure; they are not official MedCMU objectives or an exam blueprint.
The generated catalog contains no personal progress, quiz answers, or clinical
treatment content. Lessons and practice link to the original source routes.

Refresh it explicitly with:

```sh
node scripts/import-coverage-catalog.mjs /path/to/WilliamsHub
```

The deployed application never depends on that checkout or a live scrape.
Course codes match the source catalog (case-insensitively); existing Canvas
course IDs provide a fallback for renamed courses. Unmatched courses can use
custom learning objectives. Saved records survive a subsequent code change.

## Progress and evidence

Source topics default to untouched. Only changed topics and custom objectives
are stored, scoped to both the account and the course. Repeating a course in a
different semester starts with separate progress. Status updates are explicit:
opening a link does not count as studying. Recording a scored attempt marks the
objective tested, including a score of zero; tested does not imply mastery.

Notes, an optional note URL, and up to 100 practice results can be attached to
each objective. Results are recorded by the user; WilliamsHub browser data is
not automatically transferred between the two sites. Focus sessions can be
launched with the course and objective attached.

Writes require authentication and check ownership, active semester status, and
the current revision. Conflicting edits return 409, preserving an open note
draft while the client retrieves the latest saved state. Practice request IDs
make retries idempotent. User-supplied links must use HTTPS without credentials.

Backup format 2 includes the saved objectives and evidence inside each course.
Format 1 remains accepted. Restore merges practice results and keeps newer
saved notes/status when a backup is older. The additive database migration is
`20260913100000_exam_coverage`; deployment applies it through the existing build.

Run `npm run validate:coverage` for catalog, validation, counts, and backup checks.
