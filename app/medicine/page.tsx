import type { Metadata } from 'next';
import Link from 'next/link';
import { UNIVERSITY_SUMMARIES } from '@/lib/system/archive';
import { IDENTITY } from '@/lib/system/identity';
import { getNode, RUNTIME } from '@/lib/system/registry';
import { CommandLink, MetadataGrid, Page, PageHeader, RegistryTable, Section, StatusIndicator } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Medicine',
  description: 'The medicine branch of VESTRIPPN: medical school and the systems built around it.',
};

type Artifact = { label: string; href: string };

/** Workstreams → the registry entries and runtime modules that serve them. */
const WORKSTREAMS: { name: string; covers: string; artifacts: Artifact[] }[] = [
  {
    name: 'study systems',
    covers: 'planning, revision and exam preparation',
    artifacts: [
      { label: 'Studyex_Medeetomihub', href: '/systems/studyex_medeetomihub' },
      { label: 'workspace', href: '/workspace?tab=plan' },
      { label: 'WilliamsPod', href: '/systems/williamspod' },
    ],
  },
  {
    name: 'medical visualisation',
    covers: 'pathways and systems drawn as explorable apps',
    artifacts: [
      { label: 'PhysioHub', href: '/projects/physiohub' },
      { label: 'neuro_pathway', href: '/projects/neuro_pathway' },
      { label: 'biochem_pathway', href: '/projects/biochem_pathway' },
      { label: 'microbiology_pokedex', href: '/projects/microbiology_pokedex' },
      { label: 'immunopath', href: '/projects/immunopath' },
    ],
  },
  {
    name: 'simulation',
    covers: 'clinical reasoning as branching cases',
    artifacts: [
      { label: 'cases', href: '/learn/cases' },
    ],
  },
  {
    name: 'research',
    covers: 'systematic reviews and evidence synthesis',
    artifacts: [
      { label: '~/research', href: '/research' },
    ],
  },
  {
    name: 'learning infrastructure',
    covers: 'notes, spaced repetition and study telemetry',
    artifacts: [
      { label: 'OnePager', href: '/projects/onepager' },
      { label: 'anki_sync', href: '/projects/anki_sync' },
      { label: 'analytics', href: '/analytics' },
    ],
  },
];

export default function MedicinePage() {
  const runtime = RUNTIME.filter((module) => module.branch === 'medicine');
  const studyex = getNode('studyex_medeetomihub');

  return (
    <Page>
      <PageHeader
        index="04"
        label="medicine"
        title="Medicine"
        lede="One branch of the system: medical school, and the software built to carry it."
        meta={[
          { key: 'workstreams', value: String(WORKSTREAMS.length).padStart(2, '0') },
          { key: 'runtime modules', value: String(runtime.length).padStart(2, '0') },
        ]}
      />

      <div className="sys-columns sys-section" data-ratio="wide-left">
        <Section id="current" title="current">
          <MetadataGrid
            rows={[
              { key: 'year', value: IDENTITY.year, mono: true },
              { key: 'program', value: IDENTITY.program, mono: true },
              { key: 'institution', value: `${IDENTITY.institutionShort} · ${IDENTITY.institution}` },
              { key: 'faculty', value: IDENTITY.faculty },
              { key: 'state', value: <StatusIndicator state="active" /> },
            ]}
          />
        </Section>
        <Section id="why" title="why software">
          <div className="sys-prose">
            <p>
              Medicine is the main workload. The software around it exists to make that workload tractable: plans, revision, case practice and evidence review run as systems instead of as folders of files.
            </p>
            <p>
              {studyex ? (
                <>
                  The study side lives in <Link href={`/systems/${studyex.slug}`}>{studyex.name}</Link>; the evidence side in <Link href="/research">~/research</Link>.
                </>
              ) : null}
            </p>
          </div>
        </Section>
      </div>

      <Section id="workstreams" title="workstreams" count={String(WORKSTREAMS.length).padStart(2, '0')}>
        <RegistryTable
          caption="Medicine workstreams"
          rows={WORKSTREAMS}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: 'workstream', kind: 'name', render: (row) => <>{row.name}<small>{row.covers}</small></> },
            {
              key: 'artifacts',
              label: 'artifacts',
              render: (row) => (
                <span className="sys-inline-links">
                  {row.artifacts.map((artifact) => (
                    <Link key={artifact.href} href={artifact.href}>
                      {artifact.label}
                    </Link>
                  ))}
                </span>
              ),
            },
          ]}
        />
      </Section>

      <Section id="runtime" title="runtime" intro="Modules in this environment that run the medicine branch day to day.">
        <RegistryTable
          caption="Medicine runtime modules"
          rows={runtime}
          rowKey={(module) => module.slug}
          href={(module) => module.href}
          columns={[
            { key: 'name', label: 'module', kind: 'name', render: (module) => <>{module.name}<small>{module.summary}</small></> },
            { key: 'path', label: 'path', kind: 'mono', optional: true, render: (module) => module.path },
          ]}
        />
      </Section>

      <Section id="curriculum" title="curriculum" intro="Summaries by year. Notes are published per module as Drive folders.">
        <RegistryTable
          caption="Curriculum summaries by year"
          rows={UNIVERSITY_SUMMARIES}
          rowKey={(year) => year.year}
          columns={[
            { key: 'year', label: 'year', kind: 'id', render: (year) => year.year },
            { key: 'modules', label: 'modules', kind: 'mono', render: (year) => String(year.modules.length).padStart(2, '0') },
            { key: 'subjects', label: 'subjects', kind: 'mono', render: (year) => String(year.modules.reduce((n, m) => n + m.subjects.length, 0)).padStart(2, '0') },
            {
              key: 'notes',
              label: 'notes',
              render: (year) => {
                const published = year.modules.filter((m) => m.href).length;
                return <StatusIndicator state={published ? 'available' : 'planned'} label={published ? `${published} published` : 'pending'} />;
              },
            },
          ]}
        />
        <p style={{ marginTop: 'var(--space-4)' }}>
          <CommandLink href="/archive#university">open summaries</CommandLink>
        </p>
      </Section>
    </Page>
  );
}
