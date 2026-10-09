import type { MetadataRoute } from 'next';
import { LOGS, OBJECTS, PROJECTS, SYSTEMS } from '@/lib/system/registry';

const BASE = 'https://vestrippn.vercel.app';

// The public portfolio. Private hubs redirect to sign-in and are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['/', '/identity', '/systems', '/projects', '/medicine', '/research', '/logs', '/garage', '/archive', '/contact', '/learn/cases', '/learn/ielts', '/legal'];
  return [
    ...pages.map((path) => ({ url: `${BASE}${path}`, lastModified: now, priority: path === '/' ? 1 : 0.7 })),
    ...SYSTEMS.map((node) => ({ url: `${BASE}/systems/${node.slug}`, lastModified: now, priority: 0.5 })),
    ...PROJECTS.map((node) => ({ url: `${BASE}/projects/${node.slug}`, lastModified: now, priority: 0.5 })),
    ...LOGS.map((log) => ({ url: `${BASE}/logs/${log.slug}`, lastModified: now, priority: 0.4 })),
    ...OBJECTS.map((object) => ({ url: `${BASE}/garage/${object.slug}`, lastModified: now, priority: 0.5 })),
  ];
}
