// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
const cfg = {
  name: 'DPI Changer',                 // shown in header, title, footer
  domain: 'dpichanger.com',            // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'dpi-changer',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'change image DPI to 300',            // main keyword: goes in the H1 and title
  tagline: 'Free, private, no quality loss',  // short line used in the title after the keyword
  description:
    'Free image to DPI converter: set a JPEG or PNG to 300, 150, 72 or any DPI. Pixels stay untouched. Runs in your browser, so nothing is uploaded.',
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

// Bingemind mode (SITE_MODE=bingemind): the tool lives at bingemind.com/dpi-changer/.
// Canonical links always name that address. Legal pages name Bingemind as the owner.
const bingemind = process.env.SITE_MODE === 'bingemind';
export default {
  ...cfg,
  domain: 'bingemind.com/dpi-changer',
  origin: 'https://bingemind.com/dpi-changer',
  bingemind,
  owner: bingemind ? 'Bingemind' : cfg.owner,
  contactWord: bingemind ? 'Contact' : 'Email',
  contactHref: bingemind ? 'https://bingemind.com/#contact' : `mailto:${cfg.email}`,
  contactLabel: bingemind ? 'bingemind.com/#contact' : cfg.email,
};
