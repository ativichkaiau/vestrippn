import type { MetadataRoute } from 'next';

// Public portfolio pages are crawlable; APIs and the private hubs are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/academics', '/workspace', '/analytics', '/fitness', '/ielts', '/tools', '/das', '/auth/'],
    },
    sitemap: 'https://vestrippn.vercel.app/sitemap.xml',
  };
}
