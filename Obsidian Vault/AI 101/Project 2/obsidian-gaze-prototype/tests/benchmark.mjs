import esbuild from 'esbuild';
import { performance } from 'node:perf_hooks';

const bundled = await esbuild.build({ entryPoints: ['filters.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { FILTERS } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const width = 1600, height = 1000;
const source = new Uint8ClampedArray(width * height * 4);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const i = (y * width + x) * 4;
  source[i] = x % 256;
  source[i + 1] = y % 256;
  source[i + 2] = (x + y) % 256;
  source[i + 3] = 255;
}
for (const [name, grade] of Object.entries(FILTERS)) {
  const image = { width, height, data: new Uint8ClampedArray(source) };
  const start = performance.now();
  grade(image);
  console.log(`${name}: ${(performance.now() - start).toFixed(0)} ms at ${width}×${height}`);
}
