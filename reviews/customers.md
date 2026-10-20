# DPI changer: mock-customer test (Shuri, 2026-10-20)

How I tested: built the site (`npm run build`), served the built `dist/` copy on port 4427 (another reviewer already held the Astro preview on 4426, which blocks a second `astro preview`, so I served a copy of `dist/` with a static server instead). I drove the live page with playwright-cli, uploaded real test files, downloaded the results and checked them with `sips`, Pillow and a PNG chunk/CRC walk. Desktop 1280 wide, phone 390x844 and 360x740. Light and dark. No network calls left the page (the server log shows only the page, CSS, JS and favicon).

Test files: 2400x3000 PNG at 72 DPI, 4032x3024 JPEG with no DPI, 3024x4032 JPEG with EXIF only (no JFIF, like a phone photo), two 2480x3508 PNG scans at 96 DPI, an 800x600 logo JPEG, a WebP and a .txt.

What is proven to work: PNG 72 -> 300 gave pHYs 11811 px/m with a valid CRC, placed before IDAT, pixels identical (Pillow diff = none), `sips` reads 300. JPEG with no JFIF got a JFIF block inserted at the start and the EXIF resolution tags changed to 300. Zip of three files at 350 DPI: all read 350 in `sips`. Custom value, presets, Clear, drag and drop (two files), duplicate files and error rows for WebP and .txt all work. No horizontal scroll at 390.

## The five personas

### 1. Dana, 41, Etsy seller, Austin (desktop Chrome, beginner)
Task: her 2400x3000 poster says 72 DPI, and the shop listing wants 300. She searched "change dpi of image to 300" and clicked this result because the page title says exactly that.
She dropped the file, saw "72 DPI -> 300" and "8 x 10 in", and clicked Download. Done in about 20 seconds. At 1280x800 the file row is half cut off at the bottom of the screen, so she had to look for it. The header says "Pixels stay untouched" and she believed it, but she wants a line after download like "Saved as etsy-poster-300dpi.png. Pixels not changed." She did not know the file was changed until she checked.
- Click this on Google over the others? Yes, the title and the "free, private" tag match what she wants. The big "Drop here" box beats the sites that show an ad first.
- What confused her: nothing blocking. The new file name (`-300dpi` added) was a surprise, and nothing told her.
- Missing to bookmark: a "check my file is big enough" message. She has a 1200x1800 export and the tool happily says 4 x 6 in with no hint that this is small for a poster.
- Trust: high. The print size matches her own math.
- Come back: yes, every time she makes a new listing.

### 2. Marcus, 34, counter clerk at a print shop, Columbus (desktop, intermediate)
Task: customers send files at 72 or 96 DPI. He adds 5 files at once, one a WebP and one a stray .txt, and wants 350 DPI for his press.
Multi-file add works. Custom 350 updated every row at once. The zip had the right files and the right DPI. The WebP and .txt rows show a clear red "Only JPEG and PNG files are supported." That is honest, but customers send PDFs, TIFFs and WebP all day, so he would still need a second tool.
- Click this over others? Yes. He likes that it does batch and gives a zip, which the first results do not.
- Done in 30 seconds? Yes for 3 files.
- What confused him: after typing an invalid custom value (0, 10000, 350.5) the red message shows, but the earlier preset (600) stays highlighted and the rows still say 600. A Download would then give 600, not what the box says. He caught it only because he looked.
- Missing: PDF and TIFF support, a "keep original names" switch (he wants no `-350dpi` suffix in the zip), and a count in the zip button ("Download all 3 as zip").
- Trust: high. Come back: yes if TIFF/PDF is added; otherwise only for JPEG and PNG jobs.

### 3. Priya, 20, college student, Boston (iPhone, 390 wide, beginner)
Task: a scholarship form wants a photo "at 300 DPI". Her photo is a phone JPEG.
She tapped "Choose images". The big "Drop JPEG or PNG files here" is meaningless on a phone, but the blue button is obvious. After she picked the photo, nothing moved. The result row is below the screen edge (row top is at 722 of 844 px), so she thought nothing happened and tapped the button again. She found the row after scrolling. The result reads "DPI now: 72 DPI -> 300, 10.08 x 13.44 in", which she did not understand ("is that a big photo?"), but the Download button was easy and 44 px tall.
- Click this on Google? She tapped the first result that said "free" and "private". Fine.
- Under 30 seconds? Only because she found the row. About 45 seconds the first time.
- What confused her: no sign the file loaded, no scroll to the result, "Drop" on a phone. Where does the file go on an iPhone (Photos or Files)? The page does not say. I could not test real iOS Safari here, so this is an expectation I could not confirm.
- Missing: "Saved to your Files app" style help for phones.
- Trust: medium-high. "Never leaves your device" was the line that made her go ahead.
- Come back: only if it works first try on the phone.

