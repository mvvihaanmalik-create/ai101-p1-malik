const input = document.querySelector('#image-input');
const status = document.querySelector('#status');
const sourceWrap = document.querySelector('#source-wrap');
const sourcePreview = document.querySelector('#source-preview');
const previewImage = document.querySelector('#preview-image');
const paletteNode = document.querySelector('#palette');
const sitePreview = document.querySelector('#site-preview');
const roleNote = document.querySelector('#role-note');

const MAX_FILE_BYTES = 20 * 1024 * 1024;
let displayedObjectUrl = null;
let selectionNumber = 0;

input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (!file) return;

  const thisSelection = ++selectionNumber;
  clearPreviousResult();
  setStatus('Reading image…');

  if (file.type && !file.type.startsWith('image/')) {
    setStatus('That file is not an image. Choose a JPG or PNG instead.', true);
    return;
  }
  if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
    setStatus('SVG is not supported in this first test. Choose a raster image such as JPG or PNG.', true);
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    setStatus('That file is over 20 MB. Choose a smaller image.', true);
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    if (thisSelection !== selectionNumber) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    const colors = extractPalette(image);
    if (!colors.length) throw new Error('No visible pixels were found.');

    if (displayedObjectUrl) URL.revokeObjectURL(displayedObjectUrl);
    displayedObjectUrl = objectUrl;
    sourcePreview.src = objectUrl;
    sourcePreview.alt = `Selected image: ${file.name}`;
    sourceWrap.hidden = false;
    previewImage.src = objectUrl;
    previewImage.hidden = false;

    showSwatches(colors);
    const roles = chooseRoles(colors);
    sitePreview.style.setProperty('--page', toHex(roles.background));
    sitePreview.style.setProperty('--ink', toHex(roles.text));
    sitePreview.style.setProperty('--accent', toHex(roles.accent));
    sitePreview.style.setProperty('--button-ink', toHex(roles.buttonText));
    roleNote.textContent = `${colors.length} extracted color${colors.length === 1 ? '' : 's'} · Text contrast ${contrast(roles.background, roles.text).toFixed(1)}:1${roles.fallback ? ' · Black/white fallback used for readability' : ''}.`;
    setStatus(`Palette ready from ${file.name}.`);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    if (thisSelection === selectionNumber) {
      setStatus(`Could not read this image. ${error.message} Try a JPG or PNG.`, true);
    }
  }
});

function clearPreviousResult() {
  if (displayedObjectUrl) URL.revokeObjectURL(displayedObjectUrl);
  displayedObjectUrl = null;
  sourcePreview.removeAttribute('src');
  previewImage.removeAttribute('src');
  previewImage.hidden = true;
  sourceWrap.hidden = true;
  paletteNode.replaceChildren();
  const empty = document.createElement('p');
  empty.className = 'empty';
  empty.textContent = 'The colors in your image will land here.';
  paletteNode.append(empty);
  for (const role of ['--page', '--ink', '--accent', '--button-ink']) sitePreview.style.removeProperty(role);
  roleNote.textContent = 'Waiting for an image.';
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Your browser could not decode that format.'));
    image.src = url;
  });
}

function extractPalette(image) {
  const scale = Math.min(1, 160 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable in this browser.');
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const buckets = new Map();

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha < .2) continue;
    // Preview transparent pixels against white so their sampled appearance is stable.
    const r = Math.round(pixels[i] * alpha + 255 * (1 - alpha));
    const g = Math.round(pixels[i + 1] * alpha + 255 * (1 - alpha));
    const b = Math.round(pixels[i + 2] * alpha + 255 * (1 - alpha));
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    bucket.count++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const candidates = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map(bucket => ({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      count: bucket.count,
    }));

  const chosen = [];
  if (!candidates.length) return chosen;
  const dominant = candidates[0];
  chosen.push(dominant);
  const visibleCount = candidates.reduce((sum, candidate) => sum + candidate.count, 0);
  const minimumAccentPixels = Math.max(5, Math.ceil(visibleCount * .0005));
  const accent = candidates
    .filter(candidate => candidate !== dominant && candidate.count >= minimumAccentPixels && distance(dominant, candidate) >= 65)
    .map(candidate => ({ candidate, chroma: Math.max(candidate.r, candidate.g, candidate.b) - Math.min(candidate.r, candidate.g, candidate.b) }))
    .filter(item => item.chroma >= 55)
    .sort((a, b) => (b.chroma * 1.3 + distance(dominant, b.candidate) * .25 + Math.log1p(b.candidate.count) * 3)
      - (a.chroma * 1.3 + distance(dominant, a.candidate) * .25 + Math.log1p(a.candidate.count) * 3))[0]?.candidate;
  if (accent) chosen.push({ ...accent, isAccent: true });
  for (const minimumDistance of [65, 35]) {
    for (const candidate of candidates) {
      if (chosen.length === 5) return chosen;
      if (chosen.some(color => distance(color, candidate) < minimumDistance)) continue;
      chosen.push(candidate);
    }
  }
  return chosen;
}

function distance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function toHex(color) {
  return `#${[color.r, color.g, color.b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function showSwatches(colors) {
  paletteNode.replaceChildren();
  for (const color of colors) {
    const item = document.createElement('div');
    item.className = color.isAccent ? 'swatch accent' : 'swatch';
    const square = document.createElement('div');
    square.className = 'swatch-color';
    square.style.backgroundColor = toHex(color);
    const code = document.createElement('span');
    code.className = 'swatch-code';
    code.textContent = toHex(color).toUpperCase();
    item.append(square, code);
    if (color.isAccent) {
      const accentLabel = document.createElement('span');
      accentLabel.className = 'swatch-accent-label';
      accentLabel.textContent = 'ACCENT';
      item.append(accentLabel);
    }
    paletteNode.append(item);
  }
}

function luminance(color) {
  const channels = [color.r, color.g, color.b].map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrast(a, b) {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + .05) / (dark + .05);
}

function chooseRoles(colors) {
  const background = colors[0];
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const bestExtracted = [...colors].sort((a, b) => contrast(background, b) - contrast(background, a))[0];
  const fallback = contrast(background, bestExtracted) < 4.5;
  const text = fallback
    ? (contrast(background, black) >= contrast(background, white) ? black : white)
    : bestExtracted;
  const accent = colors.find(color => color.isAccent) || [...colors.slice(1)].sort((a, b) => {
    const score = color => (Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b)) + distance(background, color) * .35;
    return score(b) - score(a);
  })[0] || background;
  const buttonText = contrast(accent, black) >= contrast(accent, white) ? black : white;
  return { background, text, accent, buttonText, fallback };
}
