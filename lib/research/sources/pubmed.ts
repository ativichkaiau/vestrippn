/**
 * PubMed via NCBI E-utilities (free, no key required).
 * NCBI_API_KEY is optional — improves rate limits from 3 → 10 req/s.
 * Two-step: ESearch (query → PMIDs) → ESummary (PMIDs → metadata).
 */
import type { SearchInput, SearchResult } from "@/lib/research/types";

const E = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function withKey(url: URL): URL {
  const key = process.env.NCBI_API_KEY;
  if (key) url.searchParams.set("api_key", key);
  return url;
}

interface ESummaryArticleId { idtype: string; value: string }
interface ESummaryAuthor { name: string }
interface ESummaryRow {
  uid: string;
  title?: string;
  authors?: ESummaryAuthor[];
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  articleids?: ESummaryArticleId[];
}

export async function searchPubMed({ query, limit = 20 }: SearchInput): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const esearch = withKey(new URL(`${E}/esearch.fcgi`));
  esearch.searchParams.set("db", "pubmed");
  esearch.searchParams.set("term", query);
  esearch.searchParams.set("retmode", "json");
  esearch.searchParams.set("retmax", String(limit));

  const sRes = await fetch(esearch.toString(), { next: { revalidate: 60 } });
  if (!sRes.ok) return [];
  const sData = (await sRes.json()) as { esearchresult?: { idlist?: string[] } };
  const ids = sData.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const esum = withKey(new URL(`${E}/esummary.fcgi`));
  esum.searchParams.set("db", "pubmed");
  esum.searchParams.set("id", ids.join(","));
  esum.searchParams.set("retmode", "json");
  const summaryRes = await fetch(esum.toString(), { next: { revalidate: 60 } });
  if (!summaryRes.ok) return [];
  const summary = (await summaryRes.json()) as { result?: Record<string, ESummaryRow | string[]> };
  const result = summary.result ?? {};

  return ids
    .map((id) => result[id])
    .filter((row): row is ESummaryRow => !!row && typeof row === "object" && !Array.isArray(row))
    .map((row): SearchResult => {
      const doi = row.articleids?.find((a) => a.idtype === "doi")?.value;
      const yearMatch = row.pubdate?.match(/\d{4}/);
      return {
        source: "pubmed",
        externalId: row.uid,
        title: row.title?.replace(/\.$/, "") ?? "(untitled)",
        authors: row.authors?.map((a) => a.name).join(", "),
        journal: row.fulljournalname || row.source,
        year: yearMatch ? Number(yearMatch[0]) : undefined,
        doi,
        pmid: row.uid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${row.uid}/`,
      };
    });
}
