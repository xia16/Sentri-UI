// PNG decoding and an exact pixel diff in Node, so comparing two shots needs no browser (the scheduler's workers stay for rendering).
// Handles what Chromium writes: 8-bit greyscale, RGB, RGBA (and grey+alpha), not interlaced. Anything else throws.
import zlib from 'node:zlib';

export function decodePng(buf) {
  const b = Buffer.from(buf);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8, w = 0, h = 0, depth = 0, type = 0, interlace = 0;
  const idat = [];
  while (off < b.length) {
    const len = b.readUInt32BE(off), kind = b.toString('latin1', off + 4, off + 8), data = b.subarray(off + 8, off + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12]; }
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    off += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[type];
  if (depth !== 8 || !channels || interlace) throw new Error(`unsupported PNG (depth ${depth}, colour type ${type}, interlace ${interlace})`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * channels, px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0, up = prev[x], c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      cur[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const s = x * channels, d = (y * w + x) * 4;
      if (channels === 1 || channels === 2) { px[d] = px[d + 1] = px[d + 2] = cur[s]; px[d + 3] = channels === 2 ? cur[s + 1] : 255; }
      else { px[d] = cur[s]; px[d + 1] = cur[s + 1]; px[d + 2] = cur[s + 2]; px[d + 3] = channels === 4 ? cur[s + 3] : 255; }
    }
    [prev, cur] = [cur, prev];
  }
  return { width: w, height: h, data: px };
}

// The share of pixels that differ in any channel, in percent, over the larger of the two sizes (a pixel only one image has counts).
// Identical bytes are 0 without decoding; an image that doesn't decode counts as all different.
export function pctDiff(a, b) {
  if (Buffer.from(a).equals(Buffer.from(b))) return 0;
  let x, y;
  try { x = decodePng(a); y = decodePng(b); } catch { return 100; }
  const w = Math.max(x.width, y.width), h = Math.max(x.height, y.height);
  let n = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const inX = i < x.width && j < x.height, inY = i < y.width && j < y.height;
    if (!inX || !inY) { n++; continue; }
    const p = (j * x.width + i) * 4, q = (j * y.width + i) * 4;
    if (x.data[p] !== y.data[q] || x.data[p + 1] !== y.data[q + 1] || x.data[p + 2] !== y.data[q + 2] || x.data[p + 3] !== y.data[q + 3]) n++;
  }
  return (n / (w * h)) * 100;
}
