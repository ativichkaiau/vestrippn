/**
 * Scopus (Elsevier) — gated by ELSEVIER_API_KEY. Some endpoints/full content
 * also require ELSEVIER_INSTTOKEN (institutional token); both are sent if set.
 * Returns [] if no key, so the unified fan-out degrades silently.
 */
import type { SearchInput, SearchResult } from "@/lib/research/types";

interface ScopusEntry {
  "dc:title"?: string;
  "dc:creator"?: string;
  "prism:publicationName"?: string;
  "prism:coverDate"?: string;
  "prism:doi"?: string;
  "dc:identifier"?: string; // SCOPUS_ID:...
  eid?: string;
  link?: { "@ref": string; "@href": string }[];
}

function elsevierHeaders(): HeadersInit | null {
  const key = process.env.ELSEVIER_API_KEY;
  if (!key) return null;
  const h: Record<string, string> = {
    "X-ELS-APIKey": key,
    Accept: "application/json",
  };
  const inst = process.env.ELSEVIER_INSTTOKEN;
  if (inst) h["X-ELS-Insttoken"] = inst;
  return h;
}

export async function searchScopus({ query, limit = 20 }: SearchInput): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const headers = elsevierHeaders();
  if (!headers) return [];

  const url = new URL("https://api.elsevier.com/content/search/scopus");
  url.searchParams.set("query", query);
  url.searchParams.set("count", String(limit));

  const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    "search-results"?: { entry?: ScopusEntry[] };
  };
  const entries = data["search-results"]?.entry ?? [];
  // Scopus returns an `error`-shaped single entry when there are no results.
  if (entries.length === 1 && !entries[0]["dc:title"]) return [];

  return entries.map((entry): SearchResult => {
    const yearMatch = entry["prism:coverDate"]?.match(/^\d{4}/);
    const scopusLink = entry.link?.find((l) => l["@ref"] === "scopus")?.["@href"];
    const doi = entry["prism:doi"];
    return {
      source: "scopus",
      externalId: entry.eid ?? entry["dc:identifier"] ?? doi ?? "",
      title: entry["dc:title"] ?? "(untitled)",
      authors: entry["dc:creator"],
      journal: entry["prism:publicationName"],
      year: yearMatch ? Number(yearMatch[0]) : undefined,
      doi,
      url: scopusLink ?? (doi ? `https://doi.org/${doi}` : undefined),
    };
  });
}
