# Step 4 — Human check: image-palette website preview

**Accepted review decision:** 2026-10-08. **Release decision:** Not approved.

**Artifact reviewed:** [[AI 101/Project 2/outputs/image-palette-web-app/03-build-a-small-prototype.md]], the [live feasibility page](https://mvvihaanmalik-create.github.io/ai101-image-palette-studio/), source code, the user's desktop screenshot, and the user's report that the upload-to-preview flow works on a phone.

## What I can keep

The browser-only, dependency-free route works for the narrow core behavior: choose an image, see swatches, and automatically recolor a simple preview. The user's desktop screenshot shows a real PNG completing the flow; the user reports the same flow on their phone. The page and assets load online. The JavaScript uses a temporary object URL, samples a reduced image through Canvas, and does not include an image-upload request or persistent storage. That last point is a **source-code observation**, not a network-privacy test. The public repository contained only five prototype files when inspected.

## What I reject or need to investigate

- **Reject the current visual treatment:** The user called it basic/unpolished. The generic preview, duplicate custom/native chooser, and tiny palette labels support that assessment. The mock button looks actionable but does nothing.
- **Improve palette quality:** The shown blue-gray palette broadly matches the image but appears to omit its vivid cyan focal accent, because the algorithm favors colors occupying large areas. Some swatches are similar.
- **Limited text check:** The screenshot reports `5.1:1` for white on `#56708D`; an independent calculation gave approximately `5.124:1`. This supports that one displayed ratio, not overall accessibility. Normal text generally needs at least 4.5:1 for WCAG 2.2 AA ([W3C](https://www.w3.org/TR/WCAG22/#contrast-minimum)).
- **Speed/phone layout still unknown:** A logic-only 160×160 pixel benchmark on the Windows machine took 13.8 ms median and 32.2 ms maximum over 30 runs; it excludes real decoding/rendering and phone hardware. The user did not report whether their phone had lag, clipping, or unreadable text.
- **Unverified cases:** Real JPEG, invalid file, other raster formats, HEIC/HEIF, keyboard/screen reader use, small-phone screenshots, and runtime network behavior remain unchecked. The code's 20-MB file cap does not bound decoded image dimensions. GitHub Pages logs visitor IP addresses for security purposes ([GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)).

## My decision and boundary

I clarified that I **agree to proceed** with a bounded revision: keep the working functional core, replace the generic visual treatment with a more intentional preview, simplify the upload control, and improve selection of a distinctive accent. This is approval to iterate, **not** approval of the current design or a claim that the phone has no lag. Do not add accounts, exports, or extra layouts. Recheck the same image and a low-contrast image on Windows/phone after the revision; keep unresolved tests visible. Proceed to Step 5 and stop after the bounded change for my review.
