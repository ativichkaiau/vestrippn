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

  return (
    <Page>
      <PageHeader
        index="07"
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
        {UNIVERSITY_SUMMARIES.map((year) => (
          <div key={year.year} style={{ marginBottom: 'var(--space-6)' }}>
            <p className="sys-label" style={{ marginBottom: 'var(--space-3)' }}>
              {year.year}
            </p>
            <RegistryTable
              caption={`University summaries, ${year.year}`}
              rows={year.modules}
              rowKey={(module) => module.label}
              href={(module) => module.href ?? ''}
              columns={[
                { key: 'module', label: 'module', kind: 'name', render: (module) => module.label },
                { key: 'subjects', label: 'subjects', kind: 'mono', render: (module) => module.subjects.map((subject) => subject.code).join(' · ') },
                {
                  key: 'state',
                  label: 'notes',
                  optional: true,
                  render: (module) => <StatusIndicator state={module.href ? 'available' : 'planned'} label={module.href ? 'published' : 'pending'} />,
                },
              ]}
            />
          </div>
        ))}
      </Section>
    </Page>
  );
}
