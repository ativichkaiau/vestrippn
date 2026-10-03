'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import DailyStudyPlan from '@/components/DailyStudyPlan';
import CourseSemesterManager from '@/components/CourseSemesterManager';
import BackupManager from '@/components/BackupManager';
import ExamCoverageMap from '@/components/ExamCoverageMap';
import { Page, PageHeader, Section } from '@/components/system/primitives';

type Tab = 'plan' | 'courses' | 'coverage' | 'backup';

const tabs: { id: Tab; label: string; eyebrow: string; description: string }[] = [
  { id: 'plan', label: 'Daily Plan', eyebrow: 'Priority agenda', description: 'Bring deadlines, reviews, tasks, and research into one time-boxed run sheet.' },
  { id: 'courses', label: 'Courses', eyebrow: 'Curriculum control', description: 'Edit course links and exam dates, then archive semesters when the block is complete.' },
  { id: 'coverage', label: 'Exam Coverage', eyebrow: 'Topics & evidence', description: 'Track learning objectives, link your notes, and record practice results across your courses.' },
  { id: 'backup', label: 'Backup & Sync', eyebrow: 'Portable state', description: 'Keep focus history and preferences moving with you, and export a restorable copy of your work.' },
];

export default function WorkspaceClient({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab = tabs.find(item => item.id === requestedTab)?.id ?? initialTab;

  function selectTab(next: Tab) {
    router.replace(`/workspace?tab=${next}`, { scroll: false });
  }

  const active = tabs.find((item) => item.id === tab) ?? tabs[0];

  return (
    <Page wide hub>
      <PageHeader
        label="runtime / medicine"
        title="Workspace"
        lede="Daily plan, exam coverage, courses and backup."
      />
      <Section
        id="workspace"
        title={active.eyebrow.toLowerCase()}
        intro={active.description}
      >
        <div className="sys-filter" role="tablist" aria-label="Workspace sections">
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} aria-pressed={tab === item.id} onClick={() => selectTab(item.id)}>
              {item.label.toLowerCase()}
            </button>
          ))}
        </div>
        <div role="tabpanel" aria-label={active.label}>
          {tab === 'plan' && <DailyStudyPlan />}
          {tab === 'courses' && <CourseSemesterManager />}
          {tab === 'coverage' && <ExamCoverageMap />}
          {tab === 'backup' && <BackupManager />}
        </div>
      </Section>
    </Page>
  );
}
