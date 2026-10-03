import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNode, SYSTEMS, systemIndex } from '@/lib/system/registry';
import { NodeActions, NodeMetadata, RelatedNodes } from '@/components/system/NodeParts';
import { Page, PageHeader, Section } from '@/components/system/primitives';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SYSTEMS.map((node) => ({ slug: node.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const node = getNode((await params).slug);
  if (!node) return {};
  // The root inspects itself: avoid "VESTRIPPN // VESTRIPPN".
  const title = node.slug === 'vestrippn' ? { absolute: 'VESTRIPPN // root namespace' } : node.name;
  return { title, description: `${node.name} — ${node.summary}.` };
}

export default async function SystemInspector({ params }: Params) {
  const node = getNode((await params).slug);
  if (!node?.system) notFound();

  return (
    <Page>
      <PageHeader
        index={systemIndex(node)}
        label="systems / inspect"
        title={<span className="sys-title-mono">{node.name}</span>}
        lede={node.summary}
        actions={<NodeActions node={node} view="system" />}
      />

      <div className="sys-columns sys-section" data-ratio="wide-left">
        <Section id="inspect" title="inspect">
          <NodeMetadata node={node} />
        </Section>
        {node.description && (
          <Section id="description" title="description">
            <div className="sys-prose">
              {node.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Section>
        )}
      </div>

      {node.related?.length ? (
        <Section id="related" title="related">
          <RelatedNodes node={node} />
        </Section>
      ) : null}
    </Page>
  );
}
