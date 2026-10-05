'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { filterDrugs } from '@/lib/drugs';
import { useStudyOverview } from '../learn/useStudyOverview';
import Icon from './Icon';

/* ════════════════════════════════════════════════════════════════════════
   The Study side view: what to study now. Exam countdowns (today's share
   or the final drill), cases due for review, Anki due, a weak-spot drill,
   and a quick drug card lookup.
   ════════════════════════════════════════════════════════════════════════ */

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function StudyView() {
  const { overview, signedIn, error } = useStudyOverview();
  const [query, setQuery] = useState('');
  const drugs = useMemo(() => (query.trim() ? filterDrugs(query).slice(0, 6) : []), [query]);
  const drugInput = useId();

  return (
    <div className="sys-study-view">
      <section aria-labelledby="study-now">
        <h3 id="study-now" className="sys-study-head">
          now
        </h3>
        {!signedIn ? (
          <p className="sys-muted sys-view-empty">Sign in to see your exam countdowns and review queue.</p>
        ) : !overview ? (
          <p className="sys-muted sys-view-empty">{error ?? 'loading…'}</p>
        ) : (
          <ul className="sys-study-list">
            {overview.countdowns.map((item) => (
              <li key={item.courseId}>
                <Link href={item.plan.phase === 'drill' ? `/study/drill?course=${encodeURIComponent(item.courseId)}` : '/workspace?tab=coverage'}>
                  <b>
                    {item.courseCode} · {item.plan.daysLeft}d
                  </b>
                  <small>
                    {item.plan.phase === 'cover'
                      ? `cover ${item.plan.today.length} today · ${item.plan.remaining} left`
                      : item.plan.phase === 'drill'
                        ? 'final days: weak-spot drill'
                        : 'all objectives tested'}{' '}
                    · {item.examTitle} {dateLabel(item.examAt)}
                  </small>
                </Link>
              </li>
            ))}
            {overview.countdowns.length === 0 && (
              <li>
                <p className="sys-muted">No exams in the next 90 days.</p>
              </li>
            )}
            <li>
              <Link href="/learn/cases">
                <b>
                  cases due · {overview.review.due}
                </b>
                <small>{overview.review.next ? `next review ${dateLabel(overview.review.next)}` : 'missed cases come back after 1, 3, 7, 14 days'}</small>
              </Link>
            </li>
            {overview.anki && (
              <li>
                <Link href="/academics">
                  <b>Anki due · {overview.anki.due}</b>
                  <small>last sync {dateLabel(overview.anki.lastSync)}</small>
                </Link>
              </li>
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="study-tools">
        <h3 id="study-tools" className="sys-study-head">
          tools
        </h3>
        <ul className="sys-study-list">
          <li>
            <Link href="/study/drill">
              <b>
                <Icon name="study" size={14} /> weak-spot drill
              </b>
              <small>your 10 weakest objectives, self-graded</small>
            </Link>
          </li>
          <li>
            <Link href="/study">
              <b>
                <Icon name="outline" size={14} /> study hub
              </b>
              <small>countdowns, reviews and the case editor</small>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="study-drugs">
        <h3 id="study-drugs" className="sys-study-head">
          drug cards
        </h3>
        <label htmlFor={drugInput} className="sys-visually-hidden">
          Find a drug card
        </label>
        <input
          id={drugInput}
          type="search"
          className="sys-input sys-study-input"
          placeholder="find a drug…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {drugs.length > 0 && (
          <ul className="sys-study-list">
            {drugs.map((drug) => (
              <li key={drug.slug}>
                <Link href={`/drugs/${drug.slug}`}>
                  <b>
                    <Icon name="pill" size={14} /> {drug.name}
                  </b>
                  <small>{drug.class}</small>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && drugs.length === 0 && <p className="sys-muted sys-view-empty">No card for “{query.trim()}”.</p>}
        {!query.trim() && (
          <p className="sys-view-empty">
            <Link href="/drugs" className="sys-study-more">
              all drug cards →
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
