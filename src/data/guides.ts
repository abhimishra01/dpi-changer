// Landing pages for specific searches. Each one has its own text and opens the same tool with the right preset.
// A section body is a list of paragraphs. Items starting with "- " become a bullet list.
export interface Guide {
  slug: string;
  nav: string; // short link text on the home page
  title: string; // <title> start; the site name is added
  h1: string;
  description: string;
  preset: number;
  mode?: 'check' | 'change';
  calc?: boolean;
  lead: string;
  sections: { h: string; body: string[] }[];
  faq: { q: string; a: string }[];
}

export const guides: Guide[] = [
  {
    slug: 'convert-image-to-dpi',
    nav: 'Convert image to DPI (image to DPI converter)',
    title: 'Convert Image to DPI: Image to DPI Converter',
    h1: 'Convert an image to any DPI',
    description: 'Convert an image to 300, 150, 72 or any DPI with this free image to DPI converter. See the print size first. Pixels stay the same. Private.',
    preset: 300,
    lead: 'An image to DPI converter sets the DPI value stored in a JPEG or PNG file. Add your image, pick the DPI you need, and download it. The pixels do not change.',
    sections: [
      { h: 'How to convert an image to a DPI value', body: [
        '- Drop your JPEG or PNG on the box, or paste a screenshot.',
        '- Type the DPI you need, or pick a preset such as 300 for print or 72 for screens.',
        '- Check the print size in the row. It shows the size in inches and centimeters at the new DPI.',
        '- Press Download. The file name ends with the new value, for example photo-300dpi.jpg.',
      ] },
      { h: 'What converting to DPI does and does not do', body: [
        'DPI is the number of pixels that print in one inch. The file stores this number in its header. This tool changes that number and nothing else, so the picture is not resized, recompressed or sharpened.',
        'A different DPI changes the print size. It does not add detail. If the print is too small or too soft, the image needs more pixels, not a higher DPI.',
      ] },
      { h: 'Common DPI values', body: [
        '- 300 DPI: photos, flyers, business cards and most print jobs.',
        '- 150 DPI: large prints that people view from a distance.',
        '- 96 DPI: the default for many Windows programs.',
        '- 72 DPI: screens and web images.',
      ] },
    ],
    faq: [
      { q: 'Is this an image to DPI converter or a resizer?', a: 'It is a DPI converter. It changes the DPI value in the file and keeps every pixel. To change the pixel size, you need a resizer.' },
      { q: 'Can I convert an image to 300 DPI for free?', a: 'Yes. Choose 300 and download the file. There is no sign-up and no watermark. The file never leaves your device.' },
      { q: 'Which image types can I convert?', a: 'JPEG and PNG. A WebP file is accepted and saved as a PNG with the same pixels.' },
    ],
  },
  {
    slug: 'change-dpi-of-multiple-images',
    nav: 'Change DPI of many images at once',
    title: 'Change DPI of Multiple Images at Once, Free',
    h1: 'Change the DPI of many images at once',
    description: 'Drop a whole folder of JPEG and PNG files, set one DPI for all of them, and download a single zip. Nothing is uploaded and the pixels stay the same.',
    preset: 300,
    lead: 'Select as many JPEG, PNG or WebP files as you need. Pick one DPI value and every file gets it. Download the files one by one, or take them all in one zip.',
    sections: [
      { h: 'How to bulk change DPI', body: [
        '- Select all the files in your folder and drop them on the box, or use Choose images and select several files at once.',
        '- Pick 300, or any other value. The value applies to every file in the list.',
        '- Check the print size in each row. Rows with a small print size tell you which files have too few pixels.',
        '- Press Download all as zip. Each file in the zip is named with the new value, for example poster-300dpi.png.',
      ] },
      { h: 'Why this is fast', body: [
        'The tool does not re-save your pictures. For each file it changes only a few bytes in the header, so a big batch finishes quickly. Your computer does the work, so there is no upload queue and no limit on how many files you can process in a day.',
        'The files are held in memory while you work. The limit is 500 MB for the whole batch. For bigger jobs, run two batches.',
      ] },
      { h: 'What happens to file names', body: [
        'Names stay readable. The tool adds the DPI to the end of the name and keeps the extension. If two files end up with the same name, the second one gets -2 so the zip never overwrites a file.',
      ] },
      { h: 'Mixed files in one batch', body: [
        'JPEG, PNG and WebP can go in the same batch. WebP files are saved as PNG, because PNG can store a DPI value. The row tells you when this happens. Files in other formats show a clear message and are skipped, and the rest of the batch continues.',
      ] },
    ],
    faq: [
      { q: 'How many images can I change at once?', a: 'There is no fixed file count. The files together can be up to 500 MB, because they are held in your browser memory while you work.' },
      { q: 'Can I give each image a different DPI?', a: 'Not in one batch. Every file in the list gets the value you pick. Run the files that need another value in a second batch.' },
      { q: 'Does the zip change the quality?', a: 'No. The zip stores the files as they are, without extra compression, so the pictures inside are exactly what you would get from single downloads.' },
    ],
  },
  {
    slug: 'change-png-dpi',
    nav: 'Change PNG DPI',
    title: 'Change PNG DPI Without Losing Quality',
    h1: 'Change the DPI of a PNG file',
    description: 'Set the DPI of a PNG to 72, 150, 300 or any value without re-saving the picture. The pixels stay byte for byte the same. Free and private.',
    preset: 300,
    lead: 'A PNG file can store its print resolution in a small block called pHYs. This tool writes the value you choose into that block. It does not touch the picture itself, so nothing is lost and transparency stays.',
    sections: [
      { h: 'How PNG stores DPI', body: [
        'PNG does not use dots per inch. It stores pixels per meter in the pHYs block, and the unit is flagged as meters. The tool converts for you. 300 DPI is written as 11,811 pixels per meter, and 72 DPI as 2,835.',
        'Many apps leave this block out. A PNG without it has no DPI, and some programs then assume 72 or 96. Adding the block gives print programs a clear value.',
      ] },
      { h: 'What stays the same', body: [
        'The pixels, the color profile, the transparency and every other block of the file stay as they were. The tool removes any old pHYs block, adds one new block before the image data, and copies the rest byte for byte.',
        'This is different from exporting the image again. A new export can change the compression, the color profile or the bit depth. Editing the header cannot.',
      ] },
      { h: 'Screenshots and exports', body: [
        'Screenshots on a Retina Mac often carry 144 DPI. Design apps export at 72. Neither value is wrong for a screen. If a print shop asks for 300 DPI, set it here and upload the new file.',
      ] },
      { h: 'When a PNG is not the right file', body: [
        'PNG files of photos can be very large. For a print shop that accepts JPEG, a high quality JPEG is often much smaller. Use PNG for flat graphics, logos, text and anything with transparency.',
      ] },
    ],
    faq: [
      { q: 'Does changing PNG DPI change the file size?', a: 'Only by a few bytes. The tool adds one 21 byte block and removes any old one.' },
      { q: 'Is transparency kept?', a: 'Yes. The picture data is not decoded, so the alpha channel is untouched.' },
      { q: 'Why does my PNG show no DPI?', a: 'Many programs write no pHYs block. The row says "not set" in that case. Choose a value and download the file to add one.' },
    ],
  },
  {
    slug: 'change-jpg-dpi',
    nav: 'Change JPG DPI',
    title: 'Change JPG DPI Without Re-compressing',
    h1: 'Change the DPI of a JPG or JPEG',
    description: 'Set the DPI of a JPG to 300, 150, 72 or any value without re-compressing the photo. Only the header changes. Free, and your photos stay on your device.',
    preset: 300,
    lead: 'Every time a JPEG is saved again, it loses a little quality. This tool never saves it again. It changes the density value in the file header and leaves the compressed picture data exactly as it was.',
    sections: [
      { h: 'Where a JPEG keeps its DPI', body: [
        'A JPEG can hold the DPI in more than one place. The JFIF block near the start of the file holds a density value. The Exif block, written by cameras and phones, can hold X and Y resolution. Photoshop adds a third copy in its own block.',
        'The tool updates every one of these that exists. If the file has no JFIF block, it adds one right after the start of the file. This keeps different programs in agreement, so Preview, Windows and print software all show the same number.',
      ] },
      { h: 'Photos from a phone or camera', body: [
        'Camera files often say 72 DPI or 300 DPI in Exif and have no meaning for print. A 4000 by 3000 pixel photo prints at 13.3 by 10 inches at 300 DPI, whatever the label says. The row shows that size so you can check it before you download.',
        'Phone photos stored sideways with an orientation tag are read correctly, so the width and height in the row match what you see on screen.',
      ] },
      { h: 'A rare exception', body: [
        'Some JPEG files saved as RGB by Adobe tools would change color if a JFIF block were added. If such a file has no other place for a DPI value, the tool tells you and does not change it, instead of shifting the colors.',
      ] },
    ],
    faq: [
      { q: 'Will my JPG lose quality?', a: 'No. The compressed picture data is copied without any change, so the image is identical.' },
      { q: 'Is JPG the same as JPEG?', a: 'Yes. They are two spellings of the same format. Both .jpg and .jpeg files work here.' },
      { q: 'Can I read the DPI of my photo here?', a: 'Yes. Add the file and the row shows its DPI now, its pixel size and its print size.' },
    ],
  },
  {
    slug: 'dpi-changer-for-etsy',
    nav: 'DPI for Etsy printables',
    title: 'DPI Changer for Etsy Printables and Digital Downloads',
    h1: 'Set 300 DPI for Etsy printables',
    description: 'Fix a whole set of Etsy print files at once. Set 300 DPI, check the print size of each size you sell, and download one zip. Private, no upload.',
    preset: 300,
    lead: 'Buyers of printables expect files that print sharp. Many listings state 300 DPI. If your design app exported at 72, set the value here before you upload the files to your shop.',
    sections: [
      { h: 'Pixels you need for common print sizes', body: [
        'The DPI label only works if the file has enough pixels. At 300 DPI you need:',
        '- 5 x 7 in: 1500 x 2100 px',
        '- 8 x 10 in: 2400 x 3000 px',
        '- 11 x 14 in: 3300 x 4200 px',
        '- 16 x 20 in: 4800 x 6000 px',
        '- A4 (8.27 x 11.69 in): 2480 x 3508 px',
        '- US Letter (8.5 x 11 in): 2550 x 3300 px',
      ] },
      { h: 'A workflow for a shop with many sizes', body: [
        'Make the largest file first, because a big file can be printed at a smaller size but not the other way round. A 4800 by 6000 pixel file at 300 DPI covers 16 x 20, and also works for 8 x 10 and 4 x 5 if the buyer scales it down.',
        'Export each ratio you sell (2:3, 4:5, 3:4, 5:7, A sizes). Put them all in the tool, choose 300, and download one zip. The files are named with the DPI, which makes it easy to spot a file that was missed.',
      ] },
      { h: 'Check before you list', body: [
        'The row for each file shows its print size at 300 DPI. If the size is smaller than the size you advertise, the buyer will get a soft print. Fix the file first. Changing the label cannot add detail.',
        'Keep the files in your own library as well. The tool never uploads them, so there is no copy anywhere else.',
      ] },
    ],
    faq: [
      { q: 'Does Etsy check the DPI of my files?', a: 'Not automatically. Your buyers and their print shops see the value, and a wrong value can lead to questions, so it is better to set it correctly.' },
      { q: 'Should I upload PDF or JPG?', a: 'Many sellers use high quality JPEG for images and PDF for multi-page files. This tool handles the JPEG and PNG files.' },
      { q: 'Do I need 300 DPI for every product?', a: 'Use 300 DPI for anything people print at home or in a shop. Wall art that is very large and viewed from far away can use 150 DPI.' },
    ],
  },
  {
    slug: '72-dpi-to-300-dpi',
    nav: 'Convert 72 DPI to 300 DPI',
    title: '72 DPI to 300 DPI Converter, No Quality Loss',
    h1: 'Convert 72 DPI to 300 DPI',
    description: 'Turn a 72 DPI image into a 300 DPI image in seconds. See the new print size before you download. The pixels do not change. Free and private.',
    preset: 300,
    lead: 'Going from 72 to 300 DPI does not make the picture bigger or sharper. It changes how many pixels fit in one inch, so the same picture prints smaller and denser.',
    sections: [
      { h: 'What really changes', body: [
        'Take a 2400 by 3000 pixel image. At 72 DPI it would print 33.3 by 41.7 inches. At 300 DPI it prints 8 by 10 inches. The pixels are identical. Only the printed size is different.',
        'Divide the pixel count by 4.17 (300 divided by 72) to see the new size. A 1000 pixel wide image is 13.9 inches wide at 72 DPI and 3.3 inches wide at 300 DPI.',
      ] },
      { h: 'Why not just resize in an editor?', body: [
        'In an image editor, you can tick "resample" when you change the DPI. Then the program invents new pixels and the picture changes. Without resample, the result is the same as this tool, but you need to open a large program. Here, nothing is resampled.',
      ] },
      { h: 'If you really need a bigger print', body: [
        'You need more pixels. Go back to the original design and export at a larger size, or start from a higher resolution photo. Upscaling programs can add pixels, but they guess the new detail.',
      ] },
    ],
    faq: [
      { q: 'Is 72 DPI bad?', a: 'It is fine for screens. It is a problem for print only because print programs use the value to decide the size. The picture itself is not worse.' },
      { q: 'Will my 72 DPI image look sharper at 300 DPI?', a: 'No. Sharpness depends on the pixels. This tool does not change them.' },
      { q: 'What is the new size of my image?', a: 'Add the file. The row shows the print size in inches and centimeters at 300 DPI.' },
    ],
  },
  {
    slug: 'check-image-dpi',
    nav: 'Check the DPI of an image',
    title: 'Check Image DPI: What Is My Image Resolution?',
    h1: 'Check the DPI of an image',
    description: 'Find out the DPI, pixel size and print size of any JPEG, PNG or WebP. Nothing is uploaded, and nothing changes unless you download.',
    preset: 300,
    mode: 'check',
    lead: 'Add an image to read its DPI. The row shows the DPI the file has now, its size in pixels, its file size and how large it prints at 300 DPI.',
    sections: [
      { h: 'What the result means', body: [
        '- A number such as 72, 144 or 300: the value stored in the file.',
        '- "not set": the file has no DPI value. Some programs then assume 72 or 96.',
        '- Two different numbers (for example 300 x 72): the file has a different value for width and height. This is rare, and setting one DPI fixes it.',
      ] },
      { h: 'Other ways to check', body: [
        'On a Mac, open the image in Preview, choose Tools, then Show Inspector. The DPI is listed there.',
        'On Windows, right-click the file, choose Properties and open the Details tab. Look under Image for horizontal and vertical resolution.',
        'On a phone, most gallery apps do not show DPI. Add the photo here instead.',
      ] },
      { h: 'Why the DPI of a photo is often meaningless', body: [
        'A camera or phone writes a default value, often 72 or 300, whatever the pixel count. The size you can print depends on the pixels. A 4000 by 3000 pixel photo prints well at 13 by 10 inches at 300 DPI, even if the file says 72.',
      ] },
    ],
    faq: [
      { q: 'Does checking change my file?', a: 'No. The file is only read in your browser. It changes only if you press Download.' },
      { q: 'Why does a screenshot say 144 DPI?', a: 'Retina Macs capture twice as many pixels per inch as older screens, and the file notes this as 144 DPI.' },
      { q: 'Can I check many files?', a: 'Yes. Add them all and each row shows its own values.' },
    ],
  },
  {
    slug: 'change-dpi-to-150',
    nav: 'Change DPI to 150',
    title: 'Change Image DPI to 150, Free and Private',
    h1: 'Change the DPI of an image to 150',
    description: 'Set an image to 150 DPI for posters, banners and large prints. See the print size first. No upload, no re-compression.',
    preset: 150,
    lead: '150 DPI is a good value for large prints that people view from a distance. The file is half as dense as 300 DPI, so the same pixels cover twice the width.',
    sections: [
      { h: 'When 150 DPI is enough', body: [
        'Posters on a wall, window displays, banners and sports prints are looked at from an arm\'s length or more. At that distance, the eye cannot see the difference between 150 and 300 DPI. Using 150 lets you print a bigger size from the same file.',
        'A 3000 by 2000 pixel image prints at 20 by 13.3 inches at 150 DPI, against 10 by 6.7 inches at 300 DPI.',
      ] },
      { h: 'When it is not', body: [
        'Small prints that are held in the hand, such as photo prints, business cards, flyers and book pages, look better at 300 DPI. Text and thin lines also need a higher value.',
        'Check with your print shop. Many shops state the minimum they accept, and some reject files under 200 DPI.',
      ] },
      { h: 'Sizes at 150 DPI', body: [
        '- 16 x 20 in: 2400 x 3000 px',
        '- 24 x 36 in: 3600 x 5400 px',
        '- A2 (16.5 x 23.4 in): 2480 x 3508 px',
        '- A1 (23.4 x 33.1 in): 3508 x 4961 px',
      ] },
    ],
    faq: [
      { q: 'Is 150 DPI good enough for printing?', a: 'For large pieces seen from a distance, yes. For small prints and text, use 300 DPI.' },
      { q: 'Does 150 DPI make the file smaller?', a: 'No. The file size stays the same because the pixels stay the same.' },
      { q: 'Can I change a 300 DPI file to 150?', a: 'Yes. The print size doubles in width and height, and the pixels are unchanged.' },
    ],
  },
  {
    slug: 'change-dpi-to-600',
    nav: 'Change DPI to 600',
    title: 'Change Image DPI to 600, Free and Private',
    h1: 'Change the DPI of an image to 600',
    description: 'Set an image to 600 DPI for scans, line art and fine text. The print size shrinks, the pixels stay as they are. No upload.',
    preset: 600,
    lead: '600 DPI is used for line art, fine text and some scans. If you change the label to 600, the print gets smaller, because each inch now holds twice as many pixels as at 300 DPI.',
    sections: [
      { h: 'What 600 DPI is for', body: [
        'Bitmap logos, comics, signatures and scanned documents with small text keep their edges at 600 DPI. Some laser printers and engravers ask for it. Photos do not need it. A photo at 600 DPI is not better than the same photo at 300 DPI.',
      ] },
      { h: 'The size trade-off', body: [
        'Labels do not add pixels. A 2400 by 3000 pixel file is 8 by 10 inches at 300 DPI and 4 by 5 inches at 600 DPI. To print 8 by 10 inches at 600 DPI you need 4800 by 6000 pixels, which is four times as many pixels.',
        'The row for each file shows its print size at 600 DPI, so you can see this at once.',
      ] },
      { h: 'When a scanner is the better answer', body: [
        'If you are scanning paper, set the scanner to 600 DPI in the scan settings. That captures more detail. Changing the label afterward does not recover detail that was never captured.',
      ] },
    ],
    faq: [
      { q: 'Is 600 DPI better than 300 DPI?', a: 'Only if the file has enough pixels. For photos, 300 DPI is the usual choice.' },
      { q: 'Why did my print size get smaller?', a: 'Print size is pixels divided by DPI. When the DPI doubles, the size halves.' },
      { q: 'Will the file be bigger?', a: 'No. The file size stays the same.' },
    ],
  },
  {
    slug: 'change-dpi-to-96',
    nav: 'Change DPI to 96',
    title: 'Change Image DPI to 96, Free and Private',
    h1: 'Change the DPI of an image to 96',
    description: 'Set an image to 96 DPI, the classic Windows screen value, without changing a single pixel. See the size at 96 DPI. No upload.',
    preset: 96,
    lead: '96 DPI is the value that Windows has used for standard screens for decades. Some office programs and forms ask for it. Set it here and the pixels stay as they are.',
    sections: [
      { h: 'Why 96', body: [
        'On the web, one inch is defined as 96 CSS pixels. Windows uses 96 DPI as its default screen scale, and Word and PowerPoint can use the DPI of a picture to decide how large it appears when you insert it.',
        'A 960 pixel wide image at 96 DPI is exactly 10 inches wide on the page. At 72 DPI it would be 13.3 inches wide. This is why a picture can look huge in a document and then shrink when you change the value.',
      ] },
      { h: 'Does it matter on the web?', body: [
        'No. Browsers ignore the DPI value of an image and show each pixel as a pixel. 96 matters only when a document or print program reads it.',
      ] },
      { h: '96 DPI against 72 DPI', body: [
        'Neither is better. Both are screen values. The difference is the printed size: the same pixels print 25 percent smaller in width and height at 96 DPI than at 72 DPI. For real printing, use 300 DPI.',
      ] },
    ],
    faq: [
      { q: 'Is 96 DPI good for printing?', a: 'No. It is a screen value. Use 300 DPI for print.' },
      { q: 'Will 96 DPI change how my picture looks on a website?', a: 'No. Browsers ignore the DPI value.' },
      { q: 'Why does Word show my image at a different size?', a: 'Word uses the DPI of the picture to pick its starting size. Change the DPI or resize the picture in the document.' },
    ],
  },
  {
    slug: 'inches-to-pixels-at-300-dpi',
    nav: 'Inches to pixels calculator',
    title: 'Inches to Pixels Calculator for Print, 300 DPI',
    h1: 'Inches to pixels at 300 DPI',
    description: 'Find the pixel size you need for any print size and DPI, such as 8 x 10 inches at 300 DPI. Then set the DPI of your file. Runs in your browser.',
    preset: 300,
    calc: true,
    lead: 'Enter the print size and the DPI. The calculator tells you how many pixels your image needs. Then add your file below and set its DPI.',
    sections: [
      { h: 'The formula', body: [
        'Pixels = inches x DPI. For an 8 x 10 inch print at 300 DPI: 8 x 300 = 2400 pixels wide, and 10 x 300 = 3000 pixels high.',
        'To go the other way, divide: a 3000 pixel wide image at 300 DPI is 10 inches wide.',
      ] },
      { h: 'Common sizes at 300 DPI', body: [
        '- 4 x 6 in: 1200 x 1800 px',
        '- 5 x 7 in: 1500 x 2100 px',
        '- 8 x 10 in: 2400 x 3000 px',
        '- 11 x 14 in: 3300 x 4200 px',
        '- 16 x 20 in: 4800 x 6000 px',
        '- 24 x 36 in: 7200 x 10800 px',
      ] },
      { h: 'If your image has fewer pixels', body: [
        'You have two choices. Print smaller, or print at a lower DPI such as 200 or 150 for pieces seen from a distance. A label change cannot add pixels. The rows of the tool show you the largest print size that your file can reach at the DPI you choose.',
      ] },
    ],
    faq: [
      { q: 'How many pixels do I need for 8 x 10 at 300 DPI?', a: '2400 x 3000 pixels.' },
      { q: 'What about centimeters?', a: 'Divide centimeters by 2.54 to get inches, then multiply by the DPI.' },
      { q: 'Does the calculator upload anything?', a: 'No. It runs in your browser, like the tool.' },
    ],
  },
];
