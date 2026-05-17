import type { MetadataRoute } from 'next';
import { content } from '@/content/data';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/arcade',
    '/inventory',
    '/levels',
    '/scores',
    '/play',
    '/comms',
    '/achievements',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.7,
  }));

  const cabinetRoutes: MetadataRoute.Sitemap = content.projects.map((p) => ({
    url: `${base}/cabinet/${p.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...cabinetRoutes];
}
