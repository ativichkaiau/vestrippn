import type { Metadata } from 'next';
import { PROJECTS } from '@/lib/system/registry';
import ProjectRegistry from '@/components/system/ProjectRegistry';
import { Page, PageHeader, Section } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Indexed registry of VESTRIPPN projects — software, medicine, research and media.',
};

export default function ProjectsPage() {
  const withSource = PROJECTS.filter((node) => node.source).length;
  const deployed = PROJECTS.filter((node) => node.url).length;
  return (
    <Page>
      <PageHeader
        index="03"
        label="projects"
        title="Projects"
        lede="Repositories and artifacts. Open one to read its README, files and output."
        meta={[
          { key: 'indexed', value: String(PROJECTS.length).padStart(3, '0') },
          { key: 'deployed', value: String(deployed).padStart(2, '0') },
          { key: 'public source', value: String(withSource).padStart(2, '0') },
        ]}
      />
      <Section id="registry" title="registry">
        <ProjectRegistry projects={PROJECTS} />
      </Section>
    </Page>
  );
}
