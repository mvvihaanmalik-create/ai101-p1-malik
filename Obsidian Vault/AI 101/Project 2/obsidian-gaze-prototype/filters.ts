// Pixel-level grades are pure with respect to the DOM: each named grade only
// changes the ImageData it receives. The Canvas bridge is applyFilter below.
type RGB = readonly [number, number, number];
type PixelBuffer = Uint8ClampedArray | Float32Array;

export const clamp = (v: number, min = 0, max = 255): number => Math.min(max, Math.max(min, v));
export const clamp01 = (v: number): number => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const luminance = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
export const shadowWeight = (l: number): number => 1 - smoothstep(38, 145, l);
export const highlightWeight = (l: number): number => smoothstep(120, 230, l);
export const midtoneWeight = (l: number): number => smoothstep(35, 112, l) * (1 - smoothstep(155, 230, l));

export function saturate(r: number, g: number, b: number, factor: number): [number, number, number] {
  const l = luminance(r, g, b);
  return [lerp(l, r, factor), lerp(l, g, factor), lerp(l, b, factor)];
}

export function applyTone(r: number, g: number, b: number, l: number, shadowTint: RGB, midTint: RGB, highTint: RGB): [number, number, number] {
  const sw = shadowWeight(l), mw = midtoneWeight(l), hw = highlightWeight(l);
  return [
    r + shadowTint[0] * sw + midTint[0] * mw + highTint[0] * hw,
    g + shadowTint[1] * sw + midTint[1] * mw + highTint[1] * hw,
    b + shadowTint[2] * sw + midTint[2] * mw + highTint[2] * hw,
  ];
}

// Maps a black pixel to amount while leaving white at white.
export const liftBlacks = (v: number, amount: number): number => v + amount * (1 - clamp01(v / 255)) ** 2;
export const crushBlacks = (v: number, amount: number, threshold: number): number => v * (1 - amount * (1 - smoothstep(0, threshold, v)));

export function vignetteFactor(x: number, y: number, width: number, height: number, strength: number): number {
  const dx = ((x + 0.5) / width - 0.5) * 2;
  const dy = ((y + 0.5) / height - 0.5) * 2;
  const distance = Math.sqrt((dx * dx + dy * dy) / 2);
  return 1 - strength * smoothstep(0.23, 0.94, distance);
}

export function vignetteTint(r: number, g: number, b: number, x: number, y: number, width: number, height: number, maxStrength: number, tint: RGB): [number, number, number] {
  const blend = 1 - vignetteFactor(x, y, width, height, maxStrength);
  return [lerp(r, tint[0], blend), lerp(g, tint[1], blend), lerp(b, tint[2], blend)];
}

// Sliding-window blurs are O(width*height) per pass, not O(radius²) per pixel.
export function horizontalBlur(src: PixelBuffer, width: number, height: number, radius: number): Float32Array {
  const out = new Float32Array(src.length);
  const r = Math.max(0, Math.floor(radius));
  const divisor = 2 * r + 1;
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += src[row + clamp(k, 0, width - 1) * 4 + c]!;
      for (let x = 0; x < width; x++) {
        out[row + x * 4 + c] = sum / divisor;
        const leaving = clamp(x - r, 0, width - 1);
        const entering = clamp(x + r + 1, 0, width - 1);
        sum += src[row + entering * 4 + c]! - src[row + leaving * 4 + c]!;
      }
    }
  }
  return out;
}

export function boxBlur(src: PixelBuffer, width: number, height: number, radius: number): Float32Array {
  const horizontal = horizontalBlur(src, width, height, radius);
  const out = new Float32Array(src.length);
  const r = Math.max(0, Math.floor(radius));
  const divisor = 2 * r + 1;
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += horizontal[(clamp(k, 0, height - 1) * width + x) * 4 + c]!;
      for (let y = 0; y < height; y++) {
        out[(y * width + x) * 4 + c] = sum / divisor;
        const leaving = clamp(y - r, 0, height - 1);
        const entering = clamp(y + r + 1, 0, height - 1);
        sum += horizontal[(entering * width + x) * 4 + c]! - horizontal[(leaving * width + x) * 4 + c]!;
      }
    }
  }
  return out;
}

export const grainAmountFor = (base: number, l: number): number => base * (0.65 + 0.7 * (1 - clamp01(l / 255)));

// Hashing image-space grain cells keeps repeated renders of a grade stable.
function grainNoise(x: number, y: number, seed: number): number {
  let n = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263) + Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0xffffffff * 2 - 1;
}

export function applyFilmGrain(data: Uint8ClampedArray, width: number, height: number, options: { amount: number; size: number; tint: RGB }): void {
  const size = Math.max(1, Math.floor(options.size));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    const l = luminance(data[i]!, data[i + 1]!, data[i + 2]!);
    const n = grainNoise(Math.floor(x / size), Math.floor(y / size), 17) * grainAmountFor(options.amount, l);
    data[i] = clamp(data[i]! + n * options.tint[0]);
    data[i + 1] = clamp(data[i + 1]! + n * options.tint[1]);
    data[i + 2] = clamp(data[i + 2]! + n * options.tint[2]);
  }
}

