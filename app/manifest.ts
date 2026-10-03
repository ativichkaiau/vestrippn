import type { MetadataRoute } from 'next';

// Web app manifest — makes VESTRIPPN installable (home screen / desktop PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VESTRIPPN',
    short_name: 'VESTRIPPN',
    description: "The root environment for Kaiau's medicine, research, software and experiments.",
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    // Matches the dark-first shell (--bg-root) and the layout's theme-color.
    background_color: '#08090a',
    theme_color: '#08090a',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/vestrippn-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/vestrippn-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
