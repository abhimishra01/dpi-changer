// Byte-level DPI reader and writer for JPEG and PNG. No re-encoding: pixel data is never touched.
// Plain JS (no types) so the browser bundle and the node tests use the same file.

export const MAX_DPI = 9999;

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function detectType(b) {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length > 8 && sig.every((v, i) => b[i] === v)) return 'png';
  return null;
}

const u16 = (b, o) => (b[o] << 8) | b[o + 1];
const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const w16 = (b, o, v) => { b[o] = (v >> 8) & 0xff; b[o + 1] = v & 0xff; };
const w32 = (b, o, v) => { b[o] = (v >>> 24) & 0xff; b[o + 1] = (v >>> 16) & 0xff; b[o + 2] = (v >>> 8) & 0xff; b[o + 3] = v & 0xff; };
const round1 = (x) => Math.round(x * 10) / 10;
const isJfif = (b, o) => b[o] === 0x4a && b[o + 1] === 0x46 && b[o + 2] === 0x49 && b[o + 3] === 0x46 && b[o + 4] === 0;
const isExif = (b, o) => b[o] === 0x45 && b[o + 1] === 0x78 && b[o + 2] === 0x69 && b[o + 3] === 0x66 && b[o + 4] === 0 && b[o + 5] === 0;

// ---------- JPEG ----------

// Walk the marker segments before the scan data. Returns what we need to read or edit.
function scanJpeg(b) {
  const info = { jfif: -1, exif: -1, width: 0, height: 0 };
  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) break;
    const m = b[p + 1];
    if (m === 0xff) { p++; continue; }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { p += 2; continue; }
    if (m === 0xd9 || m === 0xda) break; // end of image or start of scan
    const len = u16(b, p + 2);
    if (m === 0xe0 && info.jfif < 0 && len >= 16 && isJfif(b, p + 4)) info.jfif = p;
    if (m === 0xe1 && info.exif < 0 && len >= 14 && isExif(b, p + 4)) info.exif = p;
    const isSof = m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
    if (isSof && !info.width) { info.height = u16(b, p + 5); info.width = u16(b, p + 7); }
    p += 2 + len;
  }
  return info;
}

// Find EXIF IFD0 resolution tags. Returns offsets (in file bytes) or null.
function exifTags(b, segStart) {
  const t = segStart + 10; // TIFF header start: marker(2) + length(2) + "Exif\0\0"(6)
  if (t + 8 > b.length) return null;
  const le = b[t] === 0x49 && b[t + 1] === 0x49;
  if (!le && !(b[t] === 0x4d && b[t + 1] === 0x4d)) return null;
  const r16 = (o) => (le ? b[o] | (b[o + 1] << 8) : u16(b, o));
  const r32 = (o) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : u32(b, o));
  const q16 = (o, v) => { if (le) { b[o] = v & 0xff; b[o + 1] = (v >> 8) & 0xff; } else w16(b, o, v); };
  const q32 = (o, v) => { if (le) { b[o] = v & 0xff; b[o + 1] = (v >>> 8) & 0xff; b[o + 2] = (v >>> 16) & 0xff; b[o + 3] = (v >>> 24) & 0xff; } else w32(b, o, v); };
  const ifd = t + r32(t + 4);
  if (ifd + 2 > b.length) return null;
  const n = r16(ifd);
  const out = { r16, r32, q16, q32, x: -1, y: -1, unit: -1 };
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > b.length) return null;
    const tag = r16(e), type = r16(e + 2), count = r32(e + 4);
    if ((tag === 0x011a || tag === 0x011b) && type === 5 && count === 1) {
      const v = t + r32(e + 8);
      if (v + 8 > b.length) return null;
      if (tag === 0x011a) out.x = v; else out.y = v;
    } else if (tag === 0x0128 && type === 3) out.unit = e + 8;
  }
  return out;
}

function readJpegDpi(b, info) {
  if (info.jfif >= 0) {
    const u = b[info.jfif + 11], x = u16(b, info.jfif + 12), y = u16(b, info.jfif + 14);
    if (u === 1 && x > 0) return { x, y: y || x };
    if (u === 2 && x > 0) return { x: round1(x * 2.54), y: round1((y || x) * 2.54) };
  }
  if (info.exif >= 0) {
    const e = exifTags(b, info.exif);
    if (e && e.x >= 0 && e.y >= 0) {
      const unit = e.unit >= 0 ? e.r16(e.unit) : 2;
      const rat = (o) => { const d = e.r32(o + 4); return d ? e.r32(o) / d : 0; };
      let x = rat(e.x), y = rat(e.y);
      if (unit === 3) { x *= 2.54; y *= 2.54; }
      if (x > 0 && (unit === 2 || unit === 3)) return { x: round1(x), y: round1(y || x) };
    }
  }
  return null;
}

