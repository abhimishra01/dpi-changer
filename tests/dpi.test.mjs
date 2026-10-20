// Run: node tests/dpi.test.mjs   (or npm test)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspect, setDpi, crc32, printSize, outName, uniqueNames, isWebp } from '../src/lib/dpi.js';

const JPG = new Uint8Array(Buffer.from('/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAACAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgACAAQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+c/Cf7L/ANz/AET/AMdr6Z8J/sv/AHP9E/8AHa9e8J/w19M+E+qfhXk8Y+JGba/vT4v6Nvi5nn7v9927/wCZ/9k=', 'base64')); // 16x8, JFIF units 0 (72:72 ratio only) + Exif without resolution tags
const PNG = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAIAAAB/FOjAAAAA60lEQVR4nAXBMRGEMBAAwJOAggwSEJDiJVCnQgJlypVAlRoJFBGABCYKkICE340IU5jDEn5hDVvYg3CEM1zhDk94wxcikimZkyX5JWuyJXsiOZIzuZI7eZI3+ZKIbMrmbMl+2Zpt2Z7JjuzMruzOnuzNviyimIq5WIpfsRZbsReKoziLq7iLp3iLr4iopmqulupXrdVW7ZXqqM7qqu7qqd7qqyKaqZmbpfk1a7M1e6M5mrO5mrt5mrf5mohu6uZu6X7d2m3d3umO7uyu7u6e7u2+LmKYhnlYht+wDtuwD4ZjOIdruIdneIdv+AMVsrCB9+nIYgAAAABJRU5ErkJggg==', 'base64')); // 16x8, no pHYs
let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('ok', name); };
const eq = (a, b) => assert.deepEqual(Array.from(a), Array.from(b));

// Build a JPEG without JFIF, with an Exif block that has XResolution and YResolution (little endian).
function exifJpeg() {
  const tiff = Buffer.alloc(8 + 2 + 36 + 4 + 16);
  tiff.write('II', 0); tiff.writeUInt16LE(42, 2); tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(3, 8);
  const ent = (i, tag, type, val) => { const o = 10 + i * 12; tiff.writeUInt16LE(tag, o); tiff.writeUInt16LE(type, o + 2); tiff.writeUInt32LE(1, o + 4); if (type === 3) tiff.writeUInt16LE(val, o + 8); else tiff.writeUInt32LE(val, o + 8); };
  ent(0, 0x011a, 5, 50); ent(1, 0x011b, 5, 58); ent(2, 0x0128, 3, 2);
  tiff.writeUInt32LE(0, 46);
  tiff.writeUInt32LE(72, 50); tiff.writeUInt32LE(1, 54); tiff.writeUInt32LE(72, 58); tiff.writeUInt32LE(1, 62);
  const body = Buffer.concat([Buffer.from('Exif\0\0'), tiff]);
  const app1 = Buffer.alloc(4); app1.writeUInt16BE(0xffe1, 0); app1.writeUInt16BE(body.length + 2, 2);
  // Take the scan part of the real JPEG: everything from the Photoshop marker (FFED, the first segment after the headers we edit).
  const at = Buffer.from(JPG).indexOf(Buffer.from([0xff, 0xed]));
  return new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), app1, body, Buffer.from(JPG.subarray(at))]));
}
function noJfifJpeg() {
  const at = Buffer.from(JPG).indexOf(Buffer.from([0xff, 0xed]));
  return new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), Buffer.from(JPG.subarray(at))]));
}
const tail = (b) => { const i = Buffer.from(b).indexOf(Buffer.from([0xff, 0xed])); return b.subarray(i); };

ok('crc32 known value', () => assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926));

