/**
 * ScienceDirect (Elsevier) — same ELSEVIER_API_KEY as Scopus. Optionally also
 * ELSEVIER_INSTTOKEN for institutional entitlements. Returns [] without a key.
 */
import type { SearchInput, SearchResult } from "@/lib/research/types";

interface SDEntry {
  "dc:title"?: string;
  authors?: { author?: { $?: string; "ce:surname"?: string; "ce:given-name"?: string }[] };
  "prism:publicationName"?: string;
  "prism:coverDate"?: string;
  "prism:doi"?: string;
  link?: { "@ref": string; "@href": string }[];
}

function elsevierHeaders(): HeadersInit | null {
  const key = process.env.ELSEVIER_API_KEY;
  if (!key) return null;
  const h: Record<string, string> = { "X-ELS-APIKey": key, Accept: "application/json" };
  const inst = process.env.ELSEVIER_INSTTOKEN;
  if (inst) h["X-ELS-Insttoken"] = inst;
  return h;
}

function formatSDAuthors(authors: SDEntry["authors"]): string | undefined {
  const list = authors?.author;
  if (!list?.length) return undefined;
  return list
    .map((a) => a.$ ?? [a["ce:given-name"], a["ce:surname"]].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");
}

export async function searchScienceDirect({ query, limit = 20 }: SearchInput): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const headers = elsevierHeaders();
  if (!headers) return [];

  const url = new URL("https://api.elsevier.com/content/search/sciencedirect");
  url.searchParams.set("query", query);
  url.searchParams.set("count", String(limit));

  const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { "search-results"?: { entry?: SDEntry[] } };
  const entries = data["search-results"]?.entry ?? [];
  if (entries.length === 1 && !entries[0]["dc:title"]) return [];

  return entries.map((entry): SearchResult => {
    const yearMatch = entry["prism:coverDate"]?.match(/^\d{4}/);
    const sdLink = entry.link?.find((l) => l["@ref"] === "scidir")?.["@href"];
    const doi = entry["prism:doi"];
    return {
      source: "sciencedirect",
      externalId: doi ?? sdLink ?? "",
      title: entry["dc:title"] ?? "(untitled)",
      authors: formatSDAuthors(entry.authors),
      journal: entry["prism:publicationName"],
      year: yearMatch ? Number(yearMatch[0]) : undefined,
      doi,
      url: sdLink ?? (doi ? `https://doi.org/${doi}` : undefined),
    };
  });
}
