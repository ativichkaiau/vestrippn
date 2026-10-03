import type { Metadata } from 'next';
import { Action, Page, PageHeader, RegistryTable, Section } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'The master planner and the index of external tools in daily use.',
};

type Tool = { name: string; url: string; note?: string };
type Group = { id: string; label: string; tools: Tool[] };

/* The external tools in daily use — the former tool matrix and the
   dashboard's quick-access links, merged into one index. */
const GROUPS: Group[] = [
  {
    id: 'study',
    label: 'study',
    tools: [
      { name: 'Canvas', url: 'https://mango-cmu.instructure.com', note: 'CMU courses' },
      { name: 'Notion', url: 'https://www.notion.so' },
      { name: 'Osmosis', url: 'https://www.osmosis.org' },
      { name: 'IELTS package', url: 'https://linktr.ee/ielts_package' },
      { name: 'CMU Library', url: 'https://library.cmu.ac.th' },
      { name: 'Calendar sheet', url: 'https://docs.google.com/spreadsheets/d/1oWKicDOiqKpXXCzbd46Qu3yMV-XZnA-K' },
    ],
  },
  {
    id: 'research',
    label: 'research / clinical',
    tools: [
      { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
      { name: 'Google Scholar', url: 'https://scholar.google.com' },
      { name: 'ClinicalKey', url: 'https://www.clinicalkey.com' },
      { name: 'UpToDate', url: 'https://www.uptodate.com' },
      { name: 'Covidence', url: 'https://www.covidence.org' },
      { name: 'PROSPERO', url: 'https://www.crd.york.ac.uk/prospero/' },
      { name: 'Research sheet', url: 'https://docs.google.com/spreadsheets/d/1E-KPCBw3d7voDo72VYgfvEIc-TCf4gGXtmTVymA-_z8' },
    ],
  },
  {
    id: 'ai',
    label: 'ai / synthesis',
    tools: [
      { name: 'Claude', url: 'https://claude.ai' },
      { name: 'ChatGPT', url: 'https://chat.openai.com' },
      { name: 'Gemini', url: 'https://gemini.google.com' },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com' },
      { name: 'Perplexity', url: 'https://www.perplexity.ai' },
      { name: 'Memo AI', url: 'https://memo.ai' },
      { name: 'DeepL', url: 'https://www.deepl.com' },
    ],
  },
  {
    id: 'engineering',
    label: 'engineering',
    tools: [
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'Vercel', url: 'https://vercel.com' },
      { name: 'Next.js docs', url: 'https://nextjs.org/docs' },
      { name: 'React', url: 'https://react.dev' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
      { name: 'Figma', url: 'https://www.figma.com' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    ],
  },
  {
    id: 'msca',
    label: 'msca sheets',
    tools: [
      { name: 'CMU-IMC · sheet 01', url: 'https://docs.google.com/spreadsheets/d/1OuNCnY9GfjvLCYN8S73mUSuRs0ah0igucEA6-ROWiyI' },
      { name: 'CMU-IMC · sheet 02', url: 'https://docs.google.com/spreadsheets/d/1zcv9TKx-22aemvog2LSGeULfkFulN0KSCL1rZcvolOE/edit?gid=1681603729#gid=1681603729' },
      { name: 'CMU-IMC · sheet 03', url: 'https://docs.google.com/spreadsheets/d/1uRwloyKqWXcDpa_JWZIedGGw6D5OGbBCTat8rZjo2zE/edit?gid=1312765885#gid=1312765885' },
      { name: 'Core ops · one stop', url: 'https://docs.google.com/spreadsheets/d/1ciQIcqZ6fQwPqdSU3mEK3aasHcXb-yqMt1IoBlWotrU' },
      { name: 'Core ops · central PR', url: 'https://docs.google.com/spreadsheets/d/1A1ATJuO-NXwWzdz5KFnDtw3N_6zPufOpd-FAbwAabgA' },
    ],
  },
  {
    id: 'daily',
    label: 'daily',
    tools: [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Google Calendar', url: 'https://calendar.google.com' },
      { name: 'Google Drive', url: 'https://drive.google.com' },
      { name: 'Strava', url: 'https://www.strava.com' },
      { name: 'Hevy', url: 'https://www.hevyapp.com' },
      { name: 'Examine', url: 'https://examine.com' },
      { name: 'Spotify', url: 'https://spotify.com' },
      { name: 'YouTube', url: 'https://youtube.com' },
    ],
  },
];

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');

export default function ToolsPage() {
  const total = GROUPS.reduce((n, group) => n + group.tools.length, 0);
  return (
    <Page>
      <PageHeader
        label="runtime / tools"
        title="Tools"
        lede="The master planner, and an index of the external tools in daily use. Every row opens in a new tab."
        meta={[
          { key: 'indexed', value: String(total).padStart(3, '0') },
          { key: 'groups', value: String(GROUPS.length).padStart(2, '0') },
        ]}
        actions={
          <Action href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938" primary>
            open 2026 planner
          </Action>
        }
      />

      {GROUPS.map((group) => (
        <Section key={group.id} id={group.id} title={group.label} count={String(group.tools.length).padStart(2, '0')}>
          <RegistryTable
            caption={`Tools — ${group.label}`}
            rows={group.tools}
            rowKey={(tool) => tool.url}
            href={(tool) => tool.url}
            columns={[
              { key: 'name', label: 'tool', kind: 'name', render: (tool) => <>{tool.name}{tool.note && <small>{tool.note}</small>}</> },
              { key: 'host', label: 'host', kind: 'mono', optional: true, render: (tool) => host(tool.url) },
            ]}
          />
        </Section>
      ))}
    </Page>
  );
}
