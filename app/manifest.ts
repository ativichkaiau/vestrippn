import type { MetadataRoute } from 'next';

// Web app manifest — makes VESTRIPPN installable (home screen / desktop PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VESTRIPPN',
    short_name: 'VESTRIPPN',
    description: 'Personal telemetry, mission control, and Claude-ready command surfaces.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#07090c',
    theme_color: '#07090c',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/vestrippn-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/vestrippn-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
