import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/research/sources
 * Reports which research sources are currently usable (key/env present).
 * Lets the frontend display source filters / "set up your Elsevier key"
 * hints without trial-and-error.
 */
export async function GET() {
  const hasElsevier = Boolean(process.env.ELSEVIER_API_KEY);
  return NextResponse.json([
    { source: "pubmed", available: true, kind: "api", reason: "Free NCBI E-utilities" },
    { source: "europepmc", available: true, kind: "api", reason: "Free Europe PMC REST" },
    { source: "crossref", available: true, kind: "api", reason: "Free Crossref REST (covers Cochrane via DOI)" },
    {
      source: "scopus",
      available: hasElsevier,
      kind: "api",
      reason: hasElsevier ? "ELSEVIER_API_KEY set" : "Set ELSEVIER_API_KEY in Vercel env",
    },
    {
      source: "sciencedirect",
      available: hasElsevier,
      kind: "api",
      reason: hasElsevier ? "ELSEVIER_API_KEY set" : "Set ELSEVIER_API_KEY in Vercel env",
    },
    {
      source: "clinicalkey",
      available: false,
      kind: "deeplink",
      reason: "No public API — search opens in a new tab",
    },
    {
      source: "googlescholar",
      available: false,
      kind: "deeplink",
      reason: "No public API — search opens in a new tab",
    },
  ]);
}
