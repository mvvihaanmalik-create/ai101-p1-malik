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
vm.runInContext(`${source}\nthis.testApi = { extractPalette, chooseRoles, withAccent, contrast, distance };`, sandbox);
const { extractPalette, chooseRoles, withAccent, contrast, distance } = sandbox.testApi;

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

const autoRoles = chooseRoles(colorful);
const alternate = colorful.find(color => color !== autoRoles.accent);
const manualRoles = withAccent(autoRoles, alternate);
assert.equal(manualRoles.background, autoRoles.background, 'manual accent must not change background');
assert.equal(manualRoles.text, autoRoles.text, 'manual accent must not change text');
assert.equal(manualRoles.accent, alternate, 'selected swatch should become accent');
assert.ok(contrast(manualRoles.accent, manualRoles.buttonText) >= 4.5, 'button text should adjust for the selected accent');
console.log('PASS manual accent: only accent/button-text roles change');

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

// Exercise the actual upload/change, swatch click, and reset handlers with a
// tiny DOM stand-in. Real browser and touch behavior still need a user check.
class FakeElement {
  constructor() {
    this.children = [];
    this.handlers = {};
    this.dataset = {};
    this.attributes = {};
    this.style = {
      values: {},
      setProperty(name, value) { this.values[name] = value; },
      removeProperty(name) { delete this.values[name]; },
    };
    this.classList = { toggle() {} };
  }
  addEventListener(name, handler) { this.handlers[name] = handler; }
  replaceChildren(...children) { this.children = children; }
  append(...children) { this.children.push(...children); }
  removeAttribute(name) { delete this.attributes[name]; }
  setAttribute(name, value) { this.attributes[name] = value; }
  querySelectorAll(selector) {
    return selector === '.swatch' ? this.children.filter(child => child.className?.includes('swatch')) : [];
  }
}

(async () => {
  const ids = ['image-input', 'status', 'source-wrap', 'source-preview', 'preview-image', 'palette', 'accent-controls', 'reset-accent', 'site-preview', 'role-note'];
  const elements = Object.fromEntries(ids.map(id => [id, new FakeElement()]));
  elements['image-input'].files = [{ name: 'test.png', type: 'image/png', size: 100 }];
  const uiPixels = Uint8ClampedArray.from([
    ...Array(80).fill([90, 105, 120, 255]).flat(),
    ...Array(20).fill([0, 214, 246, 255]).flat(),
  ]);
  const uiContext = { drawImage() {}, getImageData() { return { data: uiPixels }; } };
  const uiDocument = {
    querySelector(selector) { return elements[selector.slice(1)]; },
    createElement(tag) {
      if (tag === 'canvas') return { getContext() { return uiContext; } };
      return new FakeElement();
    },
  };
  class FakeImage {
    constructor() { this.naturalWidth = 10; this.naturalHeight = 10; }
    set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
    get src() { return this._src; }
  }
  const uiSandbox = {
    document: uiDocument,
    Image: FakeImage,
    URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  };
  vm.createContext(uiSandbox);
  vm.runInContext(source, uiSandbox);
  await elements['image-input'].handlers.change();

  const site = elements['site-preview'];
  const swatches = elements.palette.children;
  const autoAccent = site.style.values['--accent'];
  assert.ok(swatches.length >= 2, 'upload should render swatch buttons');
  assert.equal(elements['accent-controls'].hidden, false, 'accent control should appear after upload');
  assert.equal(elements['reset-accent'].disabled, true, 'reset should start disabled in auto mode');

  const alternateButton = swatches.find(button => button.dataset.color !== autoAccent);
  alternateButton.handlers.click();
  assert.equal(site.style.values['--accent'], alternateButton.dataset.color, 'swatch click should update site accent');
  assert.equal(alternateButton.attributes['aria-pressed'], 'true', 'chosen swatch should announce its selected state');
  assert.equal(elements['reset-accent'].disabled, false, 'reset should become available after manual selection');
  assert.ok(elements['role-note'].textContent.includes('manual'), 'role note should label manual mode');

  elements['reset-accent'].handlers.click();
  assert.equal(site.style.values['--accent'], autoAccent, 'reset should restore automatic accent');
  assert.equal(elements['reset-accent'].disabled, true, 'reset should disable again in auto mode');
  assert.ok(elements['role-note'].textContent.includes('automatic'), 'role note should label automatic mode');
  console.log('PASS UI handlers: image upload, swatch accent override, reset to auto');
})().catch(error => { console.error(error); process.exitCode = 1; });
