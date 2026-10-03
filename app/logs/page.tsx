import type { Metadata } from 'next';
import { getNode, LOGS } from '@/lib/system/registry';
import LogEntry from '@/components/system/LogEntry';
import { CommandLink, MetadataGrid, Page, PageHeader, Section, StatusIndicator } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Logs',
  description: 'Engineering and development logs, including code_till_i_am_bored.',
};

export default function LogsPage() {
  const series = getNode('code_till_i_am_bored');
  return (
    <Page>
      <PageHeader
        index="06"
        label="logs"
        title="Logs"
        lede="Development logs, written like engineering records: what was targeted, what ran, and why it stopped."
        meta={[
          { key: 'entries', value: String(LOGS.length).padStart(3, '0') },
          { key: 'series', value: '01' },
        ]}
      />

      {series && (
        <Section id="series" title="series">
          <div className="sys-columns" data-ratio="wide-left">
            <div className="sys-prose">
              <p className="sys-mono" style={{ color: 'var(--text-strong)', fontSize: 'var(--text-md)' }}>
                ~/logs/{series.name}
              </p>
              {series.description?.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <div>
              <MetadataGrid
                compact
                rows={[
                  { key: 'type', value: series.type },
                  { key: 'state', value: <StatusIndicator state={series.state} /> },
                  { key: 'entries', value: String(LOGS.filter((log) => log.series === series.name).length).padStart(3, '0'), mono: true },
                  { key: 'format', value: 'development log', mono: true },
                ]}
              />
              <p style={{ marginTop: 'var(--space-4)' }}>
                <CommandLink href={`/systems/${series.slug}`}>inspect series</CommandLink>
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section id="entries" title="entries" count={String(LOGS.length).padStart(3, '0')}>
        <div className="sys-log-stack">
          {[...LOGS].reverse().map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      </Section>
    </Page>
  );
}
