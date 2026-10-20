// Run: node tests/dpi.test.mjs   (or npm test)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspect, setDpi, crc32, printSize } from '../src/lib/dpi.js';

const JPG = new Uint8Array(Buffer.from('/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAACAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgACAAQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+c/Cf7L/ANz/AET/AMdr6Z8J/sv/AHP9E/8AHa9e8J/w19M+E+qfhXk8Y+JGba/vT4v6Nvi5nn7v9927/wCZ/9k=', 'base64')); // 16x8, JFIF units 0 (72:72 ratio only) + Exif without resolution tags
const PNG = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAIAAAB/FOjAAAAA60lEQVR4nAXBMRGEMBAAwJOAggwSEJDiJVCnQgJlypVAlRoJFBGABCYKkICE340IU5jDEn5hDVvYg3CEM1zhDk94wxcikimZkyX5JWuyJXsiOZIzuZI7eZI3+ZKIbMrmbMl+2Zpt2Z7JjuzMruzOnuzNviyimIq5WIpfsRZbsReKoziLq7iLp3iLr4iopmqulupXrdVW7ZXqqM7qqu7qqd7qqyKaqZmbpfk1a7M1e6M5mrO5mrt5mrf5mohu6uZu6X7d2m3d3umO7uyu7u6e7u2+LmKYhnlYht+wDtuwD4ZjOIdruIdneIdv+AMVsrCB9+nIYgAAAABJRU5ErkJggg==', 'base64')); // 16x8, no pHYs
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('ok', name); };
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
  // Take the scan part of the real JPEG: everything from the Photoshop marker (FFED).
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
  assert.throws(() => inspect(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])), /JPEG and PNG/);
  assert.throws(() => setDpi(PNG, 0), /between/);
  assert.throws(() => setDpi(PNG, 100000), /between/);
});
ok('print size', () => { const s = printSize(3000, 2000, 300); eq([s.inW, s.inH, +s.cmW.toFixed(2)], [10, 6.666666666666667, 25.4]); });

// Cross-check with macOS sips (skipped elsewhere)
if (process.platform === 'darwin') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpi-'));
  for (const [name, bytes] of [['a.jpg', setDpi(JPG, 300)], ['a.png', setDpi(PNG, 300)], ['b.jpg', setDpi(noJfifJpeg(), 150)]]) {
    const f = path.join(dir, name); fs.writeFileSync(f, bytes);
    const o = execFileSync('sips', ['-g', 'dpiWidth', '-g', 'dpiHeight', '-g', 'pixelWidth', f]).toString();
    const want = name === 'b.jpg' ? 150 : 300;
    assert.match(o, new RegExp('dpiWidth: ' + want + '\\.0*'));
    assert.match(o, /pixelWidth: 16/);
    n++; console.log('ok sips reads', name, 'as', want, 'dpi');
  }
}
console.log(n + ' checks passed');
