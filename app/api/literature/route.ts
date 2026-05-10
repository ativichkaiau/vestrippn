import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  try {
    // Stage 1: ID Extraction
    const searchRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=6`
    );
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist;

    if (!ids || ids.length === 0) return NextResponse.json([]);

    // Stage 2: Metadata Synthesis
    const summaryRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    );
    const summaryData = await summaryRes.json();

    const results = ids.map((id: string) => {
      const item = summaryData.result[id];
      return {
        id,
        title: item?.title || "UNRESOLVED_TITLE",
        authors: item?.authors?.[0]?.name ? `${item.authors[0].name} et al.` : 'ANON_AUTHORS',
        journal: item?.source || "CLINICAL_JOURNAL",
        date: item?.pubdate?.split(' ')[0] || "2026",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Extraction_Failed' }, { status: 500 });
  }
}