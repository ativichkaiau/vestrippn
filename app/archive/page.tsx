import type { Metadata } from 'next';
import { ARCHIVE, ARCHIVE_CATEGORIES, UNIVERSITY_SUMMARIES } from '@/lib/system/archive';
import type { ArchiveRecord } from '@/lib/system/types';
import { CommandLink, Page, PageHeader, RegistryTable, Section, StatusIndicator } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Records of earlier work: olympiads, competitions, academic results, notes and VESTRIPPN builds.',
};

function Record({ record }: { record: ArchiveRecord }) {
  const tag = [record.code, record.year].filter(Boolean).join(' / ');
  return (
    <li id={record.id} className="sys-record">
      <span className="sys-label">ARCHIVE_RECORD{tag ? ` · ${tag}` : ''}</span>
      <h3>{record.title}</h3>
      {record.result && <p className="sys-record-result">{record.result}</p>}
      <p className="sys-record-facts">
        <span>type {record.type}</span>
        {record.field && <span>field {record.field}</span>}
      </p>
      {record.details && (
        <ul className="sys-record-details">
          {record.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
      {record.links && (
        <p className="sys-inline-links">
          {record.links.map((link) => (
            <CommandLink key={link.url} href={link.url}>
              {link.label}
            </CommandLink>
          ))}
        </p>
      )}
    </li>
  );
}

export default function ArchivePage() {
  const categories = ARCHIVE_CATEGORIES.map((category) => ({
    ...category,
    records: ARCHIVE.filter((record) => record.category === category.id),
  })).filter((category) => category.records.length > 0);
  // One table for every year, so the columns line up; the year opens each group.
  const summaries = UNIVERSITY_SUMMARIES.flatMap((year) =>
    year.modules.map((module, i) => ({ ...module, year: year.year, first: i === 0 })),
  );

  return (
    <Page>
      <PageHeader
        index="08"
        label="archive"
        title="Archive"
        lede="Earlier work, kept as records rather than displayed as achievements."
        meta={[
          { key: 'records', value: String(ARCHIVE.length).padStart(3, '0') },
          ...categories.map((category) => ({ key: category.label, value: String(category.records.length).padStart(2, '0') })),
        ]}
      />

      {categories.map((category) => (
        <Section key={category.id} id={category.id} title={category.label} count={String(category.records.length).padStart(2, '0')}>
          <ol className="sys-records">
            {category.records.map((record) => (
              <Record key={record.id} record={record} />
            ))}
          </ol>
        </Section>
      ))}

      <Section id="university" title="university summaries" intro="Medical school summaries by year and module. Year 3 folders are not published yet.">
        <RegistryTable
          caption="University summaries by year and module"
          rows={summaries}
          rowKey={(row) => `${row.year}/${row.label}`}
          href={(row) => row.href ?? ''}
          columns={[
            { key: 'year', label: 'year', kind: 'id', render: (row) => (row.first ? row.year : '') },
            { key: 'module', label: 'module', kind: 'name', render: (row) => row.label },
            { key: 'subjects', label: 'subjects', kind: 'mono', render: (row) => row.subjects.map((subject) => subject.code).join(' · ') },
            {
              key: 'state',
              label: 'notes',
              optional: true,
              render: (row) => <StatusIndicator state={row.href ? 'available' : 'planned'} label={row.href ? 'published' : 'pending'} />,
            },
          ]}
        />
      </Section>
    </Page>
  );
}
