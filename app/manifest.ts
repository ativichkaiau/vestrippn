import type { MetadataRoute } from 'next';

// Web app manifest — makes VEStriPPN installable (home screen / desktop PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VEStriPPN 3.0',
    short_name: 'VEStriPPN',
    description: 'Personal telemetry, mission control, and Claude-ready command surfaces.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#07090c',
    theme_color: '#07090c',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/manifest-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/manifest-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  };
}
