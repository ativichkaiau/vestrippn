import { ImageResponse } from 'next/og';
import { IDENTITY } from '@/lib/system/identity';
import { PROJECTS, SYSTEMS } from '@/lib/system/registry';

/* The social card for every page: the masthead and a slice of the tree, in the
   environment's own colours. next/og renders it with Geist by default. */

export const alt = 'VESTRIPPN — personal systems environment';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRANCHES = ['identity/', 'medicine/', 'research/', 'studyex_medeetomihub/', 'projects/', 'logs/', 'garage/', 'archive/'];
const ROW = 34;
const LINE = '#3d424a';

/* The tree's ├── and └── drawn as bars: Geist has no box-drawing glyphs, so
   as text they would render as empty boxes. */
function Connector({ last }: { last: boolean }) {
  return (
    <div style={{ display: 'flex', position: 'relative', width: 40, height: ROW }}>
      <div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: last ? ROW / 2 + 1 : ROW, background: LINE }} />
      <div style={{ position: 'absolute', left: 6, top: ROW / 2 - 1, width: 24, height: 2, background: LINE }} />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#08090a',
          backgroundImage: 'linear-gradient(#121417 1px, transparent 1px), linear-gradient(90deg, #121417 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          color: '#f0f1ed',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3, color: '#7a8089' }}>
          <span>VESTRIPPN / ROOT</span>
          <span>{`${SYSTEMS.length} SYSTEMS · ${PROJECTS.length} PROJECTS`}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 148, letterSpacing: 6, lineHeight: 1 }}>
            <span>VESTRIPPN</span>
            <span style={{ color: '#6a8bff' }}>_</span>
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 34, color: '#9a9fa6' }}>personal systems environment</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 22, color: '#7a8089' }}>
            {BRANCHES.slice(0, 4).map((branch, i) => (
              <div key={branch} style={{ display: 'flex', alignItems: 'center', height: ROW }}>
                <Connector last={i === 3} />
                <span>{branch}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 26, color: '#d7d9d6' }}>
            <span>{IDENTITY.handle}</span>
            <span style={{ fontSize: 22, color: '#7a8089' }}>{`${IDENTITY.focus.join(' / ')} · ${IDENTITY.location}`}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
