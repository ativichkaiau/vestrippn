import { ImageResponse } from 'next/og';

// Apple touch icon (home screen) — the VESTRIPPN teal "V" coin, matching the
// header brand mark and app/icon.svg. iOS applies its own corner mask, so the
// tile is full-bleed.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #3fe9da 0%, #00bdae 52%, #00a094 100%)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 18 L27 18 L32 34 L37 18 L48 18 L34.5 47 L29.5 47 Z" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
