# DPI changer: design and SEO review (Miranda, independent)

Build: npm run build OK. Preview on port 4426 (stopped). Viewed with playwright-cli at 1280 and 390, light and dark, empty and filled (2 valid files, 1 corrupt file, one very long file name). `npm test`: 15 checks pass.

## Scores
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100 (LCP 1.1 s, CLS 0, TBT 0 ms).
- Lighthouse desktop: 100 / 100 / 100 / 100 (LCP 0.3 s, CLS 0).
- Page weight: 21 KiB transferred (HTML 6 KB gz, JS 8 KB gz, CSS 5 KB gz, no fonts, no images on the page).
- My own score (design and UX beyond Lighthouse): 7.5 / 10. SEO on-page: 8 / 10.
- Must-fix: 3. Should-fix: 8. Nice-to-have: 8.

## Verdict
Clean, fast, honest page. It beats the competitors in the research (imresizer, convert.town, Clideo, blog posts) on privacy claim, batch zip, presets, print size in inches and cm, dark mode, and the "DPI does not add detail" honesty. Three defects must be fixed before launch: a phone layout break with long file names, two broken PNG icons, and no keyboard focus ring on the main button.

## Findings
| Severity | Area | Finding | Fix |
|---|---|---|---|
| MUST | Phone layout | At 390 px, a long file name pushes the file row to 568 px wide. The whole page scrolls sideways (scrollWidth 568 vs 390) and the row is clipped outside the card. Cause: `<ul class="grid">` has an auto column that grows to the long name. Real file names from Etsy sellers are long. | On `#list` use `grid-cols-[minmax(0,1fr)]`; add `min-w-0` to each `li`. Re-test with a 70-character name at 390 and 320 px. |
| MUST | Icons | `public/icon-512.png` and `public/apple-touch-icon.png` are broken: the artwork is cropped and tiled (the top of the tile shows, the next copy starts at the bottom). `icon-192.png`, `favicon-32.png` and `favicon.svg` are fine. The apple icon is what iPhones show when someone saves the site. | Re-render both from `favicon.svg` at the right size (rsvg-convert, or Chromium screenshot of the SVG at 180 and 512). Check by eye. |
| MUST | Keyboard a11y | Focusing "Choose images" with Tab shows no ring. The file input is `sr-only` and a sibling of the label (not inside it), so `focus-within:outline-2` never fires. Keyboard users cannot see where they are on the main action. | Use `peer` on the input and `peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2` on the label, or make the label wrap the input. |
| SHOULD | A11y | Every file row has a button named just "Download". With 5 files a screen reader hears 5 identical buttons. | `aria-label="Download {name} at {dpi} DPI"`. |
| SHOULD | A11y | `#list` is `aria-live="polite"` and is fully rebuilt on each preset click. A screen reader re-reads every row. | Move the live region to a short status line ("3 files ready at 300 DPI"); keep the list non-live. |
| SHOULD | A11y | The preset buttons use `role="radio"` but have no arrow-key behavior or roving tabindex. Tab stops on all four. | Either add arrow keys and tabindex roving, or drop `role=radio` and use `aria-pressed` toggle buttons (simpler). |
| SHOULD | Copy (US English) | `ThemeToggle.astro` label says "Switch colour theme" (British). Brief says US English. `site.config.ts` also has "colour" in a code comment (harmless). | "Switch color theme". |
| SHOULD | Error state | A corrupt `.jpg` shows "Only JPEG and PNG files are supported." That is wrong for a damaged JPEG and also does not help a user who drops a WebP or HEIC. | Two messages: "This file is not a JPEG or PNG" (by type) and "This file looks damaged and could not be read". Mention HEIC and WebP: "Convert it to JPEG or PNG first." |
| SHOULD | Product gap | Competitors in the research often let the user also set pixel size. The query "change dpi of image to 300" is often really "make this print at 8x10". Nothing in the tool helps if the print size is too small (the article only says "get a bigger original"). | Add a soft warning per row when the print size is under the common sizes or when the file is under about 150 DPI at the chosen size (for example "Below 150 DPI at 8 x 10 in"). Resize can wait for v2. |
| SHOULD | SEO content | The article covers DPI vs PPI, print sizes and Etsy. It does not target the next three queries a searcher types: "convert 72 dpi to 300 dpi", "check image dpi / how to see dpi of a photo", "change dpi in Photoshop / Preview / Windows". The FAQ answers the check question only in 2 lines. | Add two short H2s (about 120 words each): "Convert 72 DPI to 300 DPI" and "How to check the DPI of an image (Mac, Windows, this tool)". Keep the 70-percent plain style. |
| SHOULD | SEO schema | `WebApplication` JSON-LD parses fine but is thin: no `isAccessibleForFree`, `featureList`, `image` or `screenshot`. No `WebSite` node. FAQPage is valid and matches the visible text 1:1. | Add `isAccessibleForFree: true`, `featureList` (JPEG and PNG, batch, zip, print size), `image: og.png`. Optional `WebSite` with name and url. |
| NICE | Hero | At 1280x800 the drop zone starts at y=362 and the DPI presets sit at the fold. The hero uses about 330 px of text before the tool. | Tighten top padding (pt-16 to pt-10) and hero copy to two lines so the presets show above the fold at 800 px. |
| NICE | Layout | On desktop the article is 68ch (about 730 px) left-aligned and the FAQ is 768 px wide; their right edges do not line up (872 vs 912 px). The right third of the page is empty beside the 4,000 px of text. | Give article and FAQ the same max width. Optional: sticky "On this page" list in the right column on wide screens. |
| NICE | Phone | The "Download all as zip" and "Clear" buttons sit below all file rows. With 8 files the user scrolls far on a phone. | Make the actions bar sticky at the bottom of the card on phones, or repeat "Download all" above the list when more than 3 files. |
| NICE | Phone | The print-size table at 390 px wraps cells ("16.7 x 25 / in"). | `white-space: nowrap` on `td` and let `.tablewrap` scroll, or drop the "in" unit from cells and say "inches" in the caption. |
| NICE | Tool | No thumbnail per file, so with several files the user cannot tell which is which except by name. | Show a 48 px thumbnail from `URL.createObjectURL` (revoke after). Cheap and makes the list feel real. |
| NICE | Visual | The hard offset shadow appears only on the main card. It is not repeated anywhere else, so it looks like a one-off. Clipped slightly at the right edge at 1280. | Either use the same offset style on a few elements (preset selected state, buttons) or drop it for a soft shadow. |
| NICE | OG image | Good (1200x630, readable, matches logo). Subtitle wraps with a single orphan word "device." No `og:image:width`, `og:image:height` or `og:image:alt` tags. | Shorten the subtitle to one line. Add the three tags in `Base.astro`. |
| NICE | SEO | `<meta name="keywords">` is ignored by Google and shows the keyword list to rivals. | Remove it. |
| NICE | SEO | Article has no internal links. "Private by design" should link to Privacy; the Etsy example could link nowhere useful, so keep it simple. Sitemap has no `lastmod`. | Add one link to /privacy/ in the privacy paragraph. Set `lastmod` in the sitemap config. |
| OK | SEO | Title "Change Image DPI to 300, Free and Private | DPI Changer" (55 chars). Description 148 chars. One H1 equal to the main query. H2 outline is clean (11 H2 in the article plus the FAQ H2, no skipped levels). Canonical `https://dpichanger.com/`. robots.txt and sitemap-index are correct. 404 page has `noindex` and its own title. `_headers` sets noindex on pages.dev. Article is 795 words, above the 600 target. FAQ has 8 real questions with correct schema. | Keep. |
| OK | Design | Logo: blue rounded tile, 3x3 dot grid and a ruler bar. Simple, reads at 16 px, fits "DPI". Light and dark both pass contrast (Lighthouse a11y 100). Tap targets are 44 px. No layout shift. About, Contact, Privacy and Terms have no overflow at 390 px. | Keep. |
| OK | Privacy claim | "Images never leave your device" is true: the page makes no network request after load (21 KiB total, no third party while GA and AdSense are off). | Re-check the claim and the Privacy page text when GA4 or AdSense is switched on. |

## Not checked
- Real download of a file and a zip in a browser (covered by the 15 node tests, including a sips read-back; I did not click Download).
- A 320 px width (do it after the overflow fix).
