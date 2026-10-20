import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rm } from 'node:fs/promises';
import site from './src/site.config.ts';

// PAGES_BASE / PAGES_SITE are set only for the GitHub Pages build (see .github/workflows/pages.yml).
// Normal builds use the real domain at the root.
const bingemind = site.bingemind;
// The Bingemind root owns robots.txt, so this mode does not emit one.
const dropRobots = { name: 'drop-robots', hooks: { 'astro:build:done': async ({ dir }) => {
  if (bingemind) await rm(new URL('robots.txt', dir), { force: true });
} } };

// Contact and Terms are thin pages with noindex, so they stay out of the sitemap.
const noindexFilter = (page) => !/\/(contact|terms)\/$/.test(page);

export default defineConfig({
  site: bingemind ? 'https://bingemind.com' : process.env.PAGES_SITE || 'https://bingemind.com',
  base: bingemind ? `/dpi-changer/` : process.env.PAGES_BASE || '/',
  outDir: bingemind ? 'dist-bingemind' : 'dist',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap({ filter: noindexFilter }), dropRobots],
  vite: { plugins: [tailwindcss()] },
});
