// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
export default {
  name: 'DPI Changer',                 // shown in header, title, footer
  domain: 'dpichanger.com',            // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'dpi-changer',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'change image DPI to 300',            // main keyword: goes in the H1 and title
  tagline: 'Free, private, no quality loss',  // short line used in the title after the keyword
  description:
    'Change the DPI of a JPEG or PNG to 300, 150, 72 or any value. Pixels stay untouched. Runs in your browser, so your images never leave your device.',
  email: 'hello@dpichanger.com',       // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#1d4ed8',                   // brand color (hex)
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',                        // e.g. '/og.png' (1200x630 file in public/). Empty = no image
  category: 'UtilitiesApplication',   // schema.org applicationCategory
  legalUpdated: 'October 20, 2026',     // "Last updated" on Privacy and Terms. Change it only when that text changes.
  owner: 'DPI Changer',                // name used in legal pages (person or business)
};
