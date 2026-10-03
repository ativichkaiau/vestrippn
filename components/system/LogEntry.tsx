import Link from 'next/link';
import type { LogEntry as Log } from '@/lib/system/types';
import { Action, CommandLink, MetadataGrid } from './primitives';

/* One engineering log entry. Fields appear only when recorded. */
export default function LogEntry({ log, linkTitle = true }: { log: Log; linkTitle?: boolean }) {
  return (
    <article className="sys-log" aria-labelledby={`log-${log.slug}`}>
      <div className="sys-log-head">
        <h3 id={`log-${log.slug}`}>{linkTitle ? <Link href={`/logs/${log.slug}`}>{log.id}</Link> : log.id}</h3>
        <span className="sys-mono sys-muted">{log.date ?? log.series}</span>
      </div>
      <div className="sys-log-body">
        <MetadataGrid
          compact
          rows={[
            { key: 'entry', value: log.title },
            { key: 'target', value: log.targetFile, mono: true },
            { key: 'runtime', value: log.runtime, mono: true },
            { key: 'type', value: log.kind },
            { key: 'status', value: log.status, mono: true },
            { key: 'termination reason', value: log.termination, mono: true },
            { key: 'media', value: log.media ? log.media.label : 'not yet linked', mono: true },
          ]}
        />
      </div>
      <div className="sys-log-foot">
        {linkTitle && <CommandLink href={`/logs/${log.slug}`}>read log</CommandLink>}
        <CommandLink href={`/projects/${log.target}`}>inspect target</CommandLink>
        {log.media && <Action href={log.media.url}>watch</Action>}
      </div>
    </article>
  );
}
