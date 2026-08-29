import { writeFileSync } from "node:fs";
import zlib from "node:zlib";

function makePng(w, h, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type);
    const crc = Buffer.alloc(4);
    const crcTable = zlib.crc32 ? null : null;
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal >>> 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  function crc32(buf) {
    let c;
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (crc ^ buf[i]) & 0xff;
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
      crc = (crc >>> 8) ^ c;
    }
    return crc ^ 0xffffffff;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const rowSize = w * 3 + 1;
  const raw = Buffer.alloc(rowSize * h);
  for (let y = 0; y < h; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < w; x++) {
      const off = y * rowSize + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }
  const idatData = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))]);
}

writeFileSync("scratch-img1.png", makePng(200, 200, [200, 50, 50]));
writeFileSync("scratch-img2.png", makePng(200, 200, [50, 200, 50]));
writeFileSync("scratch-img3.png", makePng(200, 200, [50, 50, 200]));
console.log("done");
