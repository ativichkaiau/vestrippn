import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function WorkspacePage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : {};
  const raw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = raw === 'courses' || raw === 'backup' ? raw : 'plan';
  return <WorkspaceClient initialTab={initialTab} />;
}
