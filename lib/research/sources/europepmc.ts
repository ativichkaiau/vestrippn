/**
 * Europe PMC (free, no key). Returns title/authors/journal/year/PMID/DOI and —
 * unlike PubMed — the abstract in one shot.
 */
import type { SearchInput, SearchResult } from "@/lib/research/types";

interface EpmcRow {
  id?: string;
  pmid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  abstractText?: string;
  fullTextUrlList?: { fullTextUrl?: { url?: string }[] };
}

export async function searchEuropePmc({ query, limit = 20 }: SearchInput): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", String(limit));
  url.searchParams.set("resultType", "core");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { resultList?: { result?: EpmcRow[] } };
  const rows = data.resultList?.result ?? [];

  return rows.map((row): SearchResult => {
    const fallbackUrl =
      row.fullTextUrlList?.fullTextUrl?.find((u) => u.url)?.url ??
      (row.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/` : undefined) ??
      (row.doi ? `https://doi.org/${row.doi}` : undefined);
    return {
      source: "europepmc",
      externalId: row.id ?? row.pmid ?? row.doi ?? "",
      title: row.title?.replace(/\.$/, "") ?? "(untitled)",
      authors: row.authorString,
      journal: row.journalTitle,
      year: row.pubYear ? Number(row.pubYear) : undefined,
      doi: row.doi,
      pmid: row.pmid,
      url: fallbackUrl,
      abstract: row.abstractText,
    };
  });
}
