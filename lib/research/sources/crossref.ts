/**
 * Crossref (free, no key). DOI-keyed metadata for nearly all scholarly
 * journals — including Cochrane Reviews (Wiley) and most ScienceDirect (Elsevier)
 * articles. Items whose container is the Cochrane Database of Systematic
 * Reviews are retagged as `source: "cochrane"` so the frontend can badge them.
 */
import type { SearchInput, SearchResult } from "@/lib/research/types";

interface CrossrefAuthor { given?: string; family?: string; name?: string }
interface CrossrefItem {
  DOI?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  "container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  abstract?: string;
  publisher?: string;
  URL?: string;
}

function stripJats(html?: string): string | undefined {
  if (!html) return undefined;
  // Crossref abstracts often arrive as JATS XML (<jats:p>…</jats:p>).
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || undefined;
}

function formatAuthors(authors?: CrossrefAuthor[]): string | undefined {
  if (!authors?.length) return undefined;
  return authors
    .map((a) => a.name ?? [a.given, a.family].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");
}

export async function searchCrossref({ query, limit = 20 }: SearchInput): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query", query);
  url.searchParams.set("rows", String(limit));
  url.searchParams.set(
    "select",
    "DOI,title,author,container-title,issued,abstract,publisher,URL",
  );

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { message?: { items?: CrossrefItem[] } };
  const items = data.message?.items ?? [];

  return items.map((item): SearchResult => {
    const journal = item["container-title"]?.[0];
    const year = item.issued?.["date-parts"]?.[0]?.[0];
    const isCochrane = (journal || "").toLowerCase().includes("cochrane");
    return {
      source: isCochrane ? "cochrane" : "crossref",
      externalId: item.DOI ?? "",
      title: item.title?.[0]?.replace(/\s+/g, " ").trim() ?? "(untitled)",
      authors: formatAuthors(item.author),
      journal,
      year,
      doi: item.DOI,
      url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
      abstract: stripJats(item.abstract),
    };
  });
}
