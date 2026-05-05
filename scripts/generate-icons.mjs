import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii')
  const lb = Buffer.allocUnsafe(4)
  lb.writeUInt32BE(data.length, 0)
  const cb = Buffer.allocUnsafe(4)
  cb.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0)
  return Buffer.concat([lb, tb, data, cb])
}

// Creates a simple icon: amber background (#d97706) + white "K" letter
function createIcon(size) {
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Amber: #d97706 = 217, 119, 6
  const raw = Buffer.allocUnsafe(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3)
    raw[row] = 0 // filter: none
    const cx = size / 2, cy = size / 2
    const r = size * 0.38
    for (let x = 0; x < size; x++) {
      const px = row + 1 + x * 3
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      // White circle background in center, amber elsewhere
      const inCircle = dist < r
      if (inCircle) {
        // Draw "K" letter in amber on white
        const lx = (x - cx) / r, ly = (y - cy) / r
        const onK = isOnK(lx, ly)
        raw[px] = onK ? 217 : 255
        raw[px + 1] = onK ? 119 : 255
        raw[px + 2] = onK ? 6 : 255
      } else {
        // Amber background
        raw[px] = 217; raw[px + 1] = 119; raw[px + 2] = 6
      }
    }
  }

  function isOnK(lx, ly) {
    const t = 0.12 // stroke thickness
    // Vertical bar of K: x from -0.45 to -0.45+t
    const inVbar = lx >= -0.5 && lx <= -0.5 + t * 1.5 && ly >= -0.55 && ly <= 0.55
    // Upper diagonal: going from (-0.5+t, 0) to (0.5, -0.55)
    if (!inVbar) {
      // Upper arm
      const slope = (-0.55 - 0.0) / (0.5 - (-0.5 + t * 1.5))
      const b = 0.0 - slope * (-0.5 + t * 1.5)
      const lineY = slope * lx + b
      const inUpper = lx >= -0.5 + t * 1.5 && lx <= 0.5 && ly >= -0.55 && ly <= 0.0 && Math.abs(ly - lineY) < t * 0.9
      // Lower arm
      const slope2 = (0.55 - 0.0) / (0.5 - (-0.5 + t * 1.5))
      const b2 = 0.0 - slope2 * (-0.5 + t * 1.5)
      const lineY2 = slope2 * lx + b2
      const inLower = lx >= -0.5 + t * 1.5 && lx <= 0.5 && ly >= 0.0 && ly <= 0.55 && Math.abs(ly - lineY2) < t * 0.9
      return inUpper || inLower
    }
    return inVbar
  }

  const compressed = deflateSync(raw)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', createIcon(192))
writeFileSync('public/icons/icon-512.png', createIcon(512))
console.log('✓ Icons generated: public/icons/icon-192.png, public/icons/icon-512.png')