import { requireUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { ARCHIVE } from "@/lib/system/archive";
import { IDENTITY } from "@/lib/system/identity";
import { FEATURED, LOGS, OBJECTS, PROJECTS, SYSTEMS, systemIndex } from "@/lib/system/registry";
import { buildTree } from "@/lib/system/tree";
import { Action, CommandLink, MetadataGrid, Page, Section, StatusIndicator } from "@/components/system/primitives";
import SystemTree from "@/components/system/SystemTree";
import LocalTime from "@/components/system/LocalTime";
import SessionTasks, { type SessionTask } from "@/components/system/SessionTasks";
import SessionInbox from "@/components/system/SessionInbox";
import GarageTeaser from "@/components/garage/GarageTeaser";
import DomainHealth from "@/components/DomainHealth";

// Rendered per request: signed in, the root adds the owner's session; signed
// out, it is the public front page of the portfolio.
export const dynamic = "force-dynamic";

const YEAR_ORDINAL: Record<string, string> = { "01": "first-year", "02": "second-year", "03": "third-year", "04": "fourth-year", "05": "fifth-year", "06": "sixth-year" };

// Each query in isolation, so one failing table cannot blank the root.
async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`root: ${label} failed:`, err);
    return null;
  }
}

export default async function Root() {
  // A real session only — never the owner fallback — so private data is
  // rendered for a signed-in user alone.
  const userId = await requireUserId();
  const signedIn = Boolean(userId);

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
  const latestLog = LOGS[LOGS.length - 1];
  const vehicle = OBJECTS[0];

  return (
    <Page>
      <header className="sys-root-head">
        <p className="sys-label" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>VESTRIPPN / root</span>
          <LocalTime />
        </p>
        <h1 className="sys-root-title">
          VESTRIPPN<span className="sys-cursor" aria-hidden="true">_</span>
        </h1>
        <p className="sys-lede">personal systems environment</p>
        {signedIn ? (
          <MetadataGrid
            compact
            label="Environment"
            rows={[
              { key: "namespace", value: "VESTRIPPN", mono: true },
              { key: "environment", value: "personal", mono: true },
              { key: "runtime", value: <StatusIndicator state="active" label="active" /> },
            ]}
          />
        ) : (
          <>
            <p className="sys-root-intro">
              The root environment of <b>{IDENTITY.handle}</b> — a {YEAR_ORDINAL[IDENTITY.year] ?? ""} medical student at {IDENTITY.institution},
              building software for medicine and research. Study systems, research infrastructure, experiments and an archive, mounted under one namespace.
            </p>
            <div className="sys-header-actions">
              <Action href="/identity" primary>
                whoami
              </Action>
              <Action href="/systems">list systems</Action>
              <Action href="/garage/silver_arrow">open garage</Action>
            </div>
          </>
        )}
      </header>

      <Section id="root" title="environment" count={`${SYSTEMS.length} systems · ${PROJECTS.length} projects`}>
        <p className="sys-prompt">select system</p>
        <SystemTree lines={buildTree()} />
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

        {signedIn ? (
          <Section id="session" title="session" count={directive?.intent ? "directive set" : undefined}>
            {directive?.intent && (
              <p className="sys-prompt" style={{ color: "var(--text-strong)" }}>
                {directive.intent}
              </p>
            )}
            <SessionTasks initialTasks={tasks as SessionTask[]} />
          </Section>
        ) : (
          <Section id="object" title="garage">
            <GarageTeaser />
          </Section>
        )}
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
                {node.internal ? <CommandLink href={node.internal}>enter</CommandLink> : node.url ? <CommandLink href={node.url}>launch</CommandLink> : null}
                <CommandLink href={`/systems/${node.slug}`} label={`Inspect ${node.name}`}>
                  inspect
                </CommandLink>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {signedIn && (
        <div className="sys-columns sys-section" data-ratio="wide-left">
          <Section id="inbox" title="inbox">
            <SessionInbox />
          </Section>
          <Section id="domains" title="domains">
            <DomainHealth />
          </Section>
        </div>
      )}

      <Section id="recent" title="recent">
        <ul className="sys-list">
          {latestLog && (
            <li>
              <span className="sys-list-name">
                {latestLog.targetFile}
                <small>development log · {latestLog.runtime}</small>
              </span>
              <CommandLink href={`/logs/${latestLog.slug}`}>read log</CommandLink>
            </li>
          )}
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
                <small>previous build · {latestBuild.year}</small>
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
            { key: "session", value: signedIn ? "authenticated" : "public view", mono: true },
            { key: "systems", value: String(SYSTEMS.length).padStart(2, "0"), mono: true },
            { key: "projects", value: String(PROJECTS.length).padStart(2, "0"), mono: true },
            { key: "logs", value: String(LOGS.length).padStart(2, "0"), mono: true },
            { key: "objects", value: String(OBJECTS.length).padStart(2, "0"), mono: true },
            { key: "records", value: String(ARCHIVE.length).padStart(2, "0"), mono: true },
          ]}
        />
      </Section>
    </Page>
  );
}
