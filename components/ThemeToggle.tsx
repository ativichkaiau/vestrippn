'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { setLowPowerMode } from './useLowPower';
import { attachDepth, depthAllowed } from './w100/useDepth';
import { MODE_LABEL, serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme';
import { swapLivery } from '@/lib/w100/livery-swap';
import { LIVERIES, LIVERY_CATALOG, LIVERY_TEAMS, MODES, type Livery, type LiveryDefinition, type Mode, type ThemePhase } from '@/lib/liveries';
import LiveryScene from './LiveryScene';

// The header renders this on every page; the 3D mark only loads with the garage.
// It holds its grid slot while loading so the garage copy doesn't jump.
const Mark3D = dynamic(() => import('./w100/Mark3D'), {
  ssr: false,
  loading: () => <div className="w100-garage-stage" aria-hidden="true" />,
});

type Team = typeof LIVERY_TEAMS[number]['id'];
const PHASE_ICON: Record<ThemePhase, string> = { day: '☀', twilight: '◒', night: '☾' };
const subscribeMounted = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;
const TEAM_DESCRIPTION: Record<Team, string> = {
  mercedes: 'Silver in daylight. Graphite at dusk. Carbon after dark.',
  williams: 'Four eras from Grove. One unmistakable racing line.',
  redbull: 'Championship colours, a new era, and special editions.',
  drivers: 'Personal colours from the people behind the wheel.',
};

function LiveryPreview({ livery }: { livery: Livery }) {
  const definition = LIVERY_CATALOG[livery];
  const style = {
    '--preview-ground': definition.palette.canvas, '--preview-text': definition.palette.text,
    '--preview-stripe': definition.stripe, '--preview-color': definition.colors[0],
  } as CSSProperties;
  return <span className="livery-preview" data-design={livery} style={style} aria-hidden="true">
    <span className="livery-preview-grain" /><span className="livery-preview-disc" />
    <span className="livery-preview-ribbon" />
    <span className="livery-preview-year">{definition.year}</span>
    <span className="livery-preview-chassis">{definition.chassis}</span>
  </span>;
}

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribeMounted, clientMounted, serverMounted);
  const snapshot = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot);
  const [livery, mode, phase, power] = snapshot.split('|') as [Livery, Mode, ThemePhase, string];
  const [team, setTeam] = useState<Team>('mercedes');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Livery | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const definition = LIVERY_CATALOG[livery];
  const label = livery === 'normal' ? mode === 'auto' ? `Auto · ${MODE_LABEL[phase]}` : MODE_LABEL[mode] : `${definition.name} · ${definition.year}`;
  const entries = LIVERIES.filter(id => LIVERY_CATALOG[id].team === team);
  const lowPower = power === '1';

  function openPicker() {
    setTeam(definition.team); setNotice(''); setPreview(null);
    dialogRef.current?.showModal();
    setOpen(true);
  }
  function choose(id: Livery, selectedMode?: Mode) {
    // W100: a site-wide 3D swap event rather than an instant recolour.
    void swapLivery(id, selectedMode);
    setPreview(null);
    setNotice(`${LIVERY_CATALOG[id].name}${selectedMode ? ` · ${MODE_LABEL[selectedMode]}` : ` · ${LIVERY_CATALOG[id].year}`} applied`);
  }
  const shown = preview ?? livery;
  const shownDefinition = LIVERY_CATALOG[shown];

  // Livery cards tilt like every other panel; the dialog is portaled outside
  // the route shell, so it gets its own engine while open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || !depthAllowed()) return;
    return attachDepth(dialog);
  }, [open]);

  return <>
    <button type="button" onClick={openPicker} className="livery-trigger" aria-label={`Choose livery. Current: ${label}`} aria-haspopup="dialog" title="Choose livery">
      <span className="livery-trigger-swatch" style={{ background: definition.stripe }} aria-hidden="true" />
      <span className="livery-trigger-copy"><span>Livery</span><strong>{livery === 'normal' ? MODE_LABEL[mode] : definition.name}</strong></span>
      <span className="livery-trigger-icon" aria-hidden="true">{livery === 'normal' ? PHASE_ICON[phase] : '⌄'}</span>
    </button>
    {mounted && createPortal(<dialog ref={dialogRef} className="livery-dialog" aria-labelledby={titleId} onClose={() => { setOpen(false); setPreview(null); }} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="livery-dialog-inner">
        <header className="livery-dialog-header">
          <div><p className="livery-eyebrow">W100 · The livery garage</p><h2 id={titleId}>Pick your racing colours.</h2></div>
          <button type="button" className="livery-close" onClick={() => dialogRef.current?.close()} aria-label="Close livery collection" autoFocus>×</button>
        </header>
        <nav className="livery-teams" aria-label="Livery teams">
          {LIVERY_TEAMS.map(item => <button type="button" key={item.id} aria-pressed={team === item.id} onClick={() => setTeam(item.id)}>{item.name}<span>{LIVERIES.filter(id => LIVERY_CATALOG[id].team === item.id).length}</span></button>)}
        </nav>
        <div className="livery-dialog-scroll custom-scrollbar">
          <section className="w100-garage" data-previewing={preview && preview !== livery ? '' : undefined} aria-label="Livery preview" style={{ '--w100-garage-stripe': shownDefinition.stripe } as CSSProperties}>
            {open && <Mark3D livery={shown} className="w100-garage-stage" label={`VESTRIPPN mark in ${shownDefinition.name} livery`} />}
            <div className="w100-garage-copy" aria-live="polite">
              <p className="w100-garage-meta">{shownDefinition.year} · {shownDefinition.chassis}</p>
              <h3>{shownDefinition.name}</h3>
              <p>{shownDefinition.description}</p>
              <span className="w100-garage-stripe" aria-hidden="true" />
              <p className="w100-garage-hint">Drag to spin. Hover a livery to try it on; choose it to repaint everything.</p>
            </div>
          </section>
          {open && <LiveryScene compact className="livery-collection-scene" />}
          <p className="livery-team-description">{TEAM_DESCRIPTION[team]}</p>
          {team === 'mercedes' ? <>
            <div className="livery-mercedes-preview"><LiveryPreview livery="normal" /><div><p className="livery-eyebrow">2014 · F1 W05 Hybrid</p><h3>Silver Arrow</h3><p>Cool metal, a clean teal line, and the black theme you know.</p></div></div>
            <div className="livery-modes" aria-label="Mercedes lighting">
              {MODES.map(md => <button type="button" key={md} aria-pressed={livery === 'normal' && mode === md} onClick={() => choose('normal', md)} onPointerEnter={() => setPreview('normal')} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview('normal')} onBlur={() => setPreview(null)}><span aria-hidden="true">{md === 'auto' ? '◷' : PHASE_ICON[md]}</span><strong>{MODE_LABEL[md]}</strong><small>{md === 'auto' ? 'Follow the sun' : md === 'day' ? '2014 silver' : md === 'twilight' ? 'Graphite grey' : 'Original black'}</small></button>)}
            </div>
            <div className="livery-solar-note"><span aria-hidden="true">◷</span><p><strong>Auto follows the sun in Chiang Mai.</strong> Silver fades through grey around sunrise and sunset, then settles into carbon black. It updates while the app is open.</p></div>
            <div className="livery-day-track" aria-hidden="true"><span>Silver</span><span>Twilight</span><span>Carbon</span></div>
          </> : <>
            <div className="livery-grid">
              {entries.filter(id => !(LIVERY_CATALOG[id] as LiveryDefinition).special).map(id => <LiveryCard key={id} id={id} active={livery === id} onChoose={choose} onPreview={setPreview} />)}
            </div>
            {entries.some(id => (LIVERY_CATALOG[id] as LiveryDefinition).special) && <><h3 className="livery-section-title">Special editions <span>Race tributes & original designs</span></h3><div className="livery-grid">{entries.filter(id => (LIVERY_CATALOG[id] as LiveryDefinition).special).map(id => <LiveryCard key={id} id={id} active={livery === id} onChoose={choose} onPreview={setPreview} />)}</div></>}
          </>}
        </div>
        <footer className="livery-dialog-footer">
          <button type="button" role="switch" aria-checked={lowPower} className="livery-power" onClick={() => setLowPowerMode(!lowPower)}><span className="livery-switch" data-on={lowPower}><span /></span><span><strong>Low power</strong><small>Pause decorative motion</small></span></button>
          <p role="status" className="livery-notice">{notice || `Active · ${label}`}</p>
          <button type="button" className="livery-done" onClick={() => dialogRef.current?.close()}>Done</button>
        </footer>
      </div>
    </dialog>, document.body)}
  </>;
}

function LiveryCard({ id, active, onChoose, onPreview }: { id: Livery; active: boolean; onChoose: (id: Livery) => void; onPreview: (id: Livery | null) => void }) {
  const item = LIVERY_CATALOG[id];
  return <button type="button" className="livery-card" aria-pressed={active} aria-label={`${item.name}, ${item.year}`} onClick={() => onChoose(id)}
    onPointerEnter={() => onPreview(id)} onPointerLeave={() => onPreview(null)} onFocus={() => onPreview(id)} onBlur={() => onPreview(null)}>
    <LiveryPreview livery={id} />
    <span className="livery-card-copy"><span className="livery-card-name"><strong>{item.name}</strong>{active && <span className="livery-selected" aria-hidden="true">✓</span>}</span><span className="livery-card-description">{item.description}</span><span className="livery-card-finish">{item.finish} · {item.chassis}</span></span>
  </button>;
}
