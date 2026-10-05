import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/system/primitives';
import StudyHub from './StudyHub';

export const metadata: Metadata = {
  title: 'Study',
  description: 'Exam countdowns, the case review queue, weak-spot drills, drug cards and the case editor.',
};

export default function StudyPage() {
  return (
    <Page wide>
      <PageHeader
        label="medicine / study"
        title="Study"
        lede="What to work on now: today's share of each exam's coverage, the cases you got wrong coming back for review, and a drill on your weakest objectives."
      />
      <StudyHub />
    </Page>
  );
}