function blendBlur(data: Uint8ClampedArray, blurred: Float32Array, width: number, height: number, strength: (l: number, edge: number) => number): void {
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    const l = luminance(data[i]!, data[i + 1]!, data[i + 2]!);
    const bl = luminance(blurred[i]!, blurred[i + 1]!, blurred[i + 2]!);
    const mix = strength(l, clamp01(Math.abs(l - bl) / 35));
    data[i] = lerp(data[i]!, blurred[i]!, mix);
    data[i + 1] = lerp(data[i + 1]!, blurred[i + 1]!, mix);
    data[i + 2] = lerp(data[i + 2]!, blurred[i + 2]!, mix);
  }
}

export function wesAnderson(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    let r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    [r, g, b] = applyTone(r, g, b, luminance(r, g, b), [20, 12, 2], [11, 11, -5], [-5, -2, 6]);
    [r, g, b] = vignetteTint(r, g, b, x, y, width, height, 0.05, [72, 52, 36]);
    r = 128 + (liftBlacks(r, 12) - 128) * 0.9;
    g = 128 + (liftBlacks(g, 10) - 128) * 0.9;
    b = 128 + (liftBlacks(b, 7) - 128) * 0.9;
    [data[i], data[i + 1], data[i + 2]] = saturate(r, g, b, 1.18);
  }
  blendBlur(data, boxBlur(data, width, height, 3), width, height, (_l, edge) => 0.04 + 0.22 * edge);
  applyFilmGrain(data, width, height, { amount: 8, size: 1, tint: [1.12, 1, 0.82] });
  return imageData;
}

export function wongKarWai(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    let r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const l = luminance(r, g, b);
    [r, g, b] = applyTone(r, g, b, l, [-12, 8, 6], [18, -8, 10], [16, 6, -12]);
    [r, g, b] = vignetteTint(r, g, b, x, y, width, height, 0.27, [110, 55, 10]);
    r += 4; g += 3; b -= 4;
    const redAmber = clamp01((r * 0.7 + g * 0.3 - b - 20) / 100);
    [data[i], data[i + 1], data[i + 2]] = saturate(r, g, b, 1.27 + 0.18 * redAmber * midtoneWeight(l));
  }
  const redness = new Float32Array(data.length);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) redness[i] = Math.max(0, data[i]! - (data[i + 1]! + data[i + 2]!) / 2);
  }
  const bloom = boxBlur(redness, width, height, 7);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = clamp(data[i]! + bloom[i]! * 0.16);
    data[i + 1] = clamp(data[i + 1]! + bloom[i]! * 0.035);
  }
  blendBlur(data, horizontalBlur(data, width, height, 1), width, height, () => 0.3);
  applyFilmGrain(data, width, height, { amount: 18, size: 2, tint: [1.18, 1, 0.75] });
  return imageData;
}

export function gretaGerwig(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    let r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const l = luminance(r, g, b);
    [r, g, b] = applyTone(r, g, b, l, [6, -4, 10], [12, 6, -4], [-6, 3, 5]);
    r = 128 + (liftBlacks(r, 21) - 128) * 0.92;
    g = 128 + (liftBlacks(g, 20) - 128) * 0.92;
    b = 128 + (liftBlacks(b, 22) - 128) * 0.92;
    [data[i], data[i + 1], data[i + 2]] = saturate(r, g, b, lerp(0.95, 1.35, highlightWeight(l)));
  }
  blendBlur(data, boxBlur(data, width, height, 3), width, height, l => 0.1 + 0.18 * highlightWeight(l));
  applyFilmGrain(data, width, height, { amount: 4, size: 1, tint: [1, 1, 1.02] });
  return imageData;
}

export function davidLynch(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    let r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const l = luminance(r, g, b);
    const keepRed = clamp01((r - (g + b) / 2 - 50) / 70);
    const baseFactor = shadowWeight(l) * 0.15 + midtoneWeight(l) * 0.1 + highlightWeight(l) * 0.12;
    [r, g, b] = saturate(r, g, b, lerp(baseFactor, 0.95, keepRed));
    [r, g, b] = applyTone(r, g, b, l, [-10, -6, 16], [0, 0, 0], [10, 5, -6]);
    const vf = vignetteFactor(x, y, width, height, 0.94);
    data[i] = clamp(crushBlacks(r, 0.85, 75) * vf);
    data[i + 1] = clamp(crushBlacks(g, 0.85, 75) * vf);
    data[i + 2] = clamp(crushBlacks(b, 0.85, 75) * vf);
  }
  blendBlur(data, boxBlur(data, width, height, 3), width, height, () => 0.1);
  applyFilmGrain(data, width, height, { amount: 20, size: 3, tint: [1, 0.97, 0.94] });
  return imageData;
}

export const FILTERS: Record<string, (imageData: ImageData) => ImageData> = {
  'wes-anderson': wesAnderson,
  'wong-kar-wai': wongKarWai,
  'greta-gerwig': gretaGerwig,
  'david-lynch': davidLynch,
};

export function applyFilter(sourceCanvas: HTMLCanvasElement, filterId: string): HTMLCanvasElement {
  const grade = FILTERS[filterId];
  if (!grade) throw new Error(`Unknown Gaze filter: ${filterId}`);
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const outputContext = output.getContext('2d');
  if (!sourceContext || !outputContext) throw new Error('Canvas 2D is unavailable.');
  const pixels = sourceContext.getImageData(0, 0, output.width, output.height);
  outputContext.putImageData(grade(pixels), 0, 0);
  return output;
}