ok('jpeg: read size; JFIF units 0 means no DPI set', () => { const i = inspect(JPG); assert.equal(i.type, 'jpeg'); assert.equal(i.width, 16); assert.equal(i.height, 8); assert.equal(i.dpi, null); });
ok('jpeg: set 300 with JFIF', () => {
  const out = setDpi(JPG, 300);
  assert.equal(out.length, JPG.length);
  eq([out[13], out[14], out[15], out[16], out[17]], [1, 1, 0x2c, 1, 0x2c]);
  eq([inspect(out).dpi.x, inspect(out).dpi.y], [300, 300]);
  eq(tail(out), tail(JPG)); // everything after the headers is identical
  assert.equal(out.length - tail(out).length, JPG.length - tail(JPG).length);
});
ok('jpeg: only the 5 density bytes changed', () => {
  const out = setDpi(JPG, 600); let diff = 0;
  for (let i = 0; i < out.length; i++) if (out[i] !== JPG[i]) diff++;
  assert.ok(diff <= 5, 'changed bytes: ' + diff);
});
ok('jpeg: no JFIF gets one inserted after SOI', () => {
  const src = noJfifJpeg(); assert.equal(inspect(src).dpi, null);
  const out = setDpi(src, 300);
  assert.equal(out.length, src.length + 18);
  eq(out.subarray(0, 2), [0xff, 0xd8]); eq(out.subarray(2, 4), [0xff, 0xe0]);
  eq([inspect(out).dpi.x, inspect(out).width, inspect(out).height], [300, 16, 8]);
  eq(out.subarray(20), src.subarray(2));
});
ok('jpeg: EXIF resolution is read and rewritten', () => {
  const src = exifJpeg(); eq([inspect(src).dpi.x], [72]);
  const out = setDpi(src, 300);
  assert.equal(inspect(out).dpi.x, 300);
  // Remove the JFIF we added and check EXIF itself now says 300 as well.
  const noJ = new Uint8Array([...out.subarray(0, 2), ...out.subarray(20)]);
  eq([inspect(noJ).dpi.x, inspect(noJ).dpi.y], [300, 300]);
  eq(tail(out), tail(src));
});
ok('jpeg: EXIF-only file reads cm unit', () => {
  const src = exifJpeg();   src[12 + 10 + 24 + 8] = 3; // ResolutionUnit = 3 (cm), 72 per cm
  eq([inspect(src).dpi.x], [182.9]);
});
ok('png: read size, no dpi', () => { const i = inspect(PNG); eq([i.type === 'png', i.width, i.height, i.dpi === null], [true, 16, 8, true]); });
ok('png: write pHYs before IDAT with right CRC', () => {
  const out = setDpi(PNG, 300);
  assert.equal(out.length, PNG.length + 21);
  const s = Buffer.from(out).toString('latin1');
  const p = s.indexOf('pHYs'), d = s.indexOf('IDAT');
  assert.ok(p > 0 && p < d);
  const dv = new DataView(out.buffer, out.byteOffset);
  assert.equal(dv.getUint32(p + 4), 11811); assert.equal(dv.getUint32(p + 8), 11811); assert.equal(out[p + 12], 1);
  assert.equal(dv.getUint32(p + 13), crc32(out.subarray(p, p + 13)));
  assert.equal(inspect(out).dpi.x, 300);
  eq(Buffer.concat([Buffer.from(out.subarray(0, p - 4)), Buffer.from(out.subarray(p + 17))]), PNG); // removing the chunk gives the original
});
ok('png: replace an existing pHYs, no duplicates', () => {
  const once = setDpi(PNG, 72), twice = setDpi(once, 600);
  assert.equal(Buffer.from(twice).toString('latin1').split('pHYs').length - 1, 1);
  assert.equal(inspect(twice).dpi.x, 600);
  assert.equal(twice.length, once.length);
});
ok('rejects bad input', () => {
  assert.throws(() => inspect(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])), /not a JPEG, PNG or WebP/);
  assert.throws(() => setDpi(PNG, 0), /between/);
  assert.throws(() => setDpi(PNG, 100000), /between/);
});
ok('print size', () => { const s = printSize(3000, 2000, 300); eq([s.inW, s.inH, +s.cmW.toFixed(2)], [10, 6.666666666666667, 25.4]); });


