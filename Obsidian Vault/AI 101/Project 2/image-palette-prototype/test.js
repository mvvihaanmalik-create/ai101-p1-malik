// Repeatable logic-only feasibility check. It does not replace a browser/phone test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

let pixels = new Uint8ClampedArray();
const context2d = {
  drawImage() {},
  getImageData() { return { data: pixels }; },
};
const fakeElement = { addEventListener() {} };
const sandbox = {
  document: {
    querySelector() { return fakeElement; },
    createElement(tag) {
      assert.equal(tag, 'canvas');
      return { getContext() { return context2d; } };
    },
  },
};
vm.createContext(sandbox);
const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
vm.runInContext(`${source}\nthis.testApi = { extractPalette, chooseRoles, contrast, distance };`, sandbox);
const { extractPalette, chooseRoles, contrast, distance } = sandbox.testApi;

function setPixels(colors, repeat = 100) {
  const values = [];
  for (const color of colors) {
    for (let i = 0; i < repeat; i++) values.push(...color);
  }
  pixels = Uint8ClampedArray.from(values);
}

const image = { naturalWidth: 40, naturalHeight: 40 };
setPixels([
  [194, 55, 48, 255],
  [25, 80, 145, 255],
  [236, 208, 154, 255],
  [28, 32, 38, 255],
]);
const colorful = extractPalette(image);
assert.ok(colorful.length >= 4, 'four distinct source colors should be found');
for (const [r, g, b] of [[194, 55, 48], [25, 80, 145], [236, 208, 154], [28, 32, 38]]) {
  assert.ok(colorful.some(color => distance(color, { r, g, b }) < 5), 'source color should appear in palette');
}
console.log('PASS colorful image: four source colors represented');

const smallAccent = [];
for (let i = 0; i < 9900; i++) smallAccent.push(90, 105, 120, 255);
for (let i = 0; i < 100; i++) smallAccent.push(0, 214, 246, 255);
pixels = Uint8ClampedArray.from(smallAccent);
const accentPalette = extractPalette({ naturalWidth: 100, naturalHeight: 100 });
assert.ok(accentPalette.some(color => color.isAccent && distance(color, { r: 0, g: 214, b: 246 }) < 5), 'small vivid cyan should be reserved as the accent');
assert.ok(distance(chooseRoles(accentPalette).accent, { r: 0, g: 214, b: 246 }) < 5, 'preview accent should use the vivid swatch');
console.log('PASS small vivid accent: retained and applied to preview');

setPixels([[160, 160, 160, 255]]);
const monotone = extractPalette(image);
const roles = chooseRoles(monotone);
assert.equal(monotone.length, 1, 'monotone image should not invent colors');
assert.equal(roles.fallback, true, 'readable text should use a fallback');
assert.ok(contrast(roles.background, roles.text) >= 4.5, 'text should meet the contrast threshold');
assert.ok(contrast(roles.accent, roles.buttonText) >= 4.5, 'button text should meet the contrast threshold');
console.log('PASS monotone image: one swatch and readable fallback text');

setPixels([[0, 0, 0, 0]]);
assert.equal(extractPalette(image).length, 0, 'fully transparent image has no visible palette');
console.log('PASS transparent image: no false palette');
