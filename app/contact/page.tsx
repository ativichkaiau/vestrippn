import type { Metadata } from 'next';
import { IDENTITY } from '@/lib/system/identity';
import { CommandLink, MetadataGrid, Page, PageHeader, RegistryTable, Section } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Channels for reaching Kaiau.',
};

export default function ContactPage() {
  const github = IDENTITY.network.find((channel) => channel.id === 'github');
  return (
    <Page>
      <PageHeader
        index="08"
        label="contact"
        title="Contact"
        lede="Open channels. GitHub for code; the others for everything else."
        meta={[{ key: 'channels', value: String(IDENTITY.network.length).padStart(2, '0') }]}
      />

      <Section id="channels" title="channels">
        <RegistryTable
          caption="Contact channels"
          rows={[...IDENTITY.network]}
          rowKey={(row) => row.id}
          href={(row) => row.url}
          columns={[
            { key: 'channel', label: 'channel', kind: 'name', render: (row) => row.label },
            { key: 'handle', label: 'handle', kind: 'mono', render: (row) => row.handle },
            { key: 'url', label: 'address', kind: 'mono', optional: true, render: (row) => row.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') },
          ]}
        />
      </Section>

      <div className="sys-columns sys-section">
        <Section id="code" title="code">
          <MetadataGrid
            rows={[
              { key: 'github', value: github ? github.handle : undefined, mono: true },
              { key: 'public repo', value: 'ativichkaiau/vestrippn', mono: true },
            ]}
          />
          <p style={{ marginTop: 'var(--space-4)' }}>
            <CommandLink href="https://github.com/ativichkaiau/vestrippn">view source</CommandLink>
          </p>
        </Section>
        <Section id="location" title="location">
          <MetadataGrid
            rows={[
              { key: 'based in', value: IDENTITY.location },
              { key: 'institution', value: IDENTITY.institution },
              { key: 'timezone', value: 'ICT · UTC+7', mono: true },
            ]}
          />
        </Section>
      </div>
    </Page>
  );
}
