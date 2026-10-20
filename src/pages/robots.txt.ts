import type { APIRoute } from 'astro';
import { withBase } from '../lib/url.ts';
// The sitemap line uses the host that serves the file (the real domain, or the GitHub Pages copy).
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('sitemap-index.xml'), site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
