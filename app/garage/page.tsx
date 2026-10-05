import type { Metadata } from 'next';
import { LIVERIES } from '@/lib/liveries';
import { OBJECTS } from '@/lib/system/registry';
import PaintLibrary from '@/components/garage/PaintLibrary';
import { Page, PageHeader, RegistryTable, Section, StatusIndicator } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Garage',
  description: 'Objects kept for inspection in VESTRIPPN, including the Silver Arrow 3D viewer.',
};

export default function GaragePage() {
  return (
    <Page>
      <PageHeader
        index="06"
        label="garage"
        title="Garage"
        lede="Objects kept for inspection. Each one opens in a viewer; the paint library repaints them."
        meta={[
          { key: 'objects', value: String(OBJECTS.length).padStart(3, '0') },
          { key: 'paints', value: String(LIVERIES.length).padStart(2, '0') },
        ]}
      />

      <Section id="objects" title="objects">
        <RegistryTable
          caption="Garage objects"
          rows={OBJECTS}
          rowKey={(object) => object.slug}
          href={(object) => `/garage/${object.slug}`}
          columns={[
            { key: 'id', label: 'id', kind: 'id', render: (object) => object.id },
            { key: 'name', label: 'object', kind: 'name', render: (object) => <>{object.name}<small>{object.summary}</small></> },
            { key: 'viewer', label: 'viewer', kind: 'mono', optional: true, render: (object) => object.viewer },
            { key: 'state', label: 'state', render: (object) => <StatusIndicator state={object.state} /> },
          ]}
        />
      </Section>

      <Section id="paints" title="paint library" count={`${LIVERIES.length} liveries`} intro="A livery repaints the garage objects and the environment — accent, surfaces, selection, the stripe under the masthead. Appearance (dark, light, auto) stays separate.">
        <PaintLibrary />
      </Section>
    </Page>
  );
}
