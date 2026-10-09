import type { Metadata } from 'next';
import { ARCHIVE, ARCHIVE_CATEGORIES } from '@/lib/system/archive';
import { IDENTITY } from '@/lib/system/identity';
import { CommandLink, MetadataGrid, Page, PageHeader, RegistryTable, Section } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Identity',
  description: 'Kaiau — medical student, researcher and developer at Chiang Mai University.',
};

export default function IdentityPage() {
  const recordCounts = ARCHIVE_CATEGORIES.map((category) => ({
    ...category,
    count: ARCHIVE.filter((record) => record.category === category.id).length,
  })).filter((category) => category.count > 0);

  return (
    <Page>
      <PageHeader
        index="01"
        label="identity · whoami"
        title={
          <>
            {IDENTITY.handle}
            <span className="sys-title-sub">{IDENTITY.fullName}</span>
          </>
        }
        lede={`${IDENTITY.roles.join(', ').replace(/^./, (c) => c.toUpperCase())} — ${IDENTITY.location.replace(' / ', ', ')}.`}
        meta={[
          { key: 'program', value: `${IDENTITY.program} · year ${IDENTITY.year}` },
          { key: 'institution', value: IDENTITY.institutionShort },
          { key: 'location', value: IDENTITY.location },
        ]}
      />

      <div className="sys-columns sys-section" data-ratio="wide-left">
        <Section id="narrative" title="narrative">
          <div className="sys-prose">
            {IDENTITY.narrative.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section id="identity" title="identity">
          <MetadataGrid
            rows={[
              { key: 'name', value: IDENTITY.handle },
              { key: 'full name', value: IDENTITY.fullName },
              { key: 'role', value: IDENTITY.roles.join(' · ') },
              { key: 'program', value: `${IDENTITY.program}, year ${IDENTITY.year}` },
              { key: 'institution', value: IDENTITY.institution },
              { key: 'faculty', value: IDENTITY.faculty },
              { key: 'location', value: IDENTITY.location },
              { key: 'focus', value: IDENTITY.focus.join(' / '), mono: true },
            ]}
          />
        </Section>
      </div>

      <Section id="interests" title="interests" count={String(IDENTITY.interests.length).padStart(2, '0')}>
        <ul className="sys-list">
          {IDENTITY.interests.map((interest, i) => (
            <li key={interest}>
              <span className="sys-list-name">
                {String(i + 1).padStart(2, '0')} &nbsp;{interest}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="positions" title="positions">
        <RegistryTable
          caption="Positions held"
          rows={[...IDENTITY.positions]}
          rowKey={(row) => row.role}
          columns={[
            { key: 'role', label: 'role', kind: 'name', render: (row) => row.role },
            { key: 'org', label: 'organisation', kind: 'mono', render: (row) => row.org },
            { key: 'state', label: 'state', kind: 'mono', render: (row) => row.state },
          ]}
        />
      </Section>

      <Section id="stack" title="stack">
        <MetadataGrid rows={IDENTITY.stack.map((group) => ({ key: group.area, value: group.items.join(' · ') }))} />
      </Section>

      <Section id="records" title="records" intro="Olympiads, competitions and test results are kept in the archive as records, not displayed here as achievements.">
        <MetadataGrid rows={recordCounts.map((category) => ({ key: category.label, value: `${String(category.count).padStart(2, '0')} records`, mono: true }))} />
        <p style={{ marginTop: 'var(--space-4)' }}>
          <CommandLink href="/archive">open archive</CommandLink>
        </p>
      </Section>

      <Section id="archetypes" title="archetypes" intro="Reference points. Career figures as recorded when this list was written.">
        <RegistryTable
          caption="Drivers kept as reference points"
          rows={[...IDENTITY.archetypes]}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: 'driver', kind: 'name', render: (row) => <>{row.name}<small>{row.note}</small></> },
            { key: 'titles', label: 'titles', kind: 'mono', render: (row) => row.titles },
            { key: 'wins', label: 'wins', kind: 'mono', optional: true, render: (row) => row.wins },
            { key: 'poles', label: 'poles', kind: 'mono', optional: true, render: (row) => row.poles },
            { key: 'podiums', label: 'podiums', kind: 'mono', optional: true, render: (row) => row.podiums },
          ]}
        />
      </Section>

      <Section id="network" title="network">
        <RegistryTable
          caption="Network"
          rows={[...IDENTITY.network]}
          rowKey={(row) => row.id}
          href={(row) => row.url}
          columns={[
            { key: 'channel', label: 'channel', kind: 'name', render: (row) => row.label },
            { key: 'handle', label: 'handle', kind: 'mono', render: (row) => row.handle },
          ]}
        />
      </Section>
    </Page>
  );
}
