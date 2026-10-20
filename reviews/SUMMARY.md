# Fix summary: dpi-changer (Tony, 2026-10-20)

Status: `npm test` 31 checks pass (was 15). `npm run build` passes. Browser check (playwright-cli, session dpi-changer-fix) at 1280, 390 and 320, light and dark, with real PNG, long-named JPEG and WebP files. Download verified with `sips` (350 DPI, pixels 2400). Lighthouse was not re-run (the CLI did not start here); the design review scored 100 on all four before these changes. Built CSS: 21,415 bytes before, 23,136 bytes after, under 30 KB, so Tailwind scanning is unchanged.

## Fixed (accepted)
- Engine (`src/lib/dpi.js`): Exif pointers must stay inside the APP1 segment; Photoshop 8BIM 0x03ED resolution is updated; Adobe RGB (APP14 transform 0) files get no JFIF block (plain error if nothing else can carry DPI); PNG without IDAT now fails in `inspect`; Exif orientation 5 to 8 swaps width and height; two error messages (not JPEG/PNG with a HEIC/WebP hint, and damaged); `JFIF_SEGMENT_LEN`, field comments, `units` comment, `rd/wr` renames, `hasTag` helper, unreachable branch removed; `outName` (extension follows real type, trailing dot) and `uniqueNames` moved to the lib and tested.
- Tests: 16 new (big-endian Exif, JFIF plus Exif, units 2, X/Y differ, orientation, out-of-segment pointer, 8BIM with and without padded name, Adobe, 1 and 9999 DPI, truncated and garbage input, pHYs after IDAT, pHYs unit 0, no IDAT, name helpers). Counter renamed, sips marked "mac only".
- Tool UI: Clear always shown when rows exist; window-level drag and drop; invalid custom value disables downloads and clears the preset highlight (half-typed "3e" counts as invalid); per-file read try/catch; 500 MB total cap with a plain row error; zip shows "Working...", skips failed files and says so; "Saved as X. Pixels not changed." line; ready line and scroll to new rows; "Download all N as zip"; per-row aria-label; status line replaces the live list; presets are `aria-pressed` buttons; visible keyboard focus on "Choose images" (peer-focus-visible); long file names no longer widen the page (`minmax(0,1fr)`, `min-w-0`); phone hides "Drop ... here"; both X and Y shown when they differ; 8 x 10 pixel hint for small images; `alert()` removed; no-op line removed.
- Site: apple-touch-icon re-rendered (it was cropped because Chrome has a minimum window size; now clipped from a larger page, opaque); og:image width, height, alt; manifest and 192/512 icons removed; `keywords` meta and config field removed; unused `h3` CSS, double antialiased, unused Header import, "Tool" header link removed; header no longer overflows at 320 px (Contact hidden under 360 px, still in footer); table cells no wrap; FAQ and article widths aligned; hero padding tightened; JSON-LD got `isAccessibleForFree`, `featureList`, `image`; two short SEO sections added (Convert 72 DPI to 300 DPI, How to check the DPI); Privacy link in the article.
- Template items: README rewritten for this tool; US spelling (personalized, color) incl. Privacy; fixed "Last updated" (October 20, 2026, `legalUpdated` in config); make-icons uses local `playwright-core` (no absolute path) and reads name and keyword from config; `scripts/new-tool.sh` deleted; `screenshots/`, `dist-pages`, `tmp-*` ignored and screenshots untracked (`.playwright-cli/` was already ignored and untracked); duplicate legal link row on home removed (footer keeps them); `deploy` runs `npm test` first; Privacy no longer claims a consent banner; `wrangler` devDependency removed (`npx wrangler` fetches it at deploy).
- GitHub Pages: `base` from `PAGES_BASE`, `site` from `PAGES_SITE`; links, icons, og:image, sitemap and robots work under a base (`src/lib/url.ts`); canonical always `https://dpichanger.com/...`; `.github/workflows/pages.yml` (checkout v4, setup-node v4 node 22, npm ci, npm test, build with the two env vars, upload-pages-artifact v3, deploy-pages v4). Verified: built into `dist-pages`, served under `/dpi-changer/`, clicked home, about, privacy, terms, contact; icons, og, sitemap return 200; tool script runs. `dist-pages` deleted. Branch is `main`. Nothing pushed.

## Rejected or deferred
- Add PDF, TIFF, WebP support (customers #3): would make it a different tool. Error text now says to convert first.
- Keep-original-name switch, thumbnails, sticky action bar, proof line "N bytes changed", plain-language paper sizes, "pixels needed for print size" calculator: feature creep for a single-purpose tool. (A one-line 8 x 10 hint was added.)
- Replace fflate with a store-only zip (minimalism 18): spec asks for fflate.
- DataView rewrite of the byte helpers (minimalism 8): risk without a gain; tests cover both byte orders.
- `WebSite` JSON-LD node, sitemap `lastmod`, hard offset shadow restyle, article side navigation: low value.
- Dropping the Photoshop XMP `tiff:XResolution` update: not done (XMP is text and rarely read for DPI); 8BIM covers Adobe tools. Not tested in real Photoshop.

## Left for the owner
- Push `main` (Barney). Turn on Pages in the repo settings (Source: GitHub Actions). Repo name must be `dpi-changer`, user `abhimishra01`.
- Re-check Privacy text and consent message when GA4 or AdSense go on.
- Test once on a real iPhone Safari and with a Photoshop-saved JPEG.
- Re-run Lighthouse.

## Phase 2 SEO pages (best 20, not built)
1. change dpi of image to 300
2. convert 72 dpi to 300 dpi
3. change dpi to 150
4. change dpi to 600
5. change dpi to 96
6. change dpi to 350
7. increase dpi of image without resizing
8. check image dpi (what is my image dpi)
9. change dpi of png
10. change dpi of jpg
11. change dpi online free no upload
12. change dpi without photoshop
13. change dpi on mac preview
14. change dpi on windows
15. change dpi on iphone
16. image dpi for etsy printables
17. 300 dpi for printing (what size can I print)
18. dpi vs ppi
19. 8x10 print size in pixels at 300 dpi
20. bulk change dpi of many images
