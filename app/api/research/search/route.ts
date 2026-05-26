import { NextResponse } from "next/server";
import { unifiedSearch } from "@/lib/research/search";
import { deepLinks } from "@/lib/research/deeplinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_QUERY = 500;
const MAX_LIMIT = 50;

/**
 * GET /api/research/search?q=…&limit=20
 *  -> { query, results, channels, deepLinks }
 * - `results`: unified, deduped, year-sorted across PubMed / Europe PMC /
 *   Crossref (Cochrane tagged) / Scopus / ScienceDirect.
 * - `channels`: per-source outcome (ok, count, error?) so the UI can show
 *   which sources contributed and which fell back.
 * - `deepLinks`: ClinicalKey + Google Scholar query URLs (no public API).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }
  if (query.length > MAX_QUERY) {
    return NextResponse.json({ error: "q too long" }, { status: 413 });
  }
  const limitRaw = Number(url.searchParams.get("limit") ?? 20);
  const limit = Math.max(1, Math.min(MAX_LIMIT, Number.isFinite(limitRaw) ? limitRaw : 20));

  const { results, channels } = await unifiedSearch({ query, limit });
  return NextResponse.json({
    query,
    results,
    channels,
    deepLinks: deepLinks(query),
  });
}
