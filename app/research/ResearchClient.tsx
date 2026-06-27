'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import CovidenceBoard from '../../components/CovidenceBoard';
import TopNavProfile from '../../components/TopNavProfile';
import MissionBlock from '../../components/MissionBlock';
import { NavRail, MobileHubNav } from '../../components/HubNav';
import HubIntro from '../../components/HubIntro';
import CockpitIntelligencePanel from '../../components/CockpitIntelligencePanel';
import BrandMark from '../../components/BrandMark';

/* ── Research Hub: multi-source contract types (see app/api/research/*) ── */
type ResearchSource = 'pubmed' | 'europepmc' | 'crossref' | 'cochrane' | 'scopus' | 'sciencedirect';
type DeepLinkSource = 'clinicalkey' | 'googlescholar';
type AnySource = ResearchSource | DeepLinkSource;

interface SearchResult {
  source: ResearchSource;
  externalId: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
  abstract?: string;
}
interface ChannelStatus { source: ResearchSource; ok: boolean; count: number; error?: string }
interface DeepLink { source: DeepLinkSource; label: string; url: string }
interface SearchResponse {
  query: string;
  results: SearchResult[];
  channels: ChannelStatus[];
  deepLinks: DeepLink[];
}
interface SourceStatus {
  source: AnySource;
  available: boolean;
  kind: 'api' | 'deeplink';
  reason: string;
}

interface VaultItem {
  id: string;
  title: string;
  authors?: string | null;
  journal?: string | null;
  url?: string | null;
  pmid?: string | null;
  doi?: string | null;
  source?: ResearchSource | null;
  abstract?: string | null;
  year?: number | null;
  createdAt?: string | Date;
}

interface ResearchProps {
  cloudResearch?: any;
  cloudExtractions?: VaultItem[];
}

const RESULT_SOURCES: ResearchSource[] = ['pubmed', 'europepmc', 'crossref', 'cochrane', 'scopus', 'sciencedirect'];

const SOURCE_LABEL: Record<AnySource, string> = {
  pubmed: 'PubMed',
  europepmc: 'Europe PMC',
  crossref: 'Crossref',
  cochrane: 'Cochrane',
  scopus: 'Scopus',
  sciencedirect: 'ScienceDirect',
  clinicalkey: 'ClinicalKey',
  googlescholar: 'Google Scholar',
};

// Each source maps to a distinct --w09-* token so the palette stays consistent
// across liveries (no new colors). Cochrane → danger (high-signal reviews);
// Scopus → tertiary (the gold sub-color, mirrors Elsevier's warm hue under Monza).
const SOURCE_COLOR: Record<AnySource, string> = {
  pubmed: 'var(--w09-accent-primary)',
  europepmc: 'var(--w09-success)',
  crossref: 'var(--w09-accent-secondary)',
  cochrane: 'var(--w09-danger)',
  scopus: 'var(--w09-accent-tertiary)',
  sciencedirect: 'var(--w09-focus-ring)',
  clinicalkey: 'var(--w09-text-muted)',
  googlescholar: 'var(--w09-text-muted)',
};

/** Build all idempotency keys for a result/extraction (mirrors server logic). */
function keysFor(r: { doi?: string | null; pmid?: string | null; title: string }): string[] {
  const keys: string[] = [];
  if (r.doi) keys.push(`doi:${r.doi}`);
  if (r.pmid) keys.push(`pmid:${r.pmid}`);
  if (r.title) keys.push(`title:${r.title.toLowerCase()}`);
  return keys;
}

/** Quick-link URLs for the prominent ClinicalKey / Google Scholar / SRMA Engine
 *  buttons. ClinicalKey uses the old (simpler) search URL the user prefers. */
