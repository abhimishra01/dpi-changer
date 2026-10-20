# Code review: regression lens (Sherlock) - dpi-changer

Verdict: PASS with fixes. The DPI engine is correct on every case I recomputed. Template rules hold. 0 must-fix, 5 should-fix, 7 nice.

## Checked by hand (all correct)
- `npm test`: 15 of 15 pass, including 3 real `sips` cross-checks.
- PNG at 1, 72, 96, 150, 300, 350, 600, 9999 DPI: pHYs written, CRC valid, read-back equals the target, `sips` agrees (1 to 600). 300 gives 11811 px/m, 72 gives 2835.
- PNG with old pHYs before IDAT, pHYs after IDAT, pHYs unit 0, no IDAT, truncated file: each handled as intended (one pHYs, before IDAT, same length; unit 0 reads as "not set"; clear error text).
- JPEG made by `sips` (JFIF plus its own Exif): set 300 reads back 300 with `sips`. Pixel bytes untouched.
- JPEG with extra Exif carrying X/Y resolution, little endian and big endian, Exif after JFIF and Exif before JFIF: JFIF and Exif both rewritten, `sips` reads 300 and 150.
- JPEG with no JFIF: 18 bytes inserted after SOI, Exif offset shift handled (`info.exif + 18`).
- A 50 MB buffer takes 10 ms (byte edit only).
- Article table (4 sizes x 3 DPI), worked example (8 x 10 in, 20.3 x 25.4 cm), 800 x 600 at 300 = 2.7 x 2 in, FAQ 10 x 6.7 in: all recomputed, all correct.
- Template: canonical on every page; `_headers` has both pages.dev noindex rules; 404 has noindex and is not in the sitemap; About, Contact, Privacy, Terms linked from home and footer; GA and AdSense script count 0 in dist; ads.txt is a comment line when empty; robots.txt points to sitemap-index.

## Findings
| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| should | src/components/Tool.astro:99-102 | `actions` (with Clear) is hidden when `ok === 0`. If every added file is bad (for example a WebP), the red error rows stay and there is no Clear or remove control. | User cannot reset the list without a page reload. Errors from later drops pile up. | Show `actions` when `items.length > 0` and hide only the zip button when `ok < 2`. Or add a remove button per row. |
| should | src/components/Tool.astro:125-127 | Drag and drop is bound to the drop box only. A file dropped a few pixels outside it makes the browser open the image in the tab. | All queued files and the chosen DPI are lost. Easy to do on a big page. | Add `window` `dragover` and `drop` listeners that call `preventDefault()` (and add files on drop). |
| should | src/lib/dpi.js:112-117 | When there is no JFIF, a JFIF segment is always inserted. libjpeg lets JFIF win over Adobe APP14, so an Adobe 3-component JPEG with transform 0 (RGB) is then read as YCbCr and the colors shift. | Breaks the "pixels untouched" promise for that file type (rare but real, from some Adobe and print tools). | If an APP14 "Adobe" segment with transform 0 is present, do not insert JFIF; edit EXIF only, or tell the user. Add a test. |
| should | src/lib/dpi.js:105-129 | Only JFIF and EXIF IFD0 are updated. A Photoshop APP13 8BIM 0x03ED resolution block and XMP `tiff:XResolution` are left as they were. I could not test in Photoshop. | Files saved by Photoshop or Lightroom may still show the old DPI in Adobe tools, which is what Etsy sellers use. | Test with a Photoshop-saved JPEG. If it shows the old value, patch the 0x03ED block (fixed 16 byte layout) when present. |
| should | src/components/Tool.astro:106-108, 114 | Bad custom value (0, 12.5, 10000) only shows a message; `target` and the highlighted preset stay at the old value and downloads use it. With `type=number`, partial input such as "3e" or "-" reads as `''`, which resets to 300 and hides the message. | Input box and download value can disagree. | On error, disable the Download buttons until the value is valid, or mark the input `aria-invalid` and clear the preset highlight. |
| should | tests/dpi.test.mjs | No test for: JFIF plus Exif with resolution tags (the common real file), big-endian Exif write, pHYs after IDAT, truncated PNG/JPEG, 1 and 9999 DPI, Adobe case. The only Exif write test is little endian with no JFIF. | These paths pass today (I ran them by hand) but nothing guards them. | Add the cases from my scratch run as fixtures built in code. |
| nice | src/lib/dpi.js:191, Tool.astro:79 | Width and height are used as stored. Exif Orientation 5 to 8 (phone photos) means the print size is shown rotated (W x H swapped). | Print size line shows the wrong way round for rotated phone photos. | Read Orientation from IFD0 and swap for 5 to 8, or add a note. |
| nice | src/components/Tool.astro:78 | Only `dpi.x` is shown. A file with different X and Y density shows one number. | Hides a mismatch the user may want to fix. | Show "x by y" when they differ. |
| nice | src/components/Tool.astro:54 | `outName("photo.")` gives `photo.-300dpi`. A PNG named `.jpg` keeps the `.jpg` extension. | Odd names. Content is still valid. | Strip a trailing dot; set the extension from the detected type. |
| nice | src/components/Tool.astro:116-123, 130-140 | Files are read one at a time with no progress, and zip is built synchronously on the main thread. | Many large files freeze the page for a moment. | Show "Reading..." text; keep as is until real use shows it matters. |
| nice | src/components/Tool.astro:91 | A PNG with no IDAT passes `inspect` and fails only on Download, through `alert()`. | Late error. | Check for IDAT in `inspect`, or show the error in the row. |
| nice | src/components/Tool.astro:31 | `aria-live="polite"` on the list is re-rendered on each DPI change. | Screen reader reads the whole list again at every key press in Custom. | Put live announcements on a small status line instead. |

## Notes for other lenses
- Privacy page says "Where the law requires it, we ask for your consent" but no consent message exists yet. Fine while GA and AdSense are off; needed before they are switched on.
- README mentions `src/pages/favicon.svg.ts`, which does not exist in this site.
