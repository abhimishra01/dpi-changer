// Renders apple-touch-icon.png, favicon-32.png and og.png from public/favicon.svg.
// Run: npm run icons   (needs Google Chrome installed; uses the playwright-core dev dependency)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const { default: site } = await import('../src/site.config.ts');
const svg = fs.readFileSync('public/favicon.svg', 'utf8');
const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
// The Apple icon must be opaque (iOS fills transparent corners with black), so it gets the brand color behind the tile.
for (const [name, size, bg] of [['favicon-32.png', 32, 'transparent'], ['apple-touch-icon.png', 180, site.brand]]) {
  await p.setViewportSize({ width: 600, height: 600 }); // Chrome has a minimum window size, so clip a small area of a larger page
  await p.setContent(`<body style="margin:0;background:${bg}"><img src="${uri}" width="${size}" height="${size}" style="display:block"></body>`);
  await p.screenshot({ path: `public/${name}`, omitBackground: bg === 'transparent', clip: { x: 0, y: 0, width: size, height: size } });
}
await p.setViewportSize({ width: 1200, height: 630 });
const title = site.keyword.charAt(0).toUpperCase() + site.keyword.slice(1);
await p.setContent(`<body style="margin:0;width:1200px;height:630px;background:#f7f6f2;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#16161a;display:flex;align-items:center;padding:0 90px;box-sizing:border-box;gap:70px">
<img src="${uri}" width="260" height="260" style="flex:none">
<div><div style="font-size:30px;font-weight:600;color:${site.brand};margin-bottom:14px">${site.name}</div>
<div style="font-size:78px;font-weight:800;line-height:1.02;letter-spacing:-2px">${title}</div>
<div style="font-size:30px;color:#5d5d66;margin-top:22px">JPEG and PNG. No quality loss. Private.</div></div></body>`);
await p.screenshot({ path: 'public/og.png' });
await b.close();
