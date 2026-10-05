'use client';

import Link from 'next/link';
import { Section } from '@/components/system/primitives';
import { useReviewQueue } from '@/components/learn/useReviewQueue';
import { useStudyOverview } from '@/components/learn/useStudyOverview';
import { DRUGS } from '@/lib/drugs';

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export default function StudyHub() {
  const { overview, signedIn, error } = useStudyOverview();
  const review = useReviewQueue();

  return (
    <>
      <Section id="countdowns" title="exam countdowns" intro="Objectives left (untouched, then reviewed) spread evenly over the days before each exam; the last two days are for a weak-spot drill. Mark objectives in the coverage map to move it on.">
        {!signedIn ? (
          <p className="sys-muted">Sign in to see your exams.</p>
        ) : !overview ? (
          <p className="sys-muted">{error ?? 'loading…'}</p>
        ) : overview.countdowns.length === 0 ? (
          <p className="sys-muted">No exams in the next 90 days. Add exam dates under Workspace → courses.</p>
        ) : (
          <table className="sys-drill-table sys-study-table">
            <thead>
              <tr>
                <th scope="col">course</th>
                <th scope="col">exam</th>
                <th scope="col">days</th>
                <th scope="col">left</th>
                <th scope="col">today</th>
              </tr>
            </thead>
            <tbody>
              {overview.countdowns.map((item) => (
                <tr key={item.courseId}>
                  <td>
                    <b>{item.courseCode}</b> <span className="sys-muted">{item.courseName}</span>
                  </td>
                  <td>
                    {item.examTitle} · {day(item.examAt)}
                  </td>
                  <td>{item.plan.daysLeft}</td>
                  <td>{item.plan.remaining}</td>
                  <td>
                    {item.plan.phase === 'cover' ? (
                      <Link href="/workspace?tab=coverage">cover {item.plan.today.length}</Link>
                    ) : item.plan.phase === 'drill' ? (
                      <Link href={`/study/drill?course=${encodeURIComponent(item.courseId)}`}>drill</Link>
                    ) : (
                      'all tested'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section id="review" title="case review" count={review ? String(review.due.length).padStart(2, '0') : undefined} intro="A case where the patient died, or where you made a deadly choice, comes back after 1, 3, 7 and 14 days. A clean run moves it on; a miss starts again.">
        {!signedIn ? (
          <p className="sys-muted">Sign in to keep a review queue.</p>
        ) : !review ? (
          <p className="sys-muted">loading…</p>
        ) : review.due.length + review.upcoming.length === 0 ? (
          <p className="sys-muted">Nothing queued. Missed cases appear here after you finish them.</p>
        ) : (
          <ul className="sys-review-list">
            {[...review.due, ...review.upcoming].map((item) => {
              const due = review.due.includes(item);
              return (
                <li key={item.caseId}>
                  <Link className="sys-drill-case" href={`/learn/cases?case=${encodeURIComponent(item.caseId)}&review=1`}>
                    <b>{item.title}</b>
                    <small>
                      {due ? 'due now' : `due ${day(item.dueAt!)}`} · review {item.step + 1} of {review.intervals.length} · missed {item.misses}×
                    </small>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section id="tools" title="tools">
        <ul className="sys-review-list">
          <li>
            <Link className="sys-drill-case" href="/study/drill">
              <b>Weak-spot drill</b>
              <small>your ten weakest objectives in one course, self-graded and saved</small>
            </Link>
          </li>
          <li>
            <Link className="sys-drill-case" href="/drugs">
              <b>Drug cards</b>
              <small>{DRUGS.length} drugs: class, mechanism, dose, pitfalls, structure</small>
            </Link>
          </li>
          <li>
            <Link className="sys-drill-case" href="/study/editor">
              <b>Case editor</b>
              <small>write and edit branching cases as a decision tree (owner)</small>
            </Link>
          </li>
          <li>
            <Link className="sys-drill-case" href="/learn/cases">
              <b>Case bank</b>
              <small>play cases; misses join the review queue</small>
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
}
