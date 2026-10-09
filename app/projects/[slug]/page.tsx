import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNode, LOGS, PROJECTS, projectIndex } from '@/lib/system/registry';
import CodeBlock from '@/components/system/CodeBlock';
import { NodeActions, NodeMetadata, RelatedNodes } from '@/components/system/NodeParts';
import { CommandLink, Page, PageHeader, Section } from '@/components/system/primitives';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((node) => ({ slug: node.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const node = getNode((await params).slug);
  if (!node) return {};
  // The root inspects itself: avoid "VESTRIPPN // VESTRIPPN".
  const title = node.slug === 'vestrippn' ? { absolute: 'VESTRIPPN // root namespace' } : node.name;
  return { title, description: `${node.name} — ${node.summary}.` };
}

export default async function ProjectRepository({ params }: Params) {
  const node = getNode((await params).slug);
  if (!node?.project) notFound();
  const logs = LOGS.filter((log) => log.target === node.slug);

  return (
    <Page>
      <PageHeader
        index={projectIndex(node)}
        label="projects / repository"
        title={<span className="sys-title-mono">{node.name}</span>}
        lede={node.summary}
        actions={<NodeActions node={node} view="project" />}
      />

      <div className="sys-columns sys-section" data-ratio="wide-left">
        <Section id="readme" title="readme">
          {node.description ? (
            <div className="sys-prose">
              {node.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="sys-empty">no README recorded for this project yet.</p>
          )}
        </Section>
        <Section id="project" title="project">
          <NodeMetadata node={node} />
        </Section>
      </div>

      {node.files?.length ? (
        <Section id="files" title="files" count={String(node.files.length).padStart(2, '0')}>
          <ul className="sys-list">
            {node.files.map((file) => (
              <li key={file}>
                <span className="sys-list-name">{file}</span>
                <span className="sys-mono sys-muted">{file.endsWith('/') ? 'dir' : file.split('.').pop()}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {node.excerpt && (
        <Section id="excerpt" title="excerpt">
          <CodeBlock
            code={node.excerpt.code}
            language={node.excerpt.language}
            file={node.excerpt.file}
            source={node.source ? `https://github.com/ativichkaiau/vestrippn/blob/main/${node.excerpt.file}` : undefined}
          />
        </Section>
      )}

      {logs.length > 0 && (
        <Section id="logs" title="logs">
          <ul className="sys-list">
            {logs.map((log) => (
              <li key={log.id}>
                <span className="sys-list-name">
                  {log.id}
                  <small>
                    {log.series} · {log.status}
                  </small>
                </span>
                <CommandLink href={`/logs/${log.slug}`}>read log</CommandLink>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {node.related?.length ? (
        <Section id="related" title="related">
          <RelatedNodes node={node} />
        </Section>
      ) : null}
    </Page>
  );
}
