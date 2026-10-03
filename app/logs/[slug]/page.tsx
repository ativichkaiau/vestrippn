import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLog, getNode, LOGS } from '@/lib/system/registry';
import LogEntry from '@/components/system/LogEntry';
import { CommandLink, Page, PageHeader, Section } from '@/components/system/primitives';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOGS.map((log) => ({ slug: log.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const log = getLog((await params).slug);
  return log ? { title: `${log.id} · ${log.targetFile}`, description: `${log.title} — ${log.targetFile}.` } : {};
}

export default async function LogPage({ params }: Params) {
  const log = getLog((await params).slug);
  if (!log) notFound();
  const target = getNode(log.target);

  return (
    <Page>
      <PageHeader
        index="06"
        label={`logs / ${log.series}`}
        title={<span className="sys-title-mono">{log.id}</span>}
        lede={`${log.title} — ${log.targetFile}`}
      />

      <Section id="entry" title="entry">
        <LogEntry log={log} linkTitle={false} />
      </Section>

      <Section id="media" title="media">
        {log.media ? (
          <p>
            <CommandLink href={log.media.url}>watch · {log.media.label}</CommandLink>
          </p>
        ) : (
          <p className="sys-empty">no recording linked to this entry yet.</p>
        )}
      </Section>

      {target && (
        <Section id="target" title="target">
          <ul className="sys-list">
            <li>
              <span className="sys-list-name">
                {target.name}
                <small>
                  {target.summary}
                  {target.language ? ` · ${target.language}` : ''}
                </small>
              </span>
              <CommandLink href={`/projects/${target.slug}`}>open project</CommandLink>
            </li>
          </ul>
        </Section>
      )}
    </Page>
  );
}
