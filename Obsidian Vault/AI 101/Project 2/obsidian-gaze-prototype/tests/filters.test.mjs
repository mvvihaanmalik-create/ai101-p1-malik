import test from 'node:test';
import assert from 'node:assert/strict';
import esbuild from 'esbuild';

const bundled = await esbuild.build({
  entryPoints: ['filters.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const filters = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

function sample(width = 12, height = 8) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    data[i] = x * 17 + y * 3;
    data[i + 1] = 40 + y * 20;
    data[i + 2] = 180 - x * 8;
    data[i + 3] = (x === 0 && y === 0) ? 0 : 255;
  }
  return { width, height, data };
}

test('the four named grades mutate and return their image, retain dimensions/alpha, and differ', () => {
  const signatures = new Set();
  for (const id of ['wes-anderson', 'wong-kar-wai', 'greta-gerwig', 'david-lynch']) {
    const image = sample();
    const original = new Uint8ClampedArray(image.data);
    assert.equal(filters.FILTERS[id](image), image);
    assert.equal(image.width, 12);
    assert.equal(image.height, 8);
    for (let i = 3; i < image.data.length; i += 4) assert.equal(image.data[i], original[i]);
    assert.notDeepEqual(image.data, original, id);
    signatures.add(Buffer.from(image.data).toString('base64'));
  }
  assert.equal(signatures.size, 4);
});

test('grain is stable and transparent pixels stay untouched', () => {
  const first = sample();
  const second = sample();
  filters.wongKarWai(first);
  filters.wongKarWai(second);
  assert.deepEqual(first.data, second.data);
  assert.deepEqual([...first.data.slice(0, 4)], [...sample().data.slice(0, 4)]);
});

test('separable blur preserves a constant color including edge pixels', () => {
  const source = new Uint8ClampedArray(5 * 3 * 4);
  for (let i = 0; i < source.length; i += 4) source.set([70, 90, 110, 255], i);
  for (const blurred of [filters.horizontalBlur(source, 5, 3, 2), filters.boxBlur(source, 5, 3, 2)]) {
    for (let i = 0; i < blurred.length; i += 4) {
      assert.ok(Math.abs(blurred[i] - 70) < 0.001);
      assert.ok(Math.abs(blurred[i + 1] - 90) < 0.001);
      assert.ok(Math.abs(blurred[i + 2] - 110) < 0.001);
      assert.ok(Math.abs(blurred[i + 3] - 255) < 0.001);
    }
  }
});

test('Canvas bridge returns graded pixels without changing the source canvas', () => {
  const original = sample(4, 4);
  let outputPixels = null;
  const sourceCanvas = {
    width: original.width,
    height: original.height,
    getContext: () => ({ getImageData: () => ({ ...original, data: new Uint8ClampedArray(original.data) }) }),
  };
  globalThis.document = {
    createElement: name => {
      assert.equal(name, 'canvas');
      return {
        width: 0,
        height: 0,
        getContext: () => ({ putImageData: pixels => { outputPixels = pixels; } }),
      };
    },
  };
  const before = new Uint8ClampedArray(original.data);
  const output = filters.applyFilter(sourceCanvas, 'wes-anderson');
  assert.equal(output.width, 4);
  assert.equal(output.height, 4);
  assert.notDeepEqual(outputPixels.data, before);
  assert.deepEqual(original.data, before);
  assert.throws(() => filters.applyFilter(sourceCanvas, 'not-a-filter'), /Unknown Gaze filter/);
  delete globalThis.document;
});
