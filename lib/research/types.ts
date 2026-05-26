/**
 * Normalized result shape produced by every research source.
 * Sources fill in what they can — only `source`, `externalId`, and `title` are
 * required. Dedupe in lib/research/search.ts keys on DOI, then PMID.
 */
export type ResearchSource =
  | "pubmed"
  | "europepmc"
  | "crossref"
  | "scopus"
  | "sciencedirect"
  | "cochrane";

export interface SearchResult {
  source: ResearchSource;
  externalId: string; // PMID, DOI, Scopus EID — whatever the source uses
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
  abstract?: string;
}

export interface SearchInput {
  query: string;
  limit?: number; // per source
}
