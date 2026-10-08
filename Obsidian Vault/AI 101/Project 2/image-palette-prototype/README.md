# Image Palette Studio — tiny feasibility prototype

This is a **Step 3 feasibility test**, not a finished or polished app. It reads a selected image in the browser, samples its colors, and automatically colors a simple website preview. It uses no framework, server-side image processing, account, or image API.

**Current visual treatment:** A bounded Step 5 pass replaced the duplicate chooser with one labeled control, rebuilt the mock website as an editorial composition, and reserves a swatch for a small vivid accent when the image contains one. The user accepted this visual version as good enough for now.

**Utility update under review:** Automatic assignment remains the default. After choosing an image, tap any swatch to try it as the website accent; the button/caption text color adjusts for that accent. Use **Reset to automatic** to restore the original suggestion. This does not change the background or main text colors, and it does not save the choice after a new image is selected or the page is reloaded.

**Live test page:** https://mvvihaanmalik-create.github.io/ai101-image-palette-studio/

## Files

- `index.html` — the upload control, swatches, and preview.
- `styles.css` — desktop/phone-size layout and preview appearance.
- `app.js` — image decoding, color extraction, automatic roles, contrast fallback, and visible errors.
- `test.js` — repeatable Node logic tests with simulated image pixels; **not** an end-to-end browser test.

## Run on Windows

In PowerShell, change to this folder and run:

```powershell
node .\test.js
py -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765` on the **Windows computer**. Choose a colorful JPG, a low-contrast PNG, and a non-image file. Check that swatches and preview change, text remains readable, and the bad file shows an error. A phone cannot open this `127.0.0.1` address; use the live test page for the phone check.

## Limits

JPEG and PNG are the baseline. Other raster images may decode in a given browser; SVG is intentionally excluded from this first test. The file must be 20 MB or smaller. The accent rule gives small vivid colors a better chance than before but may still pick noise or miss a desired focal color on complex images. Black or white is used for text when the extracted colors lack sufficient contrast. The earlier core flow worked on desktop and a phone by the user's report; **the new swatch interaction** still needs a real desktop/phone touch and keyboard check. Error paths, broader formats, and runtime network privacy are not yet verified.