type QuickLinkId = 'clinicalkey' | 'googlescholar' | 'srma';
function quickLinkUrl(service: QuickLinkId, query: string): string {
  const q = encodeURIComponent(query.trim());
  switch (service) {
    case 'clinicalkey':
      return q ? `https://www.clinicalkey.com/#!/search/${q}` : 'https://www.clinicalkey.com';
    case 'googlescholar':
      return q ? `https://scholar.google.com/scholar?q=${q}` : 'https://scholar.google.com';
    case 'srma':
      // User's own SRMA telemetry app — portal, not query-aware.
      return 'https://vestrippn-srma-telemetry.vercel.app';
  }
}
const QUICK_LINKS: { id: QuickLinkId; icon: string; label: string }[] = [
  { id: 'clinicalkey', icon: '🔑', label: 'ClinicalKey' },
  { id: 'googlescholar', icon: '🎓', label: 'Google Scholar' },
  { id: 'srma', icon: '🤖', label: 'SRMA Engine' },
];

export default function ResearchClient({ cloudResearch, cloudExtractions = [] }: ResearchProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  /* ── Multi-source search state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /* ── Source filters (from /api/research/sources) ── */
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [activeSources, setActiveSources] = useState<Set<ResearchSource>>(
    new Set(RESULT_SOURCES),
  );

  /* ── Vault (hydrated from server-fetched extractions; augmented on save) ── */
  const [vault, setVault] = useState<VaultItem[]>(cloudExtractions);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(() => {
    const s = new Set<string>();
    cloudExtractions.forEach((ext) =>
      keysFor({ doi: ext.doi, pmid: ext.pmid, title: ext.title }).forEach((k) => s.add(k)),
    );
    return s;
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [openAbstracts, setOpenAbstracts] = useState<Set<string>>(new Set());

  /* ── Mount + load source availability ── */
  useEffect(() => {
    setIsMounted(true);
    (async () => {
      try {
        const r = await fetch('/api/research/sources');
        if (!r.ok) throw new Error(`sources ${r.status}`);
        setSources((await r.json()) as SourceStatus[]);
      } catch (e) {
        console.error('[research] sources load failed', e);
      }
    })();
  }, []);

  /* ── Debounced multi-source search (~400ms after typing stops) ── */
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchData(null);
      setSearchError(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    setSearchError(null);
    const handle = setTimeout(async () => {
      try {
        const r = await fetch(`/api/research/search?q=${encodeURIComponent(q)}&limit=20`);
        if (!r.ok) throw new Error(`search ${r.status}`);
        const data = (await r.json()) as SearchResponse;
        setSearchData(data);
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : 'Search failed');
        setSearchData(null);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const isSaved = (r: { doi?: string | null; pmid?: string | null; title: string }) =>
    keysFor(r).some((k) => savedKeys.has(k));

  const idempotencyKey = (r: { doi?: string | null; pmid?: string | null; title: string }): string =>
    r.doi ? `doi:${r.doi}` : r.pmid ? `pmid:${r.pmid}` : `title:${r.title.toLowerCase()}`;

  const toggleSource = (s: ResearchSource) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleAbstract = (id: string) => {
    setOpenAbstracts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveResult = async (r: SearchResult) => {
    const key = idempotencyKey(r);
    if (savedKeys.has(key) || savingKey) return;
    setSavingKey(key);
    try {
      const res = await fetch('/api/research/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r),
      });
      if (!res.ok) throw new Error(`extract ${res.status}`);
      const data = (await res.json()) as { extraction: VaultItem; created: boolean };
      setSavedKeys((prev) => {
        const next = new Set(prev);
        keysFor(r).forEach((k) => next.add(k));
        return next;
      });
      // Add to local vault if it's a new row (server returns existing on dupes).
      if (data.created) setVault((prev) => [data.extraction, ...prev]);
    } catch (e) {
      console.error('[research] save failed', e);
    } finally {
      setSavingKey(null);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-amber-400/30 via-orange-400/25 to-rose-400/20 dark:from-amber-600/20 dark:via-orange-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-blue-400/25 via-cyan-400/20 to-teal-300/25 dark:from-blue-600/15 dark:via-cyan-600/10 dark:to-teal-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-amber-300/20 to-cyan-300/20 dark:from-amber-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>
          <BrandMark />
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        <NavRail active="Research" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-14">
            
            <HubIntro
              eyebrow="Multi-Source Research Engine"
              title="Search, save, and screen"
              titleAccent="faster"
              description="The Research Hub federates literature discovery, deep links, saved extractions, and review workflow telemetry into one SRMA-ready cockpit."
              primaryHref="#literature-search"
              primaryLabel="Search Literature"
              secondaryHref="https://vestrippn-srma-telemetry.vercel.app"
              secondaryLabel="SRMA Engine ↗"
              chips={['PubMed', 'Europe PMC', 'Scopus', 'ScienceDirect']}
              panelTitle="Research Ops"
              panelSubtitle="Research pipeline: SRMA extraction"
              contextLabel="Pipeline: Brugada SRMA"
              metrics={[
                { label: 'Sources', value: '7' },
                { label: 'Vault', value: `${cloudExtractions.length}` },
                { label: 'Mode', value: 'SRMA' },
              ]}
              capabilities={[
                { icon: '🔎', title: 'Federated Discovery', desc: 'Search biomedical sources and deep-link tools without breaking your flow.' },
                { icon: '📦', title: 'Extraction Vault', desc: 'Save rich paper metadata into the research vault for review continuity.' },
              ]}
              hub="research"
            />

            <MissionBlock
              accent="cyan"
              title="Brugada SRMA · Extraction Pipeline"
              detail="Screening and extraction are live — keep the pipeline moving."
              cta={{ label: 'Launch SRMA ↗', href: 'https://vestrippn-srma-telemetry.vercel.app', external: true }}
            />

            <CockpitIntelligencePanel
              hub="research"
              contextItems={[
                { label: 'Current pipeline', value: 'Brugada SRMA' },
                { label: 'Saved papers', value: `${cloudExtractions.length}` },
                { label: 'Sources', value: `${RESULT_SOURCES.length} APIs` },
              ]}
            />

            {/* SECTOR 1: MULTI-SOURCE LITERATURE SEARCH */}
            <motion.section
              id="literature-search"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] shadow-[var(--w09-shadow)] overflow-hidden text-[color:var(--w09-text)] relative"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-6 lg:px-8 pt-6">
                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--w09-accent-primary)' }} />
                <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">Multi-Source Literature Search</h3>
                {searchData && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">
                    {searchData.results.length} merged · deduped · year-sorted
                  </span>
                )}
              </div>

              {/* Sticky search bar */}
              <div className="sticky top-0 z-30 px-6 lg:px-8 py-4 bg-[var(--w09-surface)] border-b border-[color:var(--w09-border)] mt-4 backdrop-blur-md backdrop-saturate-150">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search PubMed, Europe PMC, Crossref / Cochrane, Scopus, ScienceDirect…"
                    className="w-full bg-[var(--w09-surface-raised)] border border-[color:var(--w09-border)] rounded-full pl-12 pr-14 py-3.5 text-[14px] text-[color:var(--w09-text)] outline-none transition placeholder:text-[color:var(--w09-text-muted)] focus:ring-2 focus:ring-[color:var(--w09-focus-ring)]"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[color:var(--w09-text-muted)]">🔎</span>
                  {searching && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-[color:var(--w09-text-muted)]">Searching…</span>
                  )}
                  {!searching && searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[color:var(--w09-text-muted)] hover:text-[color:var(--w09-text)] hover:bg-[var(--w09-surface)]"
                    >✕</button>
                  )}
                </div>
              </div>

              {/* Quick Links — prominent external buttons (ClinicalKey · G-Scholar · SRMA Engine) */}
              <div className="px-6 lg:px-8 pt-4 flex flex-wrap gap-2.5">
                {QUICK_LINKS.map((link) => {
                  const href = quickLinkUrl(link.id, searchQuery);
                  return (
                    <a
                      key={link.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={searchQuery.trim() && link.id !== 'srma' ? `Open “${searchQuery}” on ${link.label}` : `Open ${link.label}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] hover:bg-[var(--w09-surface)] px-4 py-2.5 text-[12px] font-bold text-[color:var(--w09-text)] transition-all active:scale-95 shadow-sm"
                    >
                      <span className="text-lg leading-none">{link.icon}</span>
                      {link.label}
                      <span className="text-[10px] uppercase tracking-widest text-[color:var(--w09-text-muted)] ml-0.5">↗</span>
                    </a>
                  );
                })}
              </div>

              {/* Source filter chips (API sources — toggleable) */}
              <div className="px-6 lg:px-8 pt-4 flex flex-wrap items-center gap-2">
                {RESULT_SOURCES.map((s) => {
                  // Cochrane is synthesized (rides on Crossref) — always treat as available.
                  const meta = sources.find((x) => x.source === s);
                  const available = s === 'cochrane' ? true : meta ? meta.available : true;
                  const active = activeSources.has(s);
                  const color = SOURCE_COLOR[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => available && toggleSource(s)}
                      disabled={!available}
                      aria-pressed={active}
                      title={!available ? meta?.reason : `Toggle ${SOURCE_LABEL[s]}`}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition ${
                        !available
                          ? 'border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] text-[color:var(--w09-text-muted)] opacity-60 cursor-not-allowed'
                          : active
                            ? ''
                            : 'border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] text-[color:var(--w09-text-muted)] hover:bg-[var(--w09-surface)]'
                      }`}
                      style={
                        active && available
                          ? {
                              color,
                              borderColor: color,
                              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                      {SOURCE_LABEL[s]}
                      {!available && <span className="text-[9px] opacity-80">(set up key)</span>}
                    </button>
                  );
                })}
              </div>

              {/* Channel status strip — per-source outcome */}
              {searchData && searchData.channels.length > 0 && (
                <div className="px-6 lg:px-8 pt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">
                  {searchData.channels.map((ch) => {
                    const color = SOURCE_COLOR[ch.source];
                    const dotColor = !ch.ok
                      ? 'var(--w09-danger)'
                      : ch.count > 0
                        ? 'var(--w09-success)'
                        : 'var(--w09-text-muted)';
                    return (
                      <span
                        key={ch.source}
                        title={!ch.ok ? ch.error ?? 'Channel error' : `${SOURCE_LABEL[ch.source]} returned ${ch.count}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-2.5 py-1"
                        style={!ch.ok ? { borderColor: 'var(--w09-danger)', color: 'var(--w09-danger)' } : undefined}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                        <span style={ch.ok ? { color } : undefined}>{SOURCE_LABEL[ch.source]}</span>
                        <span>{ch.ok ? (ch.count > 0 ? `✓ ${ch.count}` : '—') : 'ERR'}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Elsevier env hint — fires only when BOTH Scopus and ScienceDirect are unavailable */}
              {(() => {
                const scopus = sources.find((s) => s.source === 'scopus');
                const sd = sources.find((s) => s.source === 'sciencedirect');
                if (scopus && sd && !scopus.available && !sd.available) {
                  return (
                    <div className="mx-6 lg:mx-8 mt-4 rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-4 py-2.5 text-[11px] text-[color:var(--w09-text-muted)]">
                      Set <code className="font-mono text-[color:var(--w09-text)]">ELSEVIER_API_KEY</code> in Vercel to enable Scopus + ScienceDirect.
                    </div>
                  );
                }
                return null;
              })()}

              {/* Results / empty / error */}
              <div className="px-6 lg:px-8 py-6 space-y-3">
                {!searchQuery.trim() && (
                  <div className="rounded-[var(--w09-radius)] border border-dashed border-[color:var(--w09-border)] px-6 py-10 text-center text-sm text-[color:var(--w09-text-muted)]">
                    Search the literature across PubMed, Europe PMC, Cochrane, Scopus, ScienceDirect — open ClinicalKey & Scholar in a tab.
                  </div>
                )}

                {searchError && (
                  <div className="rounded-[var(--w09-radius)] border px-4 py-3 text-sm" style={{ borderColor: 'var(--w09-danger)', color: 'var(--w09-danger)', backgroundColor: 'var(--w09-surface-raised)' }}>
                    Search failed: {searchError}
                  </div>
                )}

                {searchQuery.trim() && !searching && searchData && (() => {
                  const filtered = searchData.results.filter((r) => activeSources.has(r.source));
                  if (filtered.length === 0) {
                    const scholar = searchData.deepLinks.find((d) => d.source === 'googlescholar');
                    const ck = searchData.deepLinks.find((d) => d.source === 'clinicalkey');
                    return (
                      <div className="rounded-[var(--w09-radius)] border border-dashed border-[color:var(--w09-border)] px-6 py-10 text-center text-sm text-[color:var(--w09-text-muted)]">
                        No results. Try a broader query, or open it in{' '}
                        {scholar && (
                          <a className="underline" href={scholar.url} target="_blank" rel="noopener noreferrer">Scholar</a>
                        )}
                        {' / '}
                        {ck && (
                          <a className="underline" href={ck.url} target="_blank" rel="noopener noreferrer">ClinicalKey</a>
                        )}.
                      </div>
                    );
                  }
                  return filtered.map((r) => {
                    const key = r.doi ?? r.pmid ?? r.externalId;
                    const open = openAbstracts.has(key);
                    const idKey = idempotencyKey(r);
                    const saved = savedKeys.has(idKey) || isSaved(r);
                    const saving = savingKey === idKey;
                    const color = SOURCE_COLOR[r.source];
                    return (
                      <article
                        key={key}
                        className="group rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] p-4 lg:p-5 transition hover:shadow-[var(--w09-shadow)]"
                      >
                        <div className="flex items-start gap-3">
                          {/* Source pill */}
                          <span
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border bg-[var(--w09-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                            style={{ color, borderColor: color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                            {SOURCE_LABEL[r.source]}
                          </span>

                          <div className="min-w-0 flex-1">
                            {r.url ? (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[15px] font-bold text-[color:var(--w09-text)] leading-snug hover:underline"
                              >
                                {r.title}
                              </a>
                            ) : (
                              <div className="text-[15px] font-bold text-[color:var(--w09-text)] leading-snug">{r.title}</div>
                            )}

                            {(r.authors || r.journal || r.year) && (
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[color:var(--w09-text-muted)]">
                                {r.authors && <span className="truncate max-w-full">{r.authors}</span>}
                                {(r.journal || r.year) && (
                                  <span className="italic">
                                    {r.journal}{r.journal && r.year ? ' · ' : ''}{r.year ?? ''}
                                  </span>
                                )}
                              </div>
                            )}

                            {r.abstract && (
                              <button
                                type="button"
                                onClick={() => toggleAbstract(key)}
                                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)] hover:text-[color:var(--w09-text)]"
                              >
                                {open ? 'Hide abstract −' : 'Show abstract +'}
                              </button>
                            )}
                            {r.abstract && open && (
                              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-[color:var(--w09-text)]">{r.abstract}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => saveResult(r)}
                            disabled={saved || saving}
                            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[color:var(--w09-border)] bg-[var(--w09-surface)] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--w09-text-muted)] hover:text-[color:var(--w09-text)] disabled:cursor-not-allowed"
                            style={saved ? { color: 'var(--w09-success)', borderColor: 'var(--w09-success)' } : undefined}
                            title={saved ? 'Already in your vault' : 'Save to vault'}
                          >
                            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </article>
                    );
                  });
                })()}
              </div>
            </motion.section>

            {/* SECTOR 2: VAULT — saved extractions (server-fetched, augmented on save) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] shadow-[var(--w09-shadow)] p-6 lg:p-8 text-[color:var(--w09-text)]"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--w09-accent-tertiary)' }} />
                <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">Vault · {vault.length} saved</h3>
              </div>
              {vault.length === 0 ? (
                <div className="rounded-[var(--w09-radius)] border border-dashed border-[color:var(--w09-border)] px-6 py-8 text-center text-sm text-[color:var(--w09-text-muted)]">
                  Save results to keep them here. Idempotent on DOI → PMID → title.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {vault.slice(0, 20).map((v) => {
                    const color = v.source ? SOURCE_COLOR[v.source as ResearchSource] : 'var(--w09-text-muted)';
                    return (
                      <li key={v.id} className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] p-3 lg:p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className="shrink-0 inline-flex items-center gap-1 rounded-full border bg-[var(--w09-surface)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                            style={{ color, borderColor: color }}
                          >
                            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
                            {v.source ? SOURCE_LABEL[v.source as ResearchSource] : 'Saved'}
                          </span>
                          <div className="min-w-0 flex-1">
                            {v.url ? (
                              <a href={v.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[color:var(--w09-text)] hover:underline">
                                {v.title}
                              </a>
                            ) : (
                              <div className="font-bold text-[color:var(--w09-text)]">{v.title}</div>
                            )}
                            {(v.authors || v.journal || v.year) && (
                              <div className="text-[11px] text-[color:var(--w09-text-muted)]">
                                {v.authors && <span>{v.authors}</span>}
                                {(v.journal || v.year) && (
                                  <span className="italic"> · {v.journal}{v.journal && v.year ? ' ' : ''}{v.year ?? ''}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  {vault.length > 20 && (
                    <li className="text-center text-[11px] text-[color:var(--w09-text-muted)]">+ {vault.length - 20} more saved earlier</li>
                  )}
                </ul>
              )}
            </motion.section>

            {/* SECTOR 3: COVIDENCE WORKSPACE */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] overflow-x-auto custom-scrollbar no-scrollbar cursor-default"
            >
               <div className="flex items-center gap-2 mb-8 px-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Review Matrix</h3>
               </div>
               <div className="min-w-[800px] lg:min-w-0">
                 <CovidenceBoard 
                   initialTitle={cloudResearch?.title}
                   initialStats={cloudResearch ? { 
                     screening: cloudResearch.screening, 
                     fullText: cloudResearch.fullText, 
                     extraction: cloudResearch.extraction 
                   } : undefined}
                 />
               </div>
            </motion.section>

            {/* 📋 SECTOR 4: CLINICAL SIMULATION GUIDE (BRUGADA SYNDROME) */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden cursor-default"
            >
              <div className="flex items-center gap-2 mb-6 px-2">
                <span className="w-1.5 h-4 bg-pink-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Clinical Application Guide</h3>
              </div>
              
              {/* Module Header */}
              <div className="mb-8 border-b border-black/5 dark:border-white/10 pb-6 px-2 relative z-10">
                 <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-3">CASE STUDY ANALYSIS</h2>
                 <div className="flex flex-wrap items-center gap-3 mb-4">
                   <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-pink-500/20 shadow-sm">Brugada Syndrome</span>
                   <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full shadow-sm">Scenario Guide</span>
                 </div>
                 <p className="text-[14px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed max-w-3xl">
                   เจาะลึกการนำทรัพยากรไปใช้จริงในการวิเคราะห์เคสผู้ป่วย Brugada Syndrome (โรคไหลตาย) เพื่อจำลองการทำ Case Discussion ในระดับคลินิก (Clinical Year).
                 </p>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative z-10">
                
                {/* Intro Card (Case Profile) */}
                <div className="md:col-span-2 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-6 transition-colors duration-700 hover:bg-black/10 dark:hover:bg-white/10">
                   <div className="text-[12px] font-black text-neutral-800 dark:text-white uppercase tracking-widest mb-4">Case Information (Full Version)</div>
                   
                   <div className="space-y-4">
                     <div>
                       <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">History</span>
                       <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed ml-1">
                         <strong>Patient:</strong> 38-year-old Thai male, no prior structural heart disease.<br/>
                         <strong>Chief Complaint:</strong> Brought to ER after an episode of unexplained syncope during rest/sleep. Wife reported episodes of nocturnal agonal respiration (gasping) before waking up confused.<br/>
                         <strong>Family Hx:</strong> Uncle died suddenly in his sleep at age 42 (Sudden Unexplained Death Syndrome - SUDS).
                       </p>
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                         <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">Condition</span>
                         <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium ml-1">Post-syncopal state, hemodynamically stable. No chest pain.</p>
                       </div>
                       <div className="flex-1">
                         <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">Marker</span>
                         <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium ml-1">High index of suspicion for primary electrical disease.</p>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Step 1 */}
                <div className="flex flex-col bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-blue-200 dark:border-blue-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[13px] font-black shadow-sm">1</span>
                     <h4 className="text-[14px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-wide">Lab & ECG Interpretation</h4>
                  </div>
                  <ul className="text-[13px] font-medium text-blue-800 dark:text-blue-200 leading-relaxed space-y-2 list-disc pl-5 flex-1">
                    <li><strong className="text-blue-900 dark:text-white">12-Lead ECG:</strong> Shows <span className="underline decoration-blue-400 decoration-2 font-bold">Type 1 Brugada pattern</span> in right precordial leads (V1-V2). Coved ST-segment elevation ≥ 2mm followed by a negative T wave.</li>
                    <li><strong className="text-blue-900 dark:text-white">Cardiac Biomarkers:</strong> High-sensitivity Troponin T is normal (rules out acute STEMI/myocarditis).</li>
                    <li><strong className="text-blue-900 dark:text-white">Electrolytes:</strong> Potassium, Magnesium, and Calcium levels are normal (rules out acquired ST-elevation).</li>
                  </ul>
                  
                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-blue-100 dark:border-blue-500/10 text-neutral-700 dark:text-neutral-300">🩺 UpToDate</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-blue-100 dark:border-blue-500/10 text-neutral-700 dark:text-neutral-300">🔑 ClinicalKey</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-amber-200 dark:border-amber-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[13px] font-black shadow-sm">2</span>
                     <h4 className="text-[14px] font-black text-amber-900 dark:text-amber-100 uppercase tracking-wide">Symptoms & Differential</h4>
                  </div>
                  <div className="space-y-3 flex-1">
                    <p className="text-[13px] font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                      <strong>Key Symptom:</strong> Syncope typically occurs during rest, sleep, or vagal predominance, unlike exertion-induced syncope (e.g., HCM, LQTS).
                    </p>
                    <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20 text-[12px] font-medium text-amber-900 dark:text-amber-100">
                      <strong>Differential Diagnosis (DDx):</strong>
                      <ul className="list-disc pl-4 mt-1">
                        <li>Arrhythmogenic Right Ventricular Cardiomyopathy (ARVC)</li>
                        <li>Acute Anterior/Septal STEMI</li>
                        <li>Early Repolarization Syndrome</li>
                        <li>Acute Pulmonary Embolism</li>
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-amber-100 dark:border-amber-500/10 text-neutral-700 dark:text-neutral-300">🧬 ScienceDirect</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-amber-100 dark:border-amber-500/10 text-neutral-700 dark:text-neutral-300">🏛️ Scopus</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-emerald-200 dark:border-emerald-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[13px] font-black shadow-sm">3</span>
                     <h4 className="text-[14px] font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">Treatment & Management</h4>
                  </div>
                  <ul className="text-[13px] font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed space-y-3 flex-1">
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Immediate Protocol:</strong> Admit to CCU for continuous telemetry monitoring. Treat any fever aggressively with antipyretics (fever unmasks Brugada ECG and triggers VF).</li>
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Electrical Storm Mgmt:</strong> IV Isoproterenol infusion or oral Quinidine to normalize the ST segment.</li>
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Definitive Treatment:</strong> Implantable Cardioverter Defibrillator (ICD) is the only proven therapy to prevent sudden cardiac death in symptomatic patients.</li>
                  </ul>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-emerald-100 dark:border-emerald-500/10 text-neutral-700 dark:text-neutral-300">📚 Cochrane</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-emerald-100 dark:border-emerald-500/10 text-neutral-700 dark:text-neutral-300">🩺 UpToDate</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-purple-200 dark:border-purple-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[13px] font-black shadow-sm">4</span>
                     <h4 className="text-[14px] font-black text-purple-900 dark:text-purple-100 uppercase tracking-wide">Mechanism & Understanding</h4>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-purple-800 dark:text-purple-200 leading-relaxed mb-3">
                      <strong>Pathophysiology:</strong> Brugada is primarily an autosomal dominant genetic channelopathy.
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-200 dark:border-purple-500/20 text-[12px] font-medium text-purple-900 dark:text-purple-100">
                       Mutation in the <strong>SCN5A</strong> gene → Loss of function of the cardiac sodium channel (I<sub>Na</sub>) → Heterogeneity of action potentials between the endocardium and epicardium in the Right Ventricular Outflow Tract (RVOT) → Phase 2 reentry → Polymorphic VT / Ventricular Fibrillation (VF).
                    </div>
                  </div>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">🏥 Embase</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">📘 SpringerLink</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">🏛️ Cambridge</span>
                  </div>
                </div>

              </div>
            </motion.section>

          </div>
        </main>

        <MobileHubNav active="Research" />

      </div>
    </div>
  );
}
