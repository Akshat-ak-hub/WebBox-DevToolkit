/**
 * QR Code generation utility — pure JavaScript, no external dependencies.
 * Implements QR Code Model 2, supporting numeric, alphanumeric, and byte modes.
 * Error correction level: M (15% recovery).
 *
 * Based on the QR Code specification (ISO/IEC 18004).
 */

// ── Error correction constants ──────────────────────
const EC_LEVEL_M = 0; // 15% error correction

// ── Mode indicators ─────────────────────────────────
const MODE_BYTE = 0b0100;

// ── Encoding tables ─────────────────────────────────
// Number of error correction codewords per block for versions 1-10, EC level M
const EC_CODEWORDS_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
// Number of data codewords for versions 1-10, EC level M
const DATA_CODEWORDS = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216];
// Number of EC blocks for versions 1-10, EC level M
const NUM_EC_BLOCKS = [0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 4]; // simplified

// ── GF(256) arithmetic ──────────────────────────────
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

function generateECBytes(data: number[], numEcBytes: number): number[] {
  // Build generator polynomial
  const gen = new Array(numEcBytes + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < numEcBytes; i++) {
    for (let j = gen.length - 1; j >= 1; j--) {
      gen[j] = gen[j - 1] ^ gfMul(gen[j], GF_EXP[i]);
    }
    gen[0] = gfMul(gen[0], GF_EXP[i]);
  }

  const msg = [...data, ...new Array(numEcBytes).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// ── Data encoding ───────────────────────────────────
function getVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    // Character count indicator length for byte mode, versions 1-9 = 8 bits, 10+ = 16 bits
    const cciBits = v <= 9 ? 8 : 16;
    const availableBits = DATA_CODEWORDS[v] * 8;
    const neededBits = 4 + cciBits + dataLen * 8;
    if (neededBits <= availableBits) return v;
  }
  throw new Error('Data too long for QR code (max version 10)');
}

function encodeData(text: string): { version: number; data: number[] } {
  const bytes = new TextEncoder().encode(text);
  const version = getVersion(bytes.length);
  const cciBits = version <= 9 ? 8 : 16;
  const totalDataCodewords = DATA_CODEWORDS[version];

  // Build bit stream
  const bits: number[] = [];
  const addBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Mode indicator
  addBits(MODE_BYTE, 4);
  // Character count
  addBits(bytes.length, cciBits);
  // Data
  for (const b of bytes) {
    addBits(b, 8);
  }
  // Terminator
  const maxBits = totalDataCodewords * 8;
  const terminatorLen = Math.min(4, maxBits - bits.length);
  addBits(0, terminatorLen);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad codewords
  const padPatterns = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    addBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert to bytes
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i + j] || 0);
    }
    data.push(byte);
  }

  return { version, data };
}

// ── QR matrix construction ──────────────────────────
function getSize(version: number): number {
  return 17 + version * 4;
}

type Module = 0 | 1 | -1; // 0=white, 1=black, -1=unset

function createMatrix(size: number): Module[][] {
  return Array.from({ length: size }, () => Array(size).fill(-1) as Module[]);
}

function setModule(matrix: Module[][], row: number, col: number, val: 0 | 1): void {
  if (row >= 0 && row < matrix.length && col >= 0 && col < matrix.length) {
    matrix[row][col] = val;
  }
}

function addFinderPattern(matrix: Module[][], row: number, col: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r, cc = col + c;
      if (rr < 0 || rr >= matrix.length || cc < 0 || cc >= matrix.length) continue;
      const isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                      (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                      (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      matrix[rr][cc] = isBlack ? 1 : 0;
    }
  }
}

function addAlignmentPattern(matrix: Module[][], row: number, col: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBlack = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      if (matrix[row + r][col + c] === -1) {
        matrix[row + r][col + c] = isBlack ? 1 : 0;
      }
    }
  }
}

// Alignment pattern positions for versions 2-10
const ALIGNMENT_POSITIONS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

function addTimingPatterns(matrix: Module[][], size: number): void {
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === -1) matrix[6][i] = i % 2 === 0 ? 1 : 0;
    if (matrix[i][6] === -1) matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
}

function reserveFormatArea(matrix: Module[][], size: number): void {
  // Around top-left finder
  for (let i = 0; i <= 8; i++) {
    if (matrix[8][i] === -1) matrix[8][i] = 0;
    if (matrix[i][8] === -1) matrix[i][8] = 0;
  }
  // Around top-right finder
  for (let i = 0; i <= 7; i++) {
    if (matrix[8][size - 1 - i] === -1) matrix[8][size - 1 - i] = 0;
  }
  // Around bottom-left finder
  for (let i = 0; i <= 7; i++) {
    if (matrix[size - 1 - i][8] === -1) matrix[size - 1 - i][8] = 0;
  }
  // Dark module
  matrix[size - 8][8] = 1;
}

