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

/** WebP files are decoded by the browser and saved as PNG, so the tool only needs to recognize them. */
export function isWebp(b) {
  return b.length > 12 && hasTag(b, 0, 'RIFF') && hasTag(b, 8, 'WEBP');
}

const u16 = (b, o) => (b[o] << 8) | b[o + 1];
const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const w16 = (b, o, v) => { b[o] = (v >> 8) & 0xff; b[o + 1] = v & 0xff; };
const w32 = (b, o, v) => { b[o] = (v >>> 24) & 0xff; b[o + 1] = (v >>> 16) & 0xff; b[o + 2] = (v >>> 8) & 0xff; b[o + 3] = v & 0xff; };
const round1 = (x) => Math.round(x * 10) / 10;
const hasTag = (b, o, text) => [...text].every((ch, i) => b[o + i] === ch.charCodeAt(0));
const isJfif = (b, o) => hasTag(b, o, 'JFIF\0');
const isExif = (b, o) => hasTag(b, o, 'Exif\0\0');

const NOT_SUPPORTED = 'This file is not a JPEG, PNG or WebP. Convert HEIC, TIFF or BMP files to JPEG or PNG first.';
const DAMAGED = 'This file looks damaged and could not be read.';

// ---------- JPEG ----------

// A JFIF APP0 segment is 18 bytes: FFE0, length 16, "JFIF\0", version 1.1, units 1 (dpi),
// X density, Y density, thumbnail 0 x 0. Inserted after SOI when a file has none.
const JFIF_SEGMENT_LEN = 18;
const PHOTOSHOP_ID = 'Photoshop 3.0\0';

// Walk the marker segments before the scan data. Returns what we need to read or edit.
function scanJpeg(b) {
  const info = { jfif: -1, exif: -1, photoshop: [], adobe: -1, width: 0, height: 0, components: 0 };
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
    if (m === 0xed && len >= 16 && hasTag(b, p + 4, PHOTOSHOP_ID)) info.photoshop.push(p);
    if (m === 0xee && len >= 14 && hasTag(b, p + 4, 'Adobe')) info.adobe = b[p + 15]; // transform: 0 = RGB, 1 = YCbCr
    const isSof = m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
    if (isSof && !info.width) { info.height = u16(b, p + 5); info.width = u16(b, p + 7); info.components = b[p + 9]; }
    p += 2 + len;
  }
  return info;
}

// Find EXIF IFD0 tags (resolution, unit, orientation). Returns offsets (in file bytes) or null.
// Every pointer must stay inside the APP1 segment, so a damaged file can never make us write into the image data.
function exifTags(b, segStart) {
  const end = Math.min(b.length, segStart + 2 + u16(b, segStart + 2));
  const t = segStart + 10; // TIFF header start: marker(2) + length(2) + "Exif\0\0"(6)
  if (t + 8 > end) return null;
  const le = b[t] === 0x49 && b[t + 1] === 0x49;
  if (!le && !(b[t] === 0x4d && b[t + 1] === 0x4d)) return null;
  // Read and write 16 and 32 bit numbers in the byte order that the file uses.
  const rd16 = (o) => (le ? b[o] | (b[o + 1] << 8) : u16(b, o));
  const rd32 = (o) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : u32(b, o));
  const wr16 = (o, v) => { if (le) { b[o] = v & 0xff; b[o + 1] = (v >> 8) & 0xff; } else w16(b, o, v); };
  const wr32 = (o, v) => { if (le) { b[o] = v & 0xff; b[o + 1] = (v >>> 8) & 0xff; b[o + 2] = (v >>> 16) & 0xff; b[o + 3] = (v >>> 24) & 0xff; } else w32(b, o, v); };
  const ifd = t + rd32(t + 4);
  if (ifd + 2 > end) return null;
  const n = rd16(ifd);
  const out = { rd16, rd32, wr16, wr32, x: -1, y: -1, unit: -1, orient: -1 };
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > end) return null;
    const tag = rd16(e), type = rd16(e + 2), count = rd32(e + 4);
    if ((tag === 0x011a || tag === 0x011b) && type === 5 && count === 1) {
      const v = t + rd32(e + 8);
      if (v + 8 > end) return null;
      if (tag === 0x011a) out.x = v; else out.y = v;
    } else if (tag === 0x0128 && type === 3) out.unit = e + 8;
    else if (tag === 0x0112 && type === 3) out.orient = e + 8;
  }
  return out;
}

// Photoshop resolution info (8BIM resource 0x03ED, 16 bytes) inside an APP13 segment.
// Returns the offset of its data, or -1.
function photoshopResolution(b, segStart) {
  const end = Math.min(b.length, segStart + 2 + u16(b, segStart + 2));
  let q = segStart + 4 + PHOTOSHOP_ID.length;
  while (q + 12 <= end && hasTag(b, q, '8BIM')) {
    const id = u16(b, q + 4);
    const nameLen = 1 + b[q + 6];
    const sizeAt = q + 6 + nameLen + (nameLen & 1); // the name is padded to an even length
    if (sizeAt + 4 > end) return -1;
    const size = u32(b, sizeAt), data = sizeAt + 4;
    if (data + size > end) return -1;
    if (id === 0x03ed && size === 16) return data;
    q = data + size + (size & 1);
  }
  return -1;
}

