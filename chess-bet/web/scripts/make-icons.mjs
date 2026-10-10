import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const png = (size, px) => {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = px(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
};
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const BLUE = [59, 130, 246], VIOLET = [124, 58, 237], LIGHT = [240, 244, 255], DARK = [20, 24, 46], GOLD = [250, 204, 21];
const draw = (scale) => (u, v) => {
  let c = mix(BLUE, VIOLET, (u + v) / 2);
  const x = (u - 0.5) / scale + 0.5, y = (v - 0.5) / scale + 0.5;
  const B0 = 0.14, B1 = 0.86;
  if (x >= B0 && x < B1 && y >= B0 && y < B1) {
    const cx = Math.floor(((x - B0) / (B1 - B0)) * 4), cy = Math.floor(((y - B0) / (B1 - B0)) * 4);
    c = (cx + cy) % 2 === 0 ? LIGHT : DARK;
    const d = Math.hypot(x - 0.5, y - 0.5);
    if (d < 0.17) c = d < 0.12 ? GOLD : mix(GOLD, DARK, 0.5);
  }
  return c;
};
const out = process.argv[2] || "public";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "icon-192.png"), png(192, draw(1)));
fs.writeFileSync(path.join(out, "icon-512.png"), png(512, draw(1)));
fs.writeFileSync(path.join(out, "icon-maskable-512.png"), png(512, draw(0.72)));
console.log("Иконки созданы в", out);
