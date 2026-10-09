/* ════════════════════════════════════════════════════════════════════════
   VESTRIPPN registry model.

   Everything mounted under the root namespace is described by these types:
   systems and projects (Node), the runtime modules inside this app, logs,
   garage objects and archive records. Pages, navigation, search and the
   status bar all read the same data, so a count shown anywhere is a count of
   real entries.

   Rule: a field is present only when the fact is known. Unknown URLs, dates
   and stacks stay undefined and the UI omits them — nothing is invented to
   fill a column.
   ════════════════════════════════════════════════════════════════════════ */

export type State =
  | 'active'
  | 'experimental'
  | 'available'
  | 'mounted'
  | 'archived'
  | 'planned';

export type Domain = 'software' | 'medicine' | 'research' | 'media';

export type Node = {
  /** URL segment, unique across the registry. */
  slug: string;
  /** Canonical identifier as written in the system, e.g. `studyex_medeetomihub`. */
  name: string;
  /** Interface path, e.g. `~/systems/studyex`. */
  path: string;
  type: string;
  /** One line, lowercase, the way the registry describes it. */
  summary: string;
  /** README-style prose. */
  description?: string[];
  state: State;
  domains: Domain[];
  /** Listed in the systems registry (service discovery). */
  system?: boolean;
  /** Listed in the projects registry (repositories and artifacts). */
  project?: boolean;
  language?: string;
  stack?: string[];
  /** ISO date, only when known. */
  created?: string;
  /** Live deployment or launch target. */
  url?: string;
  /** Public source repository. Never set for private code. */
  source?: string;
  /** Route inside VESTRIPPN that operates this node. */
  internal?: string;
  /** Known files, for the repository view. */
  files?: string[];
  /** Short real excerpt, shown with highlighting on the project page. */
  excerpt?: { file: string; language: 'ts' | 'py'; code: string };
  /** Slugs of related nodes. */
  related?: string[];
  /** Shown in ROOT / ACTIVE SYSTEMS. */
  featured?: boolean;
};

/** A module mounted inside this app (the study and personal runtime). */
export type RuntimeModule = {
  slug: string;
  name: string;
  href: string;
  path: string;
  summary: string;
  branch: 'medicine' | 'research' | 'personal' | 'tools';
  keywords?: string;
  /** Open to visitors without an account. */
  public?: boolean;
};

export type LogEntry = {
  id: string;
  slug: string;
  series: string;
  title: string;
  /** Node slug the session targeted. */
  target: string;
  targetFile: string;
  runtime: string;
  kind: string;
  status: string;
  termination?: string;
  date?: string;
  media?: { label: string; url: string };
  notes?: string[];
};

export type GarageObject = {
  id: string;
  slug: string;
  name: string;
  type: string;
  state: State;
  viewer: string;
  summary: string;
  fields: { key: string; value: string }[];
  notes?: string[];
};

export type ArchiveCategory = 'academic' | 'olympiad' | 'competition' | 'research' | 'software' | 'media';

export type ArchiveRecord = {
  id: string;
  category: ArchiveCategory;
  title: string;
  /** Short label such as `IESO`; shown in the record header. */
  code?: string;
  year?: string;
  type: string;
  field?: string;
  result?: string;
  details?: string[];
  links?: { label: string; url: string }[];
};
