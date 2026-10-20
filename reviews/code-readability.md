# Code review: readability (dpi-changer)

Verdict: the code itself reads well and tests pass (15 checks). The README is the template's, and it is wrong for this site. Fix that and a few stale or misleading bits first. 1 must-fix.

| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| must | README.md:1-45 | The README is the untouched microtool template ("Microtool site template", "Make a new tool", `my-tool`, "replace the demo"). It says nothing about DPI, `src/lib/dpi.js`, or `npm test`. | A new engineer learns nothing about this tool and gets steps that do not apply. | Rewrite the top: what the tool does, file map (`dpi.js`, `Tool.astro`, `tests/`), how to run `npm test`, how `sips` check works. Keep the go-live steps below it. |
| should | README.md:~37 | Says the favicon is made by `src/pages/favicon.svg.ts`. That file does not exist; `public/favicon.svg` is used and `scripts/make-icons.mjs` builds the PNGs. | Stale instruction. Following it fails. | Replace with the real flow: edit `public/favicon.svg`, run `node scripts/make-icons.mjs`. |
| should | scripts/make-icons.mjs:2 | Imports playwright from an absolute path in another project (`/Users/moonwalker/Desktop/oqu/generic-email-agent/...`). Also hard-codes "DPI Changer" and the slogan in the OG HTML (lines 15-17). | Breaks on any other machine; text can drift from `site.config.ts`. | Import `playwright-core` by name or note the dependency in the README; read name and keyword from `site.config.ts`. |
| should | src/pages/privacy.astro:17 | Uses "personalised" (twice) in a US English site. | Brief rule: US English. Also mixes with "personalized" style elsewhere. | Change to "personalized". |
| should | src/pages/privacy.astro:4, terms.astro:4 | "Last updated" is `new Date()` at build time. | The date changes on every deploy even when the text did not. Misleading for a legal page. | Hard-code the real date, or put `legalUpdated` in `site.config.ts`. |
| should | src/lib/dpi.js:119 | `info.exif + (info.jfif < 0 ? 18 : 0)` uses an unexplained 18. | It is the length of the JFIF segment inserted at line 113. A reader cannot see that. | Add `const JFIF_SEGMENT_LEN = 18` and use it at lines 113-116 and 119, with a one-line comment. |
| should | src/lib/dpi.js:113 | The 18-byte JFIF array is a bare list of numbers. | Hard to check against the JFIF spec (version 1.01, units 1, thumbnail 0x0). | Add a comment naming the fields: marker, length 16, "JFIF\0", version 1.1, units 1, X, Y, thumb 0x0. |
| should | src/lib/dpi.js:65-68 | `r16/r32` (read) and `q16/q32` (write) in `exifTags`. `q` is not a clear prefix for write. | Easy to mix up, and `w16/w32` already mean "write big endian" above. | Rename to `rd16/rd32/wr16/wr32`, or `readU16/writeU16`, and note that these follow the file's byte order. |
| should | src/lib/dpi.js:88-91 | `u` is JFIF units: 0 = none, 1 = dpi, 2 = dots per cm. Only a short trailing branch shows this. A file with units 0 returns `null` ("not set"). | The meaning of units 0 is the key edge case (the test file at tests:38 relies on it) and it is silent. | Name it `units` and add a comment "0 = aspect ratio only, treat as no DPI". |
| should | src/components/Tool.astro:80 | `meta.innerHTML = '';` runs on a fresh empty element. | Dead line. Also reads like an injection risk to a reviewer who scans for `innerHTML`. | Delete it. |
| should | src/components/Tool.astro:114 | One 160-character line holds the whole custom-input logic, with the "empty means 300" rule hidden inside. | Hardest line in the file to read; the preset reset duplicates `setTarget`'s own aria update. | Move to a named function `onCustomInput()` with a comment, and let `setTarget` take the preset state. |
| should | src/components/Tool.astro:78 | Shows "DPI now" from `dpi.x` only. A file with X different from Y shows only X. | Silent loss of information in the UI. | Show both when they differ, or comment that X is shown on purpose. |
| should | src/components/Header.astro:2, 15 | `site` is imported but never used; the logo text "DPI changer" is hard-coded. | Dead import; the name can drift from `site.name`. | Remove the import, or build the logo from `site.name`. |
| should | src/pages/index.astro:30-35 | A second row of About, Privacy, Terms and Contact links sits under the tool, and the same links are in the Footer. | Duplicate navigation, left over from the template. | Remove the row, or keep it and say why in a comment. |
| nice | src/pages/index.astro:34 and src/site.config.ts:6 | The page title "Change Image DPI to 300, Free and Private" is typed in `index.astro`, while the keyword and tagline live in config. | The same words are in two places. | Build the title from `site.keyword`, or comment that it is set on purpose. |
| nice | src/components/ThemeToggle.astro:1 | Uses "colour" in `aria-label` and `title`. | Read by US screen reader users; brief says US English. (`site.config.ts:15` "brand colour" comment is fine, it is code only.) | Change to "color theme". |
| nice | src/components/Tool.astro:91 | `alert()` is the error path for a download that fails. | Different from the inline error style used for files. Rare case. | Show the message in the file row. |
| nice | tests/dpi.test.mjs:12 | `ok` is both the test runner and (with `n`) a counter; `n` is a bare global. `tail` at line 34 depends on the 0xFFED marker that is not named. | Slows a new reader. | Rename `ok` to `test`, `n` to `passed`; comment "FFED = Photoshop segment, first byte after the headers we edit". |
| nice | tests/dpi.test.mjs:9 | The 16x8 JPEG is a 1.3 KB base64 blob. The comment says what it holds but not how it was made. | Cannot be rebuilt if it is lost. | Add the tool used to make it (for example the command) in the comment. |
| nice | .astro/preview.log, screenshots/ | Generated logs and review screenshots sit in the site folder. `screenshots/` is not in `.gitignore`. | Clutter in the repo; the log shows a dev port from a past run. | Add `screenshots` and `.astro` to `.gitignore` (`.astro` already is) and delete the log. |

## Checked and fine
- Article, FAQ, About, Contact and Terms: no placeholder text, no template wording left, no em dashes, no vendor or AI mentions.
- Print-size table and worked example recomputed by hand: all numbers are correct.
- The Article, FAQ and Tool use the same terms (DPI, "print size", inches and cm). PPI is explained once.
- `dpi.js` header comments match the code. Comment at line 61 (TIFF header offset) is accurate.
- `npm test`: 15 checks pass, including `sips` cross-checks.
