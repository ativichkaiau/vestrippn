import { NextResponse } from "next/server";
import { unifiedSearch } from "@/lib/research/search";
import { deepLinks } from "@/lib/research/deeplinks";
import { requireUserId } from "@/lib/auth/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_QUERY = 500;
const MAX_LIMIT = 50;

// Short-TTL in-memory cache so repeated identical searches (e.g. re-runs while
// refining) don't hammer the external APIs (PubMed / Europe PMC / Scopus /
// Elsevier), which are quota-limited. Warm-instance scoped; that's enough for
// the common "search, tweak, search again" loop.
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 50;
type CacheEntry = { at: number; data: unknown };
const searchCache = new Map<string, CacheEntry>();

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
  // External-API + quota cost: require a real session.
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const cacheKey = `${limit}::${query.toLowerCase()}`;
  const hit = searchCache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.data);
  }

  const { results, channels } = await unifiedSearch({ query, limit });
  const payload = { query, results, channels, deepLinks: deepLinks(query) };

  // Cache only useful responses (at least one source returned something).
  if (results.length > 0) {
    searchCache.set(cacheKey, { at: Date.now(), data: payload });
    if (searchCache.size > CACHE_MAX) {
      const oldest = searchCache.keys().next().value;
      if (oldest !== undefined) searchCache.delete(oldest);
    }
  }

  return NextResponse.json(payload);
}