// ---------- more fixtures and edge cases ----------
const FFED = Buffer.from(JPG).indexOf(Buffer.from([0xff, 0xed]));
const REST = Buffer.from(JPG.subarray(FFED)); // Photoshop block, tables, frame header, scan data
const seg = (marker, body) => { const h = Buffer.alloc(4); h.writeUInt16BE(0xff00 | marker, 0); h.writeUInt16BE(body.length + 2, 2); return Buffer.concat([h, body]); };
const restOf = (b) => b.subarray(b.length - REST.length); // the untouched part: tables, frame header and scan data
const jpeg = (...segs) => new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), ...segs, REST]));
const jfifSeg = (units, x, y) => { const b = Buffer.from([0x4a, 0x46, 0x49, 0x46, 0, 1, 1, units, 0, 0, 0, 0, 0, 0]); b.writeUInt16BE(x, 8); b.writeUInt16BE(y, 10); return seg(0xe0, b); };
// Exif block with resolution tags. le: byte order. orient: optional orientation. badX: point XResolution at this TIFF offset.
function exifSeg({ le = true, res = 72, unit = 2, orient = null, badX = null } = {}) {
  const cnt = orient ? 4 : 3, vals = 8 + 2 + 12 * cnt + 4;
  const t = Buffer.alloc(vals + 16);
  const w16 = (o, v) => (le ? t.writeUInt16LE(v, o) : t.writeUInt16BE(v, o));
  const w32 = (o, v) => (le ? t.writeUInt32LE(v, o) : t.writeUInt32BE(v, o));
  t.write(le ? 'II' : 'MM', 0); w16(2, 42); w32(4, 8); w16(8, cnt);
  const ent = (i, tag, type, val) => { const o = 10 + i * 12; w16(o, tag); w16(o + 2, type); w32(o + 4, 1); if (type === 3) w16(o + 8, val); else w32(o + 8, val); };
  ent(0, 0x011a, 5, badX ?? vals); ent(1, 0x011b, 5, vals + 8); ent(2, 0x0128, 3, unit);
  if (orient) ent(3, 0x0112, 3, orient);
  w32(vals - 4, 0); w32(vals, res); w32(vals + 4, 1); w32(vals + 8, res); w32(vals + 12, 1);
  return seg(0xe1, Buffer.concat([Buffer.from('Exif\0\0'), t]));
}
// Photoshop APP13 block with a resolution resource (0x03ED); name is the pascal name, padded to even length.
function psSeg(res, name = '') {
  const nm = Buffer.concat([Buffer.from([name.length]), Buffer.from(name)]);
  const pad = nm.length & 1 ? Buffer.from([0]) : Buffer.alloc(0);
  const data = Buffer.alloc(16); data.writeUInt32BE(res << 16, 0); data.writeUInt16BE(1, 4); data.writeUInt16BE(1, 6); data.writeUInt32BE(res << 16, 8); data.writeUInt16BE(1, 12); data.writeUInt16BE(1, 14);
  const size = Buffer.alloc(4); size.writeUInt32BE(16);
  return seg(0xed, Buffer.concat([Buffer.from('Photoshop 3.0\0'), Buffer.from('8BIM'), Buffer.from([0x03, 0xed]), nm, pad, size, data]));
}
const psRes = (b) => { const i = Buffer.from(b).indexOf(Buffer.from([0x03, 0xed])); const o = Buffer.from(b).indexOf(Buffer.from([0, 0, 0, 16]), i) + 4; return Buffer.from(b).readUInt32BE(o) >>> 16; };
const diffCount = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
const adobeSeg = (transform) => seg(0xee, Buffer.concat([Buffer.from('Adobe'), Buffer.from([0, 100, 0, 0, 0, 0, transform])]));
const pngChunk = (type, body) => { const c = Buffer.alloc(12 + body.length); c.writeUInt32BE(body.length, 0); c.write(type, 4, 'latin1'); body.copy(c, 8); c.writeUInt32BE(crc32(c.subarray(4, 8 + body.length)), 8 + body.length); return c; };
const splitPng = (b) => { const out = []; let p = 8; while (p < b.length) { const len = Buffer.from(b).readUInt32BE(p); out.push({ type: Buffer.from(b.subarray(p + 4, p + 8)).toString('latin1'), buf: Buffer.from(b.subarray(p, p + 12 + len)) }); p += 12 + len; } return out; };
const physBody = (ppm, unit) => { const b = Buffer.alloc(9); b.writeUInt32BE(ppm, 0); b.writeUInt32BE(ppm, 4); b[8] = unit; return b; };
const joinPng = (chunks) => new Uint8Array(Buffer.concat([Buffer.from(PNG.subarray(0, 8)), ...chunks.map((c) => c.buf)]));