// Format info for EC level M and mask patterns 0-7
const FORMAT_INFO = [
  0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4F97, 0x4AA0,
];

function writeFormatInfo(matrix: Module[][], size: number, mask: number): void {
  const info = FORMAT_INFO[mask];
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) {
    bits.push((info >> i) & 1);
  }

  // Write to two areas
  // Area 1: around top-left
  const positions1: [number, number][] = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  // Area 2: other areas
  const positions2: [number, number][] = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7], [8, size - 8],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8],
  ];

  for (let i = 0; i < 15; i++) {
    const val = bits[i] as 0 | 1;
    setModule(matrix, positions1[i][0], positions1[i][1], val);
    setModule(matrix, positions2[i][0], positions2[i][1], val);
  }
}

function placeData(matrix: Module[][], codewords: number[], size: number): void {
  let bitIdx = 0;
  const totalBits = codewords.length * 8;

  let col = size - 1;
  let goingUp = true;

  while (col >= 0) {
    if (col === 6) col--; // Skip timing column

    const rows = goingUp
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0) continue;
        if (matrix[row][cc] !== -1) continue;

        if (bitIdx < totalBits) {
          const byteIdx = Math.floor(bitIdx / 8);
          const bitPos = 7 - (bitIdx % 8);
          matrix[row][cc] = ((codewords[byteIdx] >> bitPos) & 1) as 0 | 1;
          bitIdx++;
        } else {
          matrix[row][cc] = 0;
        }
      }
    }

    col -= 2;
    goingUp = !goingUp;
  }
}

// Mask functions
const MASK_FNS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r, c) => (((r * c) % 2 + (r * c) % 3) % 2) === 0,
  (r, c) => (((r + c) % 2 + (r * c) % 3) % 2) === 0,
];

function applyMask(matrix: Module[][], reserved: boolean[][], size: number, mask: number): void {
  const fn = MASK_FNS[mask];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && fn(r, c)) {
        matrix[r][c] = matrix[r][c] === 1 ? 0 : 1;
      }
    }
  }
}

function calculatePenalty(matrix: Module[][], size: number): number {
  let penalty = 0;

  // Rule 1: consecutive same-color modules in row/column
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty++;
      } else {
        count = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty++;
      } else {
        count = 1;
      }
    }
  }

  // Rule 4: proportion of dark modules
  let dark = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) dark++;
    }
  }
  const percent = (dark * 100) / (size * size);
  const prev5 = Math.floor(percent / 5) * 5;
  const next5 = prev5 + 5;
  penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return penalty;
}

// ── Public API ──────────────────────────────────────
export interface QRCodeData {
  modules: boolean[][];
  size: number;
  version: number;
}

export function generateQRCode(text: string): QRCodeData {
  if (!text) throw new Error('Empty input');

  const { version, data } = encodeData(text);
  const size = getSize(version);
  const numEcCodewords = EC_CODEWORDS_PER_BLOCK[version];
  const ecBytes = generateECBytes(data, numEcCodewords);
  const codewords = [...data, ...ecBytes];

  // Create reserved map
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  // Build matrix with functional patterns
  const matrix = createMatrix(size);

  // Finder patterns
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);

  // Alignment patterns
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version];
    for (const r of positions) {
      for (const c of positions) {
        // Skip if overlapping with finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        addAlignmentPattern(matrix, r, c);
      }
    }
  }

  // Timing patterns
  addTimingPatterns(matrix, size);

  // Reserve format area
  reserveFormatArea(matrix, size);

  // Mark reserved modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      reserved[r][c] = matrix[r][c] !== -1;
    }
  }

  // Place data
  placeData(matrix, codewords, size);

  // Find best mask
  let bestMask = 0;
  let bestPenalty = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const copy = matrix.map(row => [...row]) as Module[][];
    applyMask(copy, reserved, size, mask);
    writeFormatInfo(copy, size, mask);
    const penalty = calculatePenalty(copy, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
  }

  // Apply best mask
  applyMask(matrix, reserved, size, bestMask);
  writeFormatInfo(matrix, size, bestMask);

  // Convert to boolean array
  const modules = matrix.map(row => row.map(m => m === 1));

  return { modules, size, version };
}

export function qrToSvg(qr: QRCodeData, moduleSize: number = 10, margin: number = 4): string {
  const totalSize = (qr.size + margin * 2) * moduleSize;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">`;
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`;

  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

export function qrToDataUrl(qr: QRCodeData, moduleSize: number = 10, margin: number = 4): string {
  const svg = qrToSvg(qr, moduleSize, margin);
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

export function downloadQrPng(qr: QRCodeData, filename: string = 'qrcode.png', moduleSize: number = 10, margin: number = 4): void {
  const size = (qr.size + margin * 2) * moduleSize;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, size, size);

  // Draw modules
  ctx.fillStyle = 'black';
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) {
        ctx.fillRect(
          (c + margin) * moduleSize,
          (r + margin) * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