### 4. Linda, 52, church secretary, a basic Android phone (360 wide, beginner)
Task: a printer asked for "300 DPI" for a bulletin cover that she got by email as a PNG.
The tool fits at 360 wide without sideways scroll. The tap targets are big. She understood "300" because it was already selected. She worried when the print size said "8.27 x 11.69 in" because she did not know what to compare it to. She wanted a plain sentence: "This is A4 / Letter size" or "OK for a full page print".
- Click this on Google over the others? Yes, a plain "Change image DPI to 300" headline.
- Done in 30 seconds? Yes after the first look, but she looked for a "Convert" or "Go" button. There is only "Download", and it gave her no sign that the DPI was applied.
- What confused her: the header "Set DPI to" row and "Custom" box look like a form she must fill. She was not sure that 300 was the default. The selected state is only a color change.
- Missing: one short "What now?" line after the file loads ("Press Download. Your file will have 300 DPI.").
- Trust: medium. She does not read the privacy line. She trusted it because nothing asked her to sign up.
- Come back: yes, but she would bookmark only if the result was clearer.

### 5. Ravi, 29, freelance designer, Portland (desktop, expert)
Task: check that the tool does what it claims. He reads bytes.
PNG: pHYs chunk correct (11811 x 11811, unit meter), CRC valid, before the first IDAT, IDAT data identical. JPEG without JFIF: a JFIF block is added with units dpi and 300 x 300. EXIF resolution (tags 282, 283) is rewritten, and the other EXIF (maker, orientation) stays. He confirmed the pixel data are unchanged. He found no bug in the byte writing.
- Click this over others? Yes. Most "DPI changers" re-encode the image. This one states it does not, and it is true.
- What bothered him: no way to see a before/after hash or "bytes changed: 18" line. A one-line proof ("only 18 bytes changed, the picture data is identical") would sell it to other designers.
- Missing: PDF, TIFF, WebP; a note that DPI on a PNG with an sRGB/iCCP chunk is kept as is; the print size for images with EXIF orientation 6 uses stored width and height, not the rotated view. For a phone photo this shows 10.08 x 13.44 in, which matches pixels, so he only noted it.
- Trust: very high after checking. Come back: yes, would share the link.

## Ranked change list

Count = how many of the 5 personas raised it or hit it.

### Must
1. Confirm the result after upload and after download. Scroll the new file row into view (or make the result sit right under the drop box on phones), and show "Saved as name-300dpi.png. Pixels not changed." (4 of 5: Dana, Priya, Linda, Marcus)
2. Fix the invalid custom value state: when the custom box is invalid, disable Download (or fall back to the last valid value and say so), and do not leave an old preset lit while the box shows a different number. (1 hit it directly, Marcus; any user who mistypes is exposed.)
3. Support more formats the audience actually has (PDF, TIFF, WebP at least say "not supported yet, use X"): the red error row is honest but leaves the user stuck. (3 of 5: Marcus, Priya, Ravi)

### Should
4. Low-resolution warning: if the pixels are too few for the print size, say so ("800 x 600 px gives only 2.67 x 2 in at 300 DPI. For 8 x 10 in you need 2400 x 3000 px."). Add the reverse: "I want 8 x 10 in, how many pixels?" (3 of 5: Dana, Linda, Ravi)
5. Phone wording: on phones show "Choose photos" and hide "Drop ... here"; say where the file goes ("Saved to Files or Downloads"). (2 of 5: Priya, Linda)
6. Option to keep the original file name, and a count in the zip button ("Download all 3 as zip"). (2 of 5: Marcus, Dana)
7. Plain-language print size ("Full page, Letter / A4") next to the inches and cm. (1 of 5: Linda)

### Nice
8. Show proof: "Changed 18 bytes. Picture data is identical." (1 of 5: Ravi, but strong for trust and for sharing)
9. At 1280x800, the tool shows the drop box tall enough that the result is below the fold. Shrink the drop zone a little once a file is loaded. (2 of 5: Dana, Priya)
10. Make the selected preset state clearer (a check mark, not only a color). (1 of 5: Linda)

## Top 5 changes
1. Confirm and scroll to the result after upload; add a "Saved as ..., pixels not changed" line after download.
2. Fix the invalid custom value state (stale preset, Download uses the old value).
3. Add a low-resolution warning and a "pixels needed for this print size" helper.
4. Support or clearly redirect for PDF, TIFF and WebP (the current red row leaves the user stuck).
5. Phone wording and help ("Choose photos", where the file goes) and keep-original-name plus a counted zip button.

Notes: a stray Astro build error appeared on my first build (missing prerender chunk). It was a race with another agent writing `dist/` at the same time. A rebuild passed. The playwright-cli session name `shuri` was also used by another agent at one point (it showed port 4507), so I used a separate session for the last checks.
