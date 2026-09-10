const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table for standard PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw bitmap data: each row starts with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = width / 2;
  const safeRadius = isMaskable ? maxRadius * 0.75 : maxRadius * 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark elegant background #09090b
      let r = 9;
      let g = 9;
      let b = 11;
      let a = 255;

      // Outer gold border glow if within safe zone
      if (dist < safeRadius && dist > safeRadius - (width * 0.025)) {
        r = 245;
        g = 158;
        b = 11;
      } else if (dist <= safeRadius - (width * 0.025)) {
        // Book area
        const bookW = width * (isMaskable ? 0.44 : 0.52);
        const bookH = height * (isMaskable ? 0.56 : 0.65);
        const bx = x - (cx - bookW / 2);
        const by = y - (cy - bookH / 2);

        if (bx >= 0 && bx <= bookW && by >= 0 && by <= bookH) {
          // Inside book
          const isSpine = bx < bookW * 0.12;
          const isRibbon = bx > bookW * 0.65 && bx < bookW * 0.82 && by < bookH * 0.55;
          const isPageLine = (by > bookH * 0.3 && by < bookH * 0.35 && bx < bookW * 0.85) ||
                             (by > bookH * 0.48 && by < bookH * 0.53 && bx < bookW * 0.75) ||
                             (by > bookH * 0.66 && by < bookH * 0.71 && bx < bookW * 0.65);

          if (isRibbon) {
            r = 251; g = 191; b = 36; // bright gold
          } else if (isSpine) {
            r = 217; g = 119; b = 6; // amber spine
          } else if (isPageLine) {
            r = 245; g = 158; b = 11; // gold lines
          } else {
            r = 24; g = 24; b = 27; // dark zinc card
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), generatePng(64, 64, false));

console.log('Successfully generated high-res PWA and iOS icons!');