ok('jpeg: big endian Exif is rewritten and nothing else changes', () => {
  const src = jpeg(exifSeg({ le: false, res: 96 })); eq([inspect(src).dpi.x], [96]);
  const out = setDpi(src, 300); // no JFIF in the source: one is inserted, so compare after it
  eq([inspect(out).dpi.x], [300]);
  const noJ = new Uint8Array([...out.subarray(0, 2), ...out.subarray(20)]);
  eq([inspect(noJ).dpi.x, inspect(noJ).dpi.y], [300, 300]);
  eq(restOf(out), REST);
});
ok('jpeg: JFIF and Exif in one file both change', () => {
  const src = jpeg(jfifSeg(1, 72, 72), exifSeg({ res: 72 }));
  const out = setDpi(src, 350);
  assert.equal(out.length, src.length);
  assert.equal(inspect(out).dpi.x, 350);
  const exifOnly = new Uint8Array([0xff, 0xd8, ...out.subarray(2 + 18)]); // drop the JFIF: Exif alone must say 350 too
  assert.equal(inspect(exifOnly).dpi.x, 350);
  eq(restOf(out), REST);
});
ok('jpeg: JFIF units 2 (dots per cm) is converted on read', () => { eq([inspect(jpeg(jfifSeg(2, 118, 118))).dpi.x], [299.7]); });
ok('jpeg: Exif with an X and Y that differ shows both', () => { const i = inspect(jpeg(jfifSeg(1, 300, 150))); eq([i.dpi.x, i.dpi.y], [300, 150]); });
ok('jpeg: Exif orientation 6 swaps width and height', () => { const i = inspect(jpeg(exifSeg({ orient: 6 }))); eq([i.width, i.height], [8, 16]); const j = inspect(jpeg(exifSeg({ orient: 1 }))); eq([j.width, j.height], [16, 8]); });
ok('jpeg: an Exif pointer outside its segment never writes into image data', () => {
  const src = jpeg(jfifSeg(1, 72, 72), exifSeg({ badX: 4000 }));
  const out = setDpi(src, 300);
  assert.equal(out.length, src.length);
  assert.ok(diffCount(out, src) <= 5, 'only the JFIF bytes may change');
});
ok('jpeg: Photoshop resolution block (8BIM 0x03ED) is updated', () => {
  for (const name of ['', 'ab']) {
    const src = jpeg(jfifSeg(1, 72, 72), psSeg(72, name)); eq([psRes(src)], [72]);
    const out = setDpi(src, 300);
    eq([psRes(out), out.length], [300, src.length]);
    eq(restOf(out), REST);
    const noJ = setDpi(jpeg(psSeg(72, name), exifSeg()), 150); eq([psRes(noJ)], [150]); // shifted by the inserted JFIF
  }
});
ok('jpeg: Adobe RGB file gets no JFIF block (colors would shift)', () => {
  const rgb = jpeg(adobeSeg(0), exifSeg({ res: 72 }));
  const out = setDpi(rgb, 300);
  assert.equal(out.length, rgb.length);
  assert.equal(inspect(out).dpi.x, 300);
  assert.throws(() => setDpi(jpeg(adobeSeg(0)), 300), /colors/);
  assert.equal(setDpi(jpeg(adobeSeg(1)), 300).length, jpeg(adobeSeg(1)).length + 18); // YCbCr is safe
});
ok('jpeg: 1 and 9999 DPI round trip', () => { for (const d of [1, 9999]) eq([inspect(setDpi(JPG, d)).dpi.x], [d]); });
ok('jpeg: truncated and garbage input throw a plain error', () => {
  for (let len = 0; len < 40; len++) { try { inspect(JPG.subarray(0, len)); } catch (e) { assert.ok(e instanceof Error); } }
  assert.throws(() => inspect(new Uint8Array([0xff, 0xd8, 0xff, 0xd9])), /damaged/);
  assert.throws(() => inspect(Uint8Array.from(Buffer.from('RIFF0000WEBPVP8 '))), /not a JPEG, PNG or WebP/);
});
ok('webp: recognized by header, JPEG and PNG are not', () => {
  assert.equal(isWebp(Uint8Array.from(Buffer.from('RIFF0000WEBPVP8 '))), true);
  assert.equal(isWebp(JPG), false); assert.equal(isWebp(PNG), false); assert.equal(isWebp(new Uint8Array(4)), false);
});
ok('png: pHYs after IDAT moves before it, one chunk only', () => {
  const chunks = splitPng(PNG), iend = chunks.pop();
  const src = joinPng([...chunks, { type: 'pHYs', buf: pngChunk('pHYs', physBody(2835, 1)) }, iend]);
  eq([inspect(src).dpi.x], [72]);
  const out = setDpi(src, 300), types = splitPng(out).map((c) => c.type);
  eq([types.filter((t) => t === 'pHYs').length, types.indexOf('pHYs') < types.indexOf('IDAT'), inspect(out).dpi.x], [1, true, 300]);
  assert.equal(out.length, src.length);
});
ok('png: pHYs with unit 0 reads as not set', () => {
  const chunks = splitPng(PNG);
  const src = joinPng([chunks[0], { type: 'pHYs', buf: pngChunk('pHYs', physBody(2835, 0)) }, ...chunks.slice(1)]);
  assert.equal(inspect(src).dpi, null);
  assert.equal(inspect(setDpi(src, 300)).dpi.x, 300);
});
ok('png: no IDAT is rejected by inspect and setDpi', () => {
  const chunks = splitPng(PNG), src = joinPng(chunks.filter((c) => c.type !== 'IDAT'));
  assert.throws(() => inspect(src), /damaged/);
  assert.throws(() => setDpi(src, 300), /no image data/);
});
ok('png: 1 and 9999 DPI round trip, pixel chunks identical', () => {
  for (const d of [1, 72, 9999]) {
    const out = setDpi(PNG, d); assert.ok(Math.abs(inspect(out).dpi.x - d) < 0.1 + d * 0.0002, 'dpi ' + d);
    const idat = (b) => splitPng(b).filter((c) => c.type === 'IDAT').map((c) => c.buf.toString('hex')).join();
    assert.equal(idat(out), idat(PNG));
  }
});
ok('png: truncated input throws a plain error', () => { for (const len of [9, 20, 33, 50]) assert.throws(() => inspect(PNG.subarray(0, len)), /damaged/); });
ok('output names: type decides the extension, trailing dot and repeats handled', () => {
  eq([outName('photo.jpg', 300, 'jpeg'), outName('photo.JPEG', 300, 'jpeg'), outName('photo.', 300, 'png'), outName('scan.jpg', 300, 'png'), outName('noext', 150, 'jpeg'), outName('.png', 300, 'png')],
    ['photo-300dpi.jpg', 'photo-300dpi.JPEG', 'photo-300dpi.png', 'scan-300dpi.png', 'noext-150dpi.jpg', 'image-300dpi.png']);
  eq(uniqueNames(['a.png', 'a.png', 'b.png', 'a.png', 'a-2.png']), ['a.png', 'a-2.png', 'b.png', 'a-3.png', 'a-2-2.png']);
});

// Cross-check with macOS sips (mac only, skipped on other systems)
if (process.platform === 'darwin') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpi-'));
  for (const [name, bytes] of [['a.jpg', setDpi(JPG, 300)], ['a.png', setDpi(PNG, 300)], ['b.jpg', setDpi(noJfifJpeg(), 150)]]) {
    const f = path.join(dir, name); fs.writeFileSync(f, bytes);
    const o = execFileSync('sips', ['-g', 'dpiWidth', '-g', 'dpiHeight', '-g', 'pixelWidth', f]).toString();
    const want = name === 'b.jpg' ? 150 : 300;
    assert.match(o, new RegExp('dpiWidth: ' + want + '\\.0*'));
    assert.match(o, /pixelWidth: 16/);
    passed++; console.log('ok sips reads', name, 'as', want, 'dpi');
  }
}
ok('jpeg: CMYK is flagged (4 components) and RGB is not', () => {
  assert.equal(inspect(JPG).cmyk, false);
  const b = new Uint8Array(JPG);
  const sof = b.findIndex((v, k) => v === 0xff && b[k + 1] === 0xc0);
  b[sof + 9] = 4;
  assert.equal(inspect(b).cmyk, true);
});

console.log(passed + ' checks passed');
