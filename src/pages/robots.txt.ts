import type { APIRoute } from 'astro';
import site from '../site.config.ts';
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: https://${site.domain}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
