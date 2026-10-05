import type { Metadata } from 'next';
import { requireOwnerId } from '@/lib/auth/owner';
import { Page, PageHeader } from '@/components/system/primitives';
import CaseEditor from './CaseEditor';

export const metadata: Metadata = {
  title: 'Case editor',
  description: 'Write and edit branching clinical cases as a decision tree.',
};

export const dynamic = 'force-dynamic';

export default async function CaseEditorPage() {
  const owner = await requireOwnerId();
  return (
    <Page wide>
      <PageHeader
        label="medicine / study / case editor"
        title="Case editor"
        lede="Each decision point, its choices and where they lead, as a tree. The editor checks the graph as you type: every choice must lead somewhere, every node must be reachable, every path must end."
      />
      {owner ? <CaseEditor /> : <p className="sys-muted">The case editor is for the owner&apos;s account. Sign in with it to write or edit cases.</p>}
    </Page>
  );
}
