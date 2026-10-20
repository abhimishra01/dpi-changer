# DPI changer (dpichanger.com)

A free browser tool that changes the DPI value of JPEG and PNG images without touching the pixels. Files never leave the device. Astro (static) and Tailwind 4. No backend.

## What it does

- Reads the current DPI, pixel size and print size (inches and cm) of each file.
- Writes a new DPI: JPEG gets a JFIF density (inserted after SOI if missing), plus Exif X/YResolution and the Photoshop 8BIM 0x03ED resolution block when they exist. PNG gets a `pHYs` chunk before the first `IDAT`, with a correct CRC.
- Adobe RGB JPEGs get no new JFIF block (it would change how colors are read). Files that cannot take a DPI value safely show a plain error.
- Presets 72, 150, 300, 600 and a custom value. Download each file, or all as a zip (fflate, bundled).

## Where the logic lives

| File | Job |
|---|---|
| `src/lib/dpi.js` | Byte-level reader and writer, print size, output names. Plain JS, shared by the page and the tests. |
| `src/components/Tool.astro` | The tool UI and its script. |
| `src/lib/url.ts` | `withBase()` and `stripBase()`, so links work at the root and under a base path. |
| `src/site.config.ts` | Name, domain, keyword, description, IDs for GA4 and AdSense. |
| `tests/dpi.test.mjs` | Tests for the byte logic. |

## Commands

- `npm run dev`: work on the site.
- `npm test`: runs `tests/dpi.test.mjs`. It builds tiny JPEG and PNG files, changes the DPI, reads it back, and checks that everything after the headers is byte-identical. On a Mac it also cross-checks with `sips` (mac only; other systems skip those checks).
- `npm run build`: makes `dist/`.
- `npm run deploy`: runs the tests, builds, and uploads to Cloudflare Pages.
- `npm run icons`: re-renders `apple-touch-icon.png`, `favicon-32.png` and `og.png` from `public/favicon.svg` (needs Google Chrome).

## GitHub Pages copy

Until the domain is bought, `.github/workflows/pages.yml` publishes the site to `https://abhimishra01.github.io/dpi-changer/` on every push to `main`. It builds with `PAGES_BASE=/dpi-changer/` and `PAGES_SITE=https://abhimishra01.github.io`. The canonical URL always points to the real domain. To test locally:

```
PAGES_BASE=/dpi-changer/ npx astro build --outDir dist-pages
```

Then serve `dist-pages` so that it is reachable under `/dpi-changer/`.

## Go live (plain steps)

1. **Buy the domain** after the tool works. `.com`, 1 year, auto-renew off. Put it in `site.config.ts` as `domain` (no `www`, no `https://`). Rebuild.
2. **Cloudflare**: add the domain to Cloudflare (free plan) and change the nameservers at the registrar.
3. **First deploy**: run `npx wrangler login` once (you do this, in your browser). Then `npm run deploy`. The first run asks to create the Pages project; use the same name as `cloudflareProject` in the config.
4. **Custom domain**: Cloudflare dashboard > Workers & Pages > your project > Custom domains. Add `dpichanger.com` and `www.dpichanger.com`. Then add a redirect rule from `www` to the bare domain (or the reverse) so only one version exists.
5. **No duplicate in Google**: `public/_headers` already sets `X-Robots-Tag: noindex` for the `*.pages.dev` address only. Check it: `curl -sI https://dpi-changer.pages.dev | grep -i robots` shows noindex; the custom domain does not.
6. **Google Search Console**: add the domain property, verify with the DNS TXT record in Cloudflare, submit `https://dpichanger.com/sitemap-index.xml`, request indexing of the home page.
7. **Bing Webmaster Tools**: sign in, import from Search Console.
8. **Google Analytics**: create a GA4 property, copy the measurement ID (`G-...`) to `ga4` in the config, rebuild, deploy. Empty means off.
9. **AdSense (later, about 10 visits a day or more)**: apply with the site. When approved, put the publisher ID (`ca-pub-...`) in `adsense`. The build then adds the script and writes `/ads.txt`. Set up the consent message in AdSense (Privacy & messaging) for EU/UK visitors. Then switch on Auto ads. A first rejection is normal; improve content and apply again.
10. Share the tool on Reddit, Quora and social. Rankings take 4 to 6 months. Keep the domain at least a year.

## How things work

- **Dark mode**: follows the system, the toggle saves the choice. A tiny inline script sets it before paint, so there is no flash.
- **SEO**: title, description, canonical (real domain), Open Graph, Twitter, `WebApplication` and `FAQPage` JSON-LD are in `src/layouts/Base.astro` and `src/pages/index.astro`.
- **Sitemap and robots**: `@astrojs/sitemap` makes `/sitemap-index.xml`; `/robots.txt` points to it. The 404 page is excluded.
- **ads.txt**: generated from `adsense`. Empty ID gives a comment line only.
- **Favicon**: edit `public/favicon.svg`, then run `npm run icons` to rebuild the PNG icons and the social image.
- **GA4 and AdSense** load only when their IDs are set (`src/components/Analytics.astro`). These are the only outside requests.
- **Fonts**: system font stack, no downloads.
- **Deploy script**: `scripts/deploy.mjs` reads `cloudflareProject` and runs `wrangler pages deploy dist`. It needs Node 22.6 or newer.

## Legal pages

The About, Terms and Privacy pages are good starting text, not legal advice. Read them before you launch and edit what does not match your tool.
