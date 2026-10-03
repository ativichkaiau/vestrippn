import type { Metadata } from 'next';
import RequestedPath from '@/components/system/RequestedPath';
import { Action, CommandLink, Page } from '@/components/system/primitives';

export const metadata: Metadata = { title: '404' };

export default function NotFound() {
  return (
    <Page>
      <div className="sys-not-found">
        <p className="sys-label">404</p>
        <h1 className="sys-title"><span className="sys-title-mono">PATH_NOT_FOUND</span></h1>
        <dl className="sys-meta" data-compact>
          <div>
            <dt>requested</dt>
            <dd data-mono>
              <RequestedPath />
            </dd>
          </div>
          <div>
            <dt>resolution</dt>
            <dd>Nothing is mounted at this path.</dd>
          </div>
        </dl>
        <div className="sys-header-actions">
          <Action href="/" primary>
            return root
          </Action>
          <CommandLink href="/systems">list systems</CommandLink>
        </div>
      </div>
    </Page>
  );
}
