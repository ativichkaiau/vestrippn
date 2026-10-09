'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import Structure from '@/components/system/Structure';
import { drugStructure, filterDrugs } from '@/lib/drugs';

/* The drug cards as a filterable grid of structure thumbnails. */
export default function DrugIndex() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => filterDrugs(query), [query]);
  const countId = useId();
  return (
    <section className="sys-drug-index" aria-label="Drug cards">
      <div className="sys-drug-filter">
        <input
          type="search"
          className="sys-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="filter by name, class or mechanism…"
          aria-label="Filter drug cards"
          aria-describedby={countId}
        />
        <span id={countId} className="sys-muted" aria-live="polite">
          {results.length} card{results.length === 1 ? '' : 's'}
        </span>
      </div>
      <ul className="sys-drug-grid">
        {results.map((drug) => {
          const structure = drugStructure(drug.slug);
          return (
            <li key={drug.slug}>
              <Link href={`/drugs/${drug.slug}`} className="sys-drug-tile">
                <span className="sys-drug-thumb">{structure ? <Structure data={structure} /> : <span className="sys-muted">no structure</span>}</span>
                <b>{drug.name}</b>
                <small>{drug.class}</small>
              </Link>
            </li>
          );
        })}
      </ul>
      {results.length === 0 && <p className="sys-muted">No card matches “{query.trim()}”.</p>}
    </section>
  );
}
