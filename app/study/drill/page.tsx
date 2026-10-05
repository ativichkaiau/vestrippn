import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/system/primitives';
import DrillClient from './DrillClient';

export const metadata: Metadata = {
  title: 'Weak-spot drill',
  description: 'Self-graded cards from your weakest exam objectives, written back to the coverage map.',
};

export default function DrillPage() {
  return (
    <Page wide>
      <PageHeader
        label="medicine / study / drill"
        title="Weak-spot drill"
        lede="Your ten weakest objectives in one course: untouched first, then low test scores, then reviewed-but-untested. Answer each prompt aloud or on paper, grade yourself honestly, and the score is saved to your coverage map."
      />
      <DrillClient />
    </Page>
  );
}
