# Image Palette Studio — tiny feasibility prototype

This is a **local Step 3 test**, not a finished or published app. It reads a selected image in the browser, samples its colors, and automatically colors a simple website preview. It uses no framework, server-side image processing, account, or image API.

## Files

- `index.html` — the upload control, swatches, and preview.
- `styles.css` — desktop/phone-size layout and preview appearance.
- `app.js` — image decoding, color extraction, automatic roles, contrast fallback, and visible errors.
- `test.js` — repeatable Node logic tests with simulated image pixels; **not** an end-to-end browser test.

## Run on Windows

In PowerShell:

```powershell
node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\image-palette-prototype\test.js'
py -m http.server 8765 --bind 127.0.0.1 --directory 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\image-palette-prototype'
```

Then open `http://127.0.0.1:8765` on the **Windows computer**. Choose a colorful JPG, a low-contrast PNG, and a non-image file. Check that swatches and preview change, text remains readable, and the bad file shows an error. A phone cannot open this `127.0.0.1` address; phone testing needs a published site.

## Limits

JPEG and PNG are the baseline. Other raster images may decode in a given browser; SVG is intentionally excluded from this first test. The file must be 20 MB or smaller. This simple color-bucket method can miss important small accents or produce less satisfying palettes on complex imagery. Black or white is used for text when the extracted colors lack sufficient contrast. Browser decoding, the visual result, network privacy, deployment, and real-phone responsiveness **have not yet been verified**.
