// FAQ items. Rendered on the home page AND output as FAQPage JSON-LD.
export const faq = [
  { q: 'How do I convert an image to a DPI value?', a: 'Add your JPEG or PNG, type the DPI you want, such as 300, and press Download. The tool changes only the DPI value in the file, so the image is not resized or recompressed.' },
  { q: 'Does changing DPI reduce image quality?', a: 'No. The tool edits only the DPI value in the file header. The pixel data is not decoded, resized or compressed again, so the image is identical.' },
  { q: 'Will a 72 DPI image look better at 300 DPI?', a: 'No. DPI does not add detail. It changes the printed size. A 3000 by 2000 pixel image prints at 10 by 6.7 inches at 300 DPI, whatever the old DPI value was.' },
  { q: 'Are my images uploaded to a server?', a: 'No. Everything runs in your browser. Your images never leave your device, and nothing is stored.' },
  { q: 'Which file types does it support?', a: 'JPEG (.jpg, .jpeg) and PNG (.png). A WebP file is also accepted and is saved as a PNG with the same pixels, because PNG can store a DPI value. HEIC, TIFF and BMP are not supported yet.' },
  { q: 'Can I paste an image instead of choosing a file?', a: 'Yes. Copy an image or a screenshot, click the page, and press Ctrl+V (Cmd+V on a Mac). It is added to the list.' },
  { q: 'Can I change many files at once?', a: 'Yes. Add as many files as you like, choose the DPI, and download each file or one zip with all of them.' },
  { q: 'What DPI should I use for printing?', a: 'Use 300 DPI for photos, flyers and most print jobs. Use 150 DPI for large prints seen from a distance. Always follow the rule of your print shop if it gives one.' },
  { q: 'How do I check the new DPI?', a: 'On a Mac, open the file in Preview and choose Tools, then Show Inspector. On Windows, right-click the file, open Properties, then the Details tab. You can also add the file back to this tool to read its DPI.' },
  { q: 'Why does the print size change when I change DPI?', a: 'Print size is pixels divided by DPI. When DPI goes up, the same pixels cover fewer inches. That is why 300 DPI gives a smaller print than 72 DPI for the same file.' },
];
