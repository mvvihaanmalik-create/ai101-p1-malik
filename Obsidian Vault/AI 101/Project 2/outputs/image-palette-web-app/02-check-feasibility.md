# Step 2 — Check feasibility: image-palette website preview

**Route approved:** 2026-10-08. **Test status:** Not run; no app built or published.

**Starting point:** [[AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md]] — build/test on Windows; automatically turn an image's main colors into a website preview; make the app usable through a link on phones.

## Chosen route

Create one responsive browser-only page with plain HTML, CSS, and JavaScript. A file picker lets the user choose an image. The page decodes it locally, samples pixels through Canvas, chooses about 4–5 distinct colors, and automatically assigns colors to background, text, and accent/button roles. Keep v1 free of a backend, AI image API, account system, and JavaScript framework. Host **only the app code and safe demo assets** in a separate **public** GitHub repository with GitHub Pages—not in the Obsidian-vault repository and not with personal images committed as assets.

This is a **recommended route, not a proven implementation**. Browser file inputs, FileReader, and Canvas pixel reads are documented capabilities ([MDN file-input accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept), [MDN FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL), [MDN Canvas getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)). GitHub Pages hosts static HTML/CSS/JavaScript from public repositories on GitHub Free and provides a shareable project URL ([GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). These sources were checked on 2026-10-08.

## Alternatives considered

| Route | Benefit | Tradeoff |
| --- | --- | --- |
| **Chosen: plain HTML/CSS/JS + separate public app repo + GitHub Pages** | Least setup; existing GitHub account; no build system or backend needed for the first test. | Source code is public; automatic palette quality and readable contrast remain untested. |
| **Same app + private repo + Cloudflare Pages** | Private source repo with an online site; Cloudflare supports private GitHub repositories ([Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)). | Another account and GitHub authorization; free-plan build limits ([Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)); live site is still publicly reachable without separate access controls. |
| **React/Vite or palette library + static hosting** | May help if a more complex interface or stronger extraction is later needed. | Adds dependencies and build/maintenance work before the simple route has been tested. |

## Constraints and uncertainty

- The Windows computer has Git, Node/npm, Python launcher, and VS Code on PATH, checked locally on 2026-10-08; the chosen route does not require Node/npm. A real phone/browser and hosting settings have not been tested.
- **JPEG and PNG are the required baseline, not the only selectable formats.** Other browser-decodable images may work. Do not promise HEIC/HEIF or every phone-camera format; show a visible decode error and suggest JPEG/PNG if one fails. The file input's `accept` setting is a picker hint rather than validation ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept)); JPEG/PNG have broad historical browser support ([MDN image formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)).
- Dominant-color selection may yield similar-looking swatches or colors that make text unreadable. WCAG 2.2 AA calls for at least 4.5:1 contrast for normal text ([W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/#contrast-minimum)). Decide on contrast-aware assignment or a fallback after testing; do not claim compliance yet.
- Local-only image processing and no image transmission are architectural intentions, not verified privacy behavior. Confirm in the built page's network activity. GitHub Pages has documented limits, so the free path is not unlimited usage ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
- There is still no fixed time/money ceiling. **Estimate, not promise:** 30–90 minutes for a local feasibility spike, then roughly 4–8 more hours for a small responsive MVP, errors, deployment, and Windows/phone checks. Palette-quality or phone-format trouble could add time. Hosting may cost $0 on this route; optional domains or paid tools are not included.

## Smallest falsifiable test — not run

Make one local page that accepts a colorful JPEG and a low-contrast/near-monochrome PNG, displays distinct swatches, and automatically colors a three-role preview. Check whether colors look representative, text is legible, invalid files show an error, and image data is not sent over the network. Publish only this tiny page, then open it on a real phone and repeat the flow. If either image or phone check fails, diagnose before adding polish. Other image formats can be tried after the JPEG/PNG baseline succeeds.

**Decision:** The user approved the separate public-code route and JPEG/PNG baseline while allowing other formats where the browser can decode them. The bounded test is the next planned action, but it has not happened. Stop before Step 3; do not expand into a larger build until the test result is reviewed.
