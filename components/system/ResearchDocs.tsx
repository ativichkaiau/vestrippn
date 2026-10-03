import { getNode } from '@/lib/system/registry';
import type { Node } from '@/lib/system/types';
import { Pipeline, RegistryTable, Section, StatusIndicator } from './primitives';

/* ~/research, documented as a system: the systems that exist, the review
   pipeline as a structure, and where each stage is served today. */

const SYSTEM_SLUGS = ['research', 'terra', 'williamslab', 'srma_screener'];

const STAGES = [
  {
    name: 'search',
    detail: 'Federated search across PubMed, Europe PMC, Crossref (with Cochrane), Scopus and ScienceDirect in parallel; Google Scholar and ClinicalKey as deep links. Served below.',
  },
  {
    name: 'deduplicate',
    detail: 'Merged by DOI → PMID → title. The richest record wins: Europe PMC › PubMed › Scopus › ScienceDirect › Cochrane › Crossref.',
  },
  { name: 'screen', detail: 'Title, abstract and full-text screening — srma_screener.' },
  { name: 'extract', detail: 'Saved records in the extraction vault below; structured extraction in WilliamsLab.' },
  { name: 'analyse', detail: 'Risk of bias and statistics — the SRMA engine.' },
  { name: 'synthesise', detail: 'PRISMA reporting and the manuscript — the SRMA engine.' },
];

export default function ResearchDocs() {
  const systems = SYSTEM_SLUGS.map(getNode).filter((node): node is Node => Boolean(node));
  return (
    <>
      <Section id="systems" title="systems" count={String(systems.length).padStart(2, '0')}>
        <RegistryTable
          caption="Research systems"
          rows={systems}
          rowKey={(node) => node.slug}
          href={(node) => (node.system ? `/systems/${node.slug}` : `/projects/${node.slug}`)}
          columns={[
            { key: 'name', label: 'system', kind: 'name', render: (node) => <>{node.name}<small>{node.summary}</small></> },
            { key: 'type', label: 'type', kind: 'mono', optional: true, render: (node) => node.type },
            { key: 'state', label: 'state', render: (node) => <StatusIndicator state={node.state} /> },
          ]}
        />
      </Section>

      <Section id="pipeline" title="pipeline" intro="A systematic review, as the stages the infrastructure runs.">
        <Pipeline label="Systematic review pipeline" stages={STAGES} />
      </Section>

      <Section id="tools" title="tools" intro="Mounted here: the literature search, the extraction vault, the Brugada knowledge graph and the case guide." />
    </>
  );
}
