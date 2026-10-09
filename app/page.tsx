import { requireUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { ARCHIVE } from "@/lib/system/archive";
import { IDENTITY } from "@/lib/system/identity";
import { FEATURED, OBJECTS, PROJECTS, SYSTEMS, systemIndex } from "@/lib/system/registry";
import type { State } from "@/lib/system/types";
import {
  CommandLink,
  MetadataGrid,
  Page,
  RegistryTable,
  Section,
  StatusIndicator,
} from "@/components/system/primitives";
import SessionTasks, { type SessionTask } from "@/components/system/SessionTasks";
import SessionInbox from "@/components/system/SessionInbox";
import DomainHealth from "@/components/DomainHealth";

// Rendered per request: the session block reads the owner's tasks.
export const dynamic = "force-dynamic";

// Each query in isolation, so one failing table cannot blank the root.
async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`root: ${label} failed:`, err);
    return null;
  }
}

/* The branches of the root tree, as the owner describes their state. */
const BRANCHES: { name: string; state: State; path: string; href: string }[] = [
  { name: "medicine", state: "active", path: "~/medicine", href: "/medicine" },
  { name: "research", state: "active", path: "~/research", href: "/research" },
  { name: "software", state: "active", path: "~/projects", href: "/projects" },
  { name: "studyex_medeetomihub", state: "active", path: "~/medicine/studyex_medeetomihub", href: "/systems/studyex_medeetomihub" },
  { name: "archive", state: "mounted", path: "~/archive", href: "/archive" },
  { name: "garage", state: "available", path: "~/garage", href: "/garage" },
];

export default async function Root() {
  // A real session only; the proxy already redirected anonymous visitors.
  const userId = await requireUserId();

  const tasks = userId
    ? ((await safe("tasks", () =>
        prisma.task.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, completed: true, category: true },
        }),
      )) ?? [])
    : [];
  const directive = userId
    ? await safe("directive", () => prisma.dailyCommand.findUnique({ where: { userId }, select: { intent: true } }))
    : null;

  const latestBuild = ARCHIVE.find((record) => record.category === "software");
  const vehicle = OBJECTS[0];

  return (
    <Page>
      <header className="sys-root-head">
        <p className="sys-label">VESTRIPPN / root</p>
        <h1 className="sys-root-title">
          VESTRIPPN<span className="sys-cursor" aria-hidden="true">_</span>
        </h1>
        <p className="sys-lede">personal systems environment</p>
        <MetadataGrid
          compact
          label="Environment"
          rows={[
            { key: "namespace", value: "VESTRIPPN", mono: true },
            { key: "environment", value: "personal", mono: true },
            { key: "runtime", value: <StatusIndicator state="active" label="active" /> },
          ]}
        />
      </header>

      <Section id="root" title="root" count={`${BRANCHES.length} branches`}>
        <p className="sys-prompt">select system</p>
        <RegistryTable
          caption="Branches of the VESTRIPPN root"
          rows={BRANCHES}
          rowKey={(row) => row.name}
          href={(row) => row.href}
          columns={[
            { key: "name", label: "branch", kind: "name", render: (row) => row.name },
            { key: "state", label: "state", render: (row) => <StatusIndicator state={row.state} /> },
            { key: "path", label: "path", kind: "mono", optional: true, render: (row) => row.path },
          ]}
        />
      </Section>

      <div className="sys-columns sys-section">
        <Section id="context" title="current_context">
          <MetadataGrid
            rows={[
              { key: "operator", value: IDENTITY.handle },
              { key: "roles", value: IDENTITY.roles.join(" · ") },
              { key: "program", value: `${IDENTITY.program} · year ${IDENTITY.year} · ${IDENTITY.institutionShort}` },
              { key: "location", value: IDENTITY.location },
              { key: "focus", value: IDENTITY.focus.join(" / "), mono: true },
            ]}
          />
          <p style={{ marginTop: "var(--space-4)" }}>
            <CommandLink href="/identity">inspect identity</CommandLink>
          </p>
        </Section>

        <Section id="session" title="session" count={directive?.intent ? "directive set" : undefined}>
          {directive?.intent && (
            <p className="sys-prompt" style={{ color: "var(--text-strong)" }}>
              {directive.intent}
            </p>
          )}
          <SessionTasks initialTasks={tasks as SessionTask[]} />
        </Section>
      </div>

      <Section id="active-systems" title="active systems" count={String(FEATURED.length).padStart(2, "0")}>
        <ol className="sys-objects">
          {FEATURED.map((node) => (
            <li key={node.slug} className="sys-object">
              <span className="sys-object-index">{systemIndex(node)}</span>
              <div>
                <h3 className="sys-object-name">{node.name}</h3>
                <p className="sys-object-summary">{node.summary}</p>
                <div className="sys-object-meta">
                  <StatusIndicator state={node.state} />
                  <span className="sys-mono sys-muted">{node.type}</span>
                </div>
              </div>
              <div className="sys-object-actions">
                {node.internal ? (
                  <CommandLink href={node.internal}>enter</CommandLink>
                ) : node.url ? (
                  <CommandLink href={node.url}>launch</CommandLink>
                ) : null}
                <CommandLink href={`/systems/${node.slug}`} label={`Inspect ${node.name}`}>
                  inspect
                </CommandLink>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="sys-columns sys-section" data-ratio="wide-left">
        <Section id="inbox" title="inbox">
          <SessionInbox />
        </Section>
        <Section id="domains" title="domains">
          <DomainHealth />
        </Section>
      </div>

      <Section id="recent" title="recent">
        <ul className="sys-list">
          {vehicle && (
            <li>
              <span className="sys-list-name">
                {vehicle.name}
                <small>garage object · 2014</small>
              </span>
              <CommandLink href={`/garage/${vehicle.slug}`}>inspect</CommandLink>
            </li>
          )}
          {latestBuild && (
            <li>
              <span className="sys-list-name">
                {latestBuild.code} · {latestBuild.title}
                <small>
                  previous build · {latestBuild.year}
                </small>
              </span>
              <CommandLink href={`/archive#${latestBuild.id}`}>open record</CommandLink>
            </li>
          )}
        </ul>
      </Section>

      <Section id="status" title="status">
        <MetadataGrid
          rows={[
            { key: "environment", value: <StatusIndicator state="active" /> },
            { key: "namespace", value: "VESTRIPPN", mono: true },
            { key: "systems", value: String(SYSTEMS.length).padStart(2, "0"), mono: true },
            { key: "projects", value: String(PROJECTS.length).padStart(2, "0"), mono: true },
            { key: "objects", value: String(OBJECTS.length).padStart(2, "0"), mono: true },
            { key: "records", value: String(ARCHIVE.length).padStart(2, "0"), mono: true },
          ]}
        />
      </Section>
    </Page>
  );
}