function readJpegDpi(b, info) {
  if (info.jfif >= 0) {
    const units = b[info.jfif + 11]; // 0 = aspect ratio only (no DPI), 1 = dots per inch, 2 = dots per cm
    const x = u16(b, info.jfif + 12), y = u16(b, info.jfif + 14);
    if (units === 1 && x > 0) return { x, y: y || x };
    if (units === 2 && x > 0) return { x: round1(x * 2.54), y: round1((y || x) * 2.54) };
  }
  if (info.exif >= 0) {
    const e = exifTags(b, info.exif);
    if (e && e.x >= 0 && e.y >= 0) {
      const unit = e.unit >= 0 ? e.rd16(e.unit) : 2;
      const rat = (o) => { const d = e.rd32(o + 4); return d ? e.rd32(o) / d : 0; };
      let x = rat(e.x), y = rat(e.y);
      if (unit === 3) { x *= 2.54; y *= 2.54; }
      if (x > 0 && (unit === 2 || unit === 3)) return { x: round1(x), y: round1(y || x) };
    }
  }
  return null;
}

function writeJpeg(b, dpi) {
  const info = scanJpeg(b);
  let out, shift = 0, written = false;
  if (info.jfif >= 0) {
    out = new Uint8Array(b);
    const p = info.jfif;
    out[p + 11] = 1; w16(out, p + 12, dpi); w16(out, p + 14, dpi);
    written = true;
  } else if (info.adobe === 0) {
    // An Adobe RGB file would be read as YCbCr once a JFIF block is present, so the colors would shift.
    out = new Uint8Array(b);
  } else {
    const seg = new Uint8Array([0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    w16(seg, 12, dpi); w16(seg, 14, dpi);
    out = new Uint8Array(b.length + JFIF_SEGMENT_LEN);
    out.set(b.subarray(0, 2), 0); out.set(seg, 2); out.set(b.subarray(2), 2 + JFIF_SEGMENT_LEN);
    shift = JFIF_SEGMENT_LEN;
    written = true;
  }
  // Keep EXIF in step with JFIF, when it already has resolution tags.
  if (info.exif >= 0) {
    const e = exifTags(out, info.exif + shift);
    if (e && e.x >= 0 && e.y >= 0) {
      e.wr32(e.x, dpi); e.wr32(e.x + 4, 1);
      e.wr32(e.y, dpi); e.wr32(e.y + 4, 1);
      if (e.unit >= 0) e.wr16(e.unit, 2);
      written = true;
    }
  }
  // Photoshop and Lightroom files also keep the resolution in an APP13 block, and Adobe tools read that one first.
  for (const seg of info.photoshop) {
    const d = photoshopResolution(out, seg + shift);
    if (d >= 0) {
      w32(out, d, dpi << 16); w16(out, d + 4, 1); w16(out, d + 6, 1); // 16.16 fixed point, unit 1 = pixels per inch
      w32(out, d + 8, dpi << 16); w16(out, d + 12, 1); w16(out, d + 14, 1);
      written = true;
    }
  }
  if (!written) throw new Error('This JPEG cannot take a DPI value without changing its colors.');
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
  const tail = chunks[chunks.length - 1].end;
  parts.push(b.subarray(tail));
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ---------- Public API ----------

/** Read type, pixel size and current DPI. Throws a plain message for unsupported or damaged files. */
export function inspect(bytes) {
  const type = detectType(bytes);
  if (type === 'jpeg') {
    const info = scanJpeg(bytes);
    if (!info.width || !info.height) throw new Error(DAMAGED);
    let { width, height } = info;
    const e = info.exif >= 0 ? exifTags(bytes, info.exif) : null;
    if (e && e.orient >= 0 && e.rd16(e.orient) >= 5 && e.rd16(e.orient) <= 8) [width, height] = [height, width]; // phone photo stored sideways
    return { type, width, height, dpi: readJpegDpi(bytes, info), cmyk: info.components === 4 };
  }
  if (type === 'png') {
    const r = readPng(bytes);
    if (!r.width || !r.height || !pngChunks(bytes).some((c) => c.type === 'IDAT')) throw new Error(DAMAGED);
    return { type, ...r };
  }
  throw new Error(NOT_SUPPORTED);
}

/** Return a new byte array with the DPI set. Pixel data stays byte-identical. */
export function setDpi(bytes, dpi) {
  dpi = Math.round(dpi);
  if (!(dpi >= 1 && dpi <= MAX_DPI)) throw new Error(`DPI must be between 1 and ${MAX_DPI}.`);
  const type = detectType(bytes);
  if (type === 'jpeg') return writeJpeg(bytes, dpi);
  if (type === 'png') return writePng(bytes, dpi);
  throw new Error(NOT_SUPPORTED);
}

/** Print size in inches and cm at a given DPI. */
export function printSize(width, height, dpi) {
  const w = width / dpi, h = height / dpi;
  return { inW: w, inH: h, cmW: w * 2.54, cmH: h * 2.54 };
}

/** Output file name: "photo.jpg" becomes "photo-300dpi.jpg". The extension follows the real file type. */
export function outName(name, dpi, type) {
  const base = name.replace(/\.[^.]*$/, '') || 'image';
  const ext = type === 'png' ? '.png' : /\.jpe?g$/i.test(name) ? name.slice(name.lastIndexOf('.')) : '.jpg';
  return `${base}-${dpi}dpi${ext}`;
}

/** Make names unique for a zip: a repeated name gets -2, -3 before the extension. */
export function uniqueNames(names) {
  const used = new Set();
  return names.map((n) => {
    let out = n, c = 1;
    while (used.has(out)) out = n.replace(/(\.[^.]*)?$/, `-${++c}$1`);
    used.add(out);
    return out;
  });
}
