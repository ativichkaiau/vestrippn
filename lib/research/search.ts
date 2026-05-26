/**
 * Unified research search: fan out to all available sources in parallel, each
 * failure isolated (returns []), then dedupe and rank.
 *
 * Dedupe priority — keep the result with the richest metadata when two sources
 * return the same paper:
 *   DOI (lower-cased) → PMID → title (lower-cased, collapsed whitespace).
 * Source preference for the "kept" record:
 *   europepmc > pubmed > scopus > sciencedirect > cochrane > crossref
 * (Europe PMC + PubMed usually carry the cleanest metadata; Crossref is the
 * broadest catch-all, so it loses ties.)
 */
import type { ResearchSource, SearchInput, SearchResult } from "@/lib/research/types";
import { searchPubMed } from "@/lib/research/sources/pubmed";
import { searchEuropePmc } from "@/lib/research/sources/europepmc";
import { searchCrossref } from "@/lib/research/sources/crossref";
import { searchScopus } from "@/lib/research/sources/scopus";
import { searchScienceDirect } from "@/lib/research/sources/sciencedirect";

const SOURCE_RANK: Record<ResearchSource, number> = {
  europepmc: 0,
  pubmed: 1,
  scopus: 2,
  sciencedirect: 3,
  cochrane: 4,
  crossref: 5,
};

function dedupeKey(r: SearchResult): string {
  if (r.doi) return `doi:${r.doi.toLowerCase()}`;
  if (r.pmid) return `pmid:${r.pmid}`;
  return `title:${r.title.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

export interface ChannelOutcome {
  source: ResearchSource;
  ok: boolean;
  count: number;
  error?: string;
}

export interface UnifiedSearch {
  results: SearchResult[];
  channels: ChannelOutcome[];
}

async function run(
  source: ResearchSource,
  fn: () => Promise<SearchResult[]>,
): Promise<{ outcome: ChannelOutcome; results: SearchResult[] }> {
  try {
    const results = await fn();
    return { outcome: { source, ok: true, count: results.length }, results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`Research source ${source} failed:`, err);
    return { outcome: { source, ok: false, count: 0, error: message }, results: [] };
  }
}

export async function unifiedSearch(input: SearchInput): Promise<UnifiedSearch> {
  const channels = await Promise.all([
    run("pubmed", () => searchPubMed(input)),
    run("europepmc", () => searchEuropePmc(input)),
    run("crossref", () => searchCrossref(input)),
    run("scopus", () => searchScopus(input)),
    run("sciencedirect", () => searchScienceDirect(input)),
  ]);

  // Dedupe — keep the best-ranked source for each key, but merge in missing
  // fields from the loser (e.g. Europe PMC abstract onto a PubMed title hit).
  const seen = new Map<string, SearchResult>();
  for (const { results } of channels) {
    for (const r of results) {
      const key = dedupeKey(r);
      const prev = seen.get(key);
      if (!prev) {
        seen.set(key, r);
        continue;
      }
      const keep = SOURCE_RANK[r.source] < SOURCE_RANK[prev.source] ? r : prev;
      const other = keep === r ? prev : r;
      seen.set(key, {
        ...keep,
        authors: keep.authors ?? other.authors,
        journal: keep.journal ?? other.journal,
        year: keep.year ?? other.year,
        doi: keep.doi ?? other.doi,
        pmid: keep.pmid ?? other.pmid,
        url: keep.url ?? other.url,
        abstract: keep.abstract ?? other.abstract,
      });
    }
  }

  const results = [...seen.values()].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return { results, channels: channels.map((c) => c.outcome) };
}
