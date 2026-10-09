import { getNode } from '@/lib/system/registry';
import type { Node } from '@/lib/system/types';
import { RegistryTable, Section, StatusIndicator } from './primitives';

/* Study systems linked from the academics runtime: the self-built study apps
   and the Williams companions. Rows open the registry inspector. */
const SLUGS = ['microbiology_pokedex', 'biochem_pathway', 'neuro_pathway', 'physiohub', 'immunopath', 'williamspod', 'studyex_medeetomihub'];

export default function LinkedSystems() {
  const nodes = SLUGS.map(getNode).filter((node): node is Node => Boolean(node));
  return (
    <Section id="linked" title="linked systems" count={String(nodes.length).padStart(2, '0')} intro="Self-built study apps and the Williams companions. Inspect for details; launch from the inspector.">
      <RegistryTable
        caption="Linked study systems"
        rows={nodes}
        rowKey={(node) => node.slug}
        href={(node) => (node.system ? `/systems/${node.slug}` : `/projects/${node.slug}`)}
        columns={[
          { key: 'name', label: 'system', kind: 'name', render: (node) => <>{node.name}<small>{node.summary}</small></> },
          { key: 'type', label: 'type', kind: 'mono', optional: true, render: (node) => node.type },
          { key: 'state', label: 'state', render: (node) => <StatusIndicator state={node.state} /> },
        ]}
      />
    </Section>
  );
}