function writeJpeg(b, dpi) {
  const info = scanJpeg(b);
  let out;
  if (info.jfif >= 0) {
    out = new Uint8Array(b);
    const p = info.jfif;
    out[p + 11] = 1; w16(out, p + 12, dpi); w16(out, p + 14, dpi);
  } else {
    const seg = new Uint8Array([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    w16(seg, 12, dpi); w16(seg, 14, dpi);
    out = new Uint8Array(b.length + seg.length);
    out.set(b.subarray(0, 2), 0); out.set(seg, 2); out.set(b.subarray(2), 2 + seg.length);
  }
  // Keep EXIF in step with JFIF, when it already has resolution tags.
  const exifStart = info.exif >= 0 ? info.exif + (info.jfif < 0 ? 18 : 0) : -1;
  if (exifStart >= 0) {
    const e = exifTags(out, exifStart);
    if (e && e.x >= 0 && e.y >= 0) {
      e.q32(e.x, dpi); e.q32(e.x + 4, 1);
      e.q32(e.y, dpi); e.q32(e.y + 4, 1);
      if (e.unit >= 0) e.q16(e.unit, 2);
    }
  }
  return out;
}

// ---------- PNG ----------

function pngChunks(b) {
  const list = [];
  let p = 8;
  while (p + 12 <= b.length) {
    const len = u32(b, p);
    const type = String.fromCharCode(b[p + 4], b[p + 5], b[p + 6], b[p + 7]);
    if (p + 12 + len > b.length) break;
    list.push({ type, start: p, end: p + 12 + len, len });
    p += 12 + len;
    if (type === 'IEND') break;
  }
  return list;
}

function readPng(b) {
  const chunks = pngChunks(b);
  const ihdr = chunks.find((c) => c.type === 'IHDR');
  const res = { width: ihdr ? u32(b, ihdr.start + 8) : 0, height: ihdr ? u32(b, ihdr.start + 12) : 0, dpi: null };
  const phys = chunks.find((c) => c.type === 'pHYs' && c.len === 9);
  if (phys && b[phys.start + 16] === 1) {
    const x = u32(b, phys.start + 8), y = u32(b, phys.start + 12);
    if (x > 0) res.dpi = { x: round1(x * 0.0254), y: round1((y || x) * 0.0254) };
  }
  return res;
}

function writePng(b, dpi) {
  const chunks = pngChunks(b);
  const idat = chunks.find((c) => c.type === 'IDAT');
  if (!idat) throw new Error('This PNG has no image data.');
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  w32(chunk, 0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  w32(chunk, 8, ppm); w32(chunk, 12, ppm); chunk[16] = 1;
  w32(chunk, 17, crc32(chunk.subarray(4, 17)));
  const parts = [b.subarray(0, 8)];
  for (const c of chunks) {
    if (c.type === 'pHYs') continue; // drop old ones, including any placed after IDAT
    if (c === idat) parts.push(chunk);
    parts.push(b.subarray(c.start, c.end));
  }
  const tail = chunks.length ? chunks[chunks.length - 1].end : 8;
  parts.push(b.subarray(tail));
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ---------- Public API ----------

/** Read type, pixel size and current DPI. Throws a plain message for unsupported files. */
export function inspect(bytes) {
  const type = detectType(bytes);
  if (type === 'jpeg') {
    const info = scanJpeg(bytes);
    if (!info.width) throw new Error('Could not read this JPEG.');
    return { type, width: info.width, height: info.height, dpi: readJpegDpi(bytes, info) };
  }
  if (type === 'png') {
    const r = readPng(bytes);
    if (!r.width) throw new Error('Could not read this PNG.');
    return { type, ...r };
  }
  throw new Error('Only JPEG and PNG files are supported.');
}

/** Return a new byte array with the DPI set. Pixel data stays byte-identical. */
export function setDpi(bytes, dpi) {
  dpi = Math.round(dpi);
  if (!(dpi >= 1 && dpi <= MAX_DPI)) throw new Error(`DPI must be between 1 and ${MAX_DPI}.`);
  const type = detectType(bytes);
  if (type === 'jpeg') return writeJpeg(bytes, dpi);
  if (type === 'png') return writePng(bytes, dpi);
  throw new Error('Only JPEG and PNG files are supported.');
}

/** Print size in inches and cm at a given DPI. */
export function printSize(width, height, dpi) {
  const w = width / dpi, h = height / dpi;
  return { inW: w, inH: h, cmW: w * 2.54, cmH: h * 2.54 };
}
