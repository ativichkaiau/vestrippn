import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getObject, OBJECTS } from '@/lib/system/registry';
import ObjectInspector from '@/components/garage/ObjectInspector';
import PaintLibrary from '@/components/garage/PaintLibrary';
import { Page, PageHeader, Section } from '@/components/system/primitives';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return OBJECTS.map((object) => ({ slug: object.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const object = getObject((await params).slug);
  return object ? { title: object.name, description: `${object.id} — ${object.summary}.` } : {};
}

export default async function GarageObjectPage({ params }: Params) {
  const object = getObject((await params).slug);
  if (!object) notFound();

  return (
    <Page wide>
      <PageHeader index="06" label={`garage / ${object.id}`} title={object.name} lede={object.summary} />
      <ObjectInspector object={object} />
      <Section id="paints" title="paint" intro="Select a livery to repaint the object — and the environment around it.">
        <PaintLibrary />
      </Section>
    </Page>
  );
}
