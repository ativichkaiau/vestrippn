import type { Metadata } from 'next';
import { RUNTIME, SYSTEMS, systemIndex } from '@/lib/system/registry';
import { Page, PageHeader, RegistryTable, Section, StatusIndicator } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Systems',
  description: 'Service discovery for everything mounted under VESTRIPPN.',
};

export default function SystemsPage() {
  const active = SYSTEMS.filter((node) => node.state === 'active').length;
  return (
    <Page>
      <PageHeader
        index="02"
        label="systems"
        title="Systems"
        lede="Service discovery for everything mounted under VESTRIPPN. Select a system to inspect it."
        meta={[
          { key: 'entries', value: String(SYSTEMS.length).padStart(2, '0') },
          { key: 'active', value: String(active).padStart(2, '0') },
          { key: 'runtime modules', value: String(RUNTIME.length).padStart(2, '0') },
        ]}
      />

      <Section id="registry" title="registry" count={`${SYSTEMS.length} systems`}>
        <RegistryTable
          caption="Systems registry"
          rows={SYSTEMS}
          rowKey={(node) => node.slug}
          href={(node) => `/systems/${node.slug}`}
          columns={[
            { key: 'id', label: 'id', kind: 'id', render: (node) => systemIndex(node) },
            { key: 'name', label: 'system', kind: 'name', render: (node) => <>{node.name}<small>{node.summary}</small></> },
            { key: 'type', label: 'type', kind: 'mono', optional: true, render: (node) => node.type },
            { key: 'state', label: 'state', render: (node) => <StatusIndicator state={node.state} /> },
          ]}
        />
      </Section>

      <Section id="runtime" title="runtime" count={`${RUNTIME.length} modules`} intro="Modules mounted inside this environment — the study and personal tools that run on VESTRIPPN itself.">
        <RegistryTable
          caption="Runtime modules"
          rows={RUNTIME}
          rowKey={(module) => module.slug}
          href={(module) => module.href}
          columns={[
            { key: 'name', label: 'module', kind: 'name', render: (module) => <>{module.name}<small>{module.summary}</small></> },
            { key: 'branch', label: 'branch', kind: 'mono', optional: true, render: (module) => module.branch },
            { key: 'path', label: 'path', kind: 'mono', render: (module) => module.path },
          ]}
        />
      </Section>
    </Page>
  );
}
