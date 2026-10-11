# 02 / 05 · Choose a route

**Output:** evidence + route comparison · **Gate:** you approve the approach

## Starts from

The goal and success criteria I approved in [[AI 101/Project 2/01-define-the-goal.md]], plus the actual operating system, device, tools, access, time, and budget available for this project.

## Does

1. Identify the technical requirements, dependencies, platform constraints, permissions, and resources the goal needs.
2. Verify time-sensitive tool or OS details with current, authoritative documentation; link the evidence and date checked.
3. Separate verified facts from assumptions, estimates, and unresolved questions.
4. Compare at least one practical alternative route, including a simpler or lower-cost option when relevant.
5. Estimate effort and likely bottlenecks, then propose the smallest test that can validate the riskiest assumption before full implementation.

## Good looks like

There is a realistic recommended route, a meaningful alternative, visible tradeoffs and constraints, a rough effort estimate, and a cheap test for the biggest uncertainty. No unsupported promise of feasibility is presented as fact.

## Check

I check that the documented platform and resource assumptions match my setup, review the evidence and uncertainties, and choose or revise the route. Do not start a larger build until I approve the route and the small feasibility test has a result.

## Current project check — pending my decision

**Feasible route for this workflow:** Keep it as an Obsidian/Markdown process with a Canvas map. The requested map and direction files already exist in the vault; this route needs no application code or extra runtime to use as a planning aid. The authoring environment here is Windows with Obsidian, but the target environment for any future coding project is still unknown.

**Alternative routes:** A one-shot prompt would be simpler but has no explicit feasibility or human-review gates. A custom app or plugin could automate parts of the process, but it adds build and maintenance work without evidence that automation is needed. The current document-based route is the lowest-complexity route for testing the workflow idea.

**Constraints and unknowns:** No concrete application idea, target OS/device, technical requirements, or time/token budget for a real build has been provided. Therefore, I have not checked project-specific dependencies, current technical documentation, or whether any particular coding idea is feasible. Whether these steps actually prevent wasted effort is also untested.

**Smallest useful test:** Apply Steps 1–2 to one concrete idea (preferably a past idea that stalled), record its actual target OS/device and budget, and verify the single riskiest requirement against authoritative documentation or a tiny experiment before estimating a larger build.

**Effort estimate:** The workflow artifact itself is already assembled and requires no code to use. The effort for a project-specific feasibility test cannot be estimated responsibly until the idea and target environment are known.

**Decision:** I approved the document-based route by saying “proceed.” It is feasible as a planning method; feasibility of a future coding project remains unassessed. The approved Step 2 output is saved in [[AI 101/Project 2/outputs/02-check-feasibility.md]].

## New run: image-palette website preview — Step 2 route approved (2026-10-08)

**Starts from:** The approved, separate app goal in [[AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md]]: build/test on Windows; a link that works on phones; image-to-palette-to-automatic-preview; no fixed time or money ceiling.

### Recommended route — small browser-only site

Build one responsive page with plain HTML, CSS, and JavaScript. Let a file input choose an image; decode it in the browser, draw a reduced-size copy to a hidden canvas, read its pixels, group similar colors, choose roughly 4–5 distinct swatches, and assign them automatically to background, text, and accent/button roles. No server, AI model/API, user account, or JavaScript framework is needed for the first test. Put **only the app code and safe demo assets** in a separate public GitHub repository and publish it with GitHub Pages; do not publish the Obsidian vault or personal images as app assets. This is a recommendation, not a proven implementation result.

**Verified documentation (checked 2026-10-08):** Browser file inputs can request images, but their `accept` setting is a picker hint, not validation ([MDN file-input accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept)). `FileReader` can read a selected `File` ([MDN FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)), and Canvas `getImageData()` exposes drawn pixel data in widely available browser APIs ([MDN Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)). GitHub Pages hosts static HTML/CSS/JavaScript, and GitHub Free offers it for public repositories; a project site gets a shareable `github.io/<repository>` URL ([GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). A private source repository needs an eligible paid plan for GitHub Pages, while the published site itself is public ([GitHub Pages creation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)).

**Inference from those facts:** Client-side pixel processing appears to satisfy this app without paying for an image-processing API or transmitting the selected image to a server. That privacy behavior must be checked in the built app; it is not yet tested. GitHub Pages gives a no-hosting-fee path for this small public-code site, subject to GitHub's service limits and plan rules, not a guarantee of unlimited usage ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).

### Alternatives and tradeoffs

| Route | Benefit | Cost or drawback |
| --- | --- | --- |
| **A. Plain HTML/CSS/JS + separate public repo + GitHub Pages (recommended)** | Fewest moving parts; uses the existing GitHub account; no build tooling or backend for v1. | App source is public; palette algorithm and automatic text contrast still need design and testing. |
| **B. Same browser-only app + separate private repo + Cloudflare Pages** | Keeps source repo private while publishing a shareable site; Git pushes can deploy automatically. Cloudflare documents support for both public and private repositories ([Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)). | Requires a Cloudflare account and GitHub authorization/configuration. Free-plan build limits apply ([Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)). The live site is still publicly reachable unless separate access controls are added. |
| **C. React/Vite or a color-extraction library + static hosting** | More structure or more sophisticated palette extraction if the simple method performs poorly. | Adds dependencies, build setup, and update burden before we know they are needed; not the easiest first test. |

### Constraints, risk, and smallest test

- **Known environment:** Windows machine has Git, Node/npm, Python launcher, and VS Code available on PATH as checked locally today. Route A does not require Node/npm. The actual target phone/browser and hosting account settings have not been tested.
- **Format boundary:** JPEG and PNG are the required baseline, not an exclusive file-type restriction. Let users try other browser-decodable images, but show an error if a chosen format cannot decode; support for a phone's HEIC/HEIF photos should not be assumed. MDN identifies JPEG and PNG as long-supported web formats ([MDN image-format guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)).
- **Biggest product risk:** A technically valid dominant-color list may look unrepresentative, repeat near-identical hues, or make text unreadable after automatic assignment. This is a design/algorithm issue, not solved merely by choosing hosting. Normal text needs a 4.5:1 contrast ratio for WCAG 2.2 AA; extracted colors may not supply a suitable pair ([W3C WCAG 2.2, 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)). A contrast-aware selection or fallback may be needed; its behavior is not yet chosen or verified.
- **Smallest falsifiable test before a larger build:** Make one local page that processes a colorful JPEG and a low-contrast/near-monochrome PNG, shows the swatches, and auto-colors a three-role preview. Check whether the palette feels representative, swatches are distinct, text is legible, a bad file produces a visible error, and image data stays in-browser. Then publish only that tiny page and open it on an actual phone. If either image/phone check fails, diagnose before adding polish or features. **This test has not been run.**
- **Effort estimate, not a promise:** About 30–90 minutes for the first local spike; roughly 4–8 further hours for error handling, responsive layout, deployment, and Windows/phone checks, with more time possible if palette quality or phone image formats are difficult. Hosting may be $0 on the documented free routes, but account/plan status and any optional domain or paid tools remain unconfirmed.

**Decision and status:** The user chose Route A: a separate **public app-code repository** is acceptable. JPEG and PNG must work; other browser-supported image formats may work too, but are not guaranteed before testing. The route and bounded tiny test are approved as a plan, **not validated as a result**. The test has not been run, no code has been built or published, and no larger build is authorized until the tiny test's result is reviewed. This approved Step 2 plan is saved in [[AI 101/Project 2/outputs/image-palette-web-app/02-check-feasibility.md]]. Stop before Step 3.

### Later utility feasibility delta (2026-10-08)

The proposed manual-accent-only override uses the existing swatches and CSS variables on the same static site. The browser API already used by the app, `style.setProperty`, can update a CSS property without a new package, backend, or account ([MDN, checked 2026-10-08](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty)). The key new risks are whether the controls are understandable and usable on touch/keyboard, whether an accent blends into the background, and whether reset really restores the automatic suggestion. A simulated DOM-handler test can check state changes, but a real Windows-and-phone interaction remains necessary. This is a scoped extension, not evidence that the new behavior has passed a real-device check.

## New run: obsidian-gaze — Step 2 feasibility draft (2026-10-08)

**Starts from:** The approved goal in [[AI 101/Project 2/outputs/obsidian-gaze/01-define-the-goal.md]]. Target is desktop Obsidian on Windows; mobile is not required; the user authorized implementation from the supplied recipes and delegated a centered modal choice. This is a feasibility recommendation, **not an implemented or tested plugin**.

### Recommended route A — standalone TypeScript Obsidian plugin

Use the official Obsidian sample plugin's TypeScript/esbuild pattern as a small standalone source project. Keep the four director data records in a `directors.ts` module (missing from the proposed tree), the pixel math in `filters.ts`, the Canvas adapter in `applyFilter`, Web Audio effects in `sounds.ts`, and the UI in `GazeModal.ts`. Bundle to `main.js`; place `main.js`, `manifest.json`, and `styles.css` in a **separate disposable test vault's** plugin directory before enabling it. Do not develop or first-enable an untested plugin in the primary AI 101 vault. Obsidian explicitly recommends a separate development vault to avoid unintended vault changes ([official build guide](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin)). Keep source/build dependencies outside the synced vault; after acceptance, save the small deliverable and instructions under `outputs/obsidian-gaze/`. Runtime image processing needs no service or internet; dependency installation may need network once during the build.

**Verified documentation, checked 2026-10-08:** Obsidian's build guide documents Node.js, Git, a code editor, `npm install`, compiled `main.js`, placement under `.obsidian/plugins`, and enabling in Community plugins; manifest changes require an app restart ([Obsidian build guide](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin)). The official template bundles TypeScript with esbuild to `main.js`, externalizes `obsidian`, and uses `format: 'cjs'`; its current production script also type-checks before bundling ([template esbuild config](https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/esbuild.config.mjs), [package.json](https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/package.json)). Obsidian documents a root-level `styles.css` for plugin styles; `loadData()` is not the stylesheet mechanism ([Obsidian HTML-elements guide](https://docs.obsidian.md/Plugins/User%20interface/HTML%20elements)). Browser FileReader reads a selected local File into a data URL, Canvas `getImageData()`/`putImageData()` supports pixel editing, and `toDataURL()` can encode PNG, although it encodes the whole output into an in-memory string ([MDN FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL), [MDN Canvas pixels](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData), [MDN PNG export](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)). Web Audio contexts may need to be created or resumed from a user gesture ([MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)).

**Local environment checked 2026-10-08:** Windows has Node v24.15.0, npm 11.12.1, Git 2.54.0, and Obsidian desktop 1.13.7 installed. This confirms build tools are present, not that the requested plugin runs. The installed version is newer than the proposed `minAppVersion: 1.4.0`; the actual earliest compatible version still needs testing or a more conservative manifest value.

**Version observation correction (later same day):** The Obsidian executable's Windows file metadata reported 1.13.7, but the running Obsidian window title reported **1.14.4**. The former should not be treated as the active app version; neither observation proves compatibility with the new plugin.

### Manifest and specification corrections to approve

- **Project folder versus plugin ID:** Keep the project/source name `obsidian-gaze`. For a potentially distributable plugin, recommend installed folder and manifest `id: "gaze"`, because Obsidian's manifest rules say IDs cannot contain `obsidian` and the installed folder should match the ID ([manifest reference](https://docs.obsidian.md/Reference/Manifest)). The supplied `obsidian-gaze` ID could be used for a local-only experiment, but it conflicts with those publication rules.
- **Name and command:** Recommend manifest `name: "Gaze"` (so command `Open` presents as `Gaze: Open`), with visible in-modal logo `gaze.`. Obsidian's community name rules disallow punctuation such as the period in the proposed `name: "gaze."`; uniqueness is unverified ([manifest reference](https://docs.obsidian.md/Reference/Manifest)). No community submission is authorized or planned now.
- **Desktop scope:** Recommend `isDesktopOnly: true` for this version, rather than the supplied `false`, so the manifest does not advertise untested mobile support. This is a scope decision, not a technical claim that Canvas requires desktop ([mobile development guide](https://docs.obsidian.md/Plugins/Getting%20started/Mobile%20development)). Replace `author: "your-name"` with an author value the user approves before sharing.
- **Build setup:** Follow the official template's CommonJS output/external `obsidian` and include a TypeScript no-emit check in `npm run build`, rather than copying the supplied `platform: 'browser'`, ES2018, and bundling options blindly. Keep the requested `dev`/`build` command shape; exact config will be verified by a build test.

### Alternative routes and tradeoffs

| Route | Advantage | Limit |
| --- | --- | --- |
| **A. Obsidian plugin + Canvas pixel recipes (recommended)** | Exact in-vault interaction and offline runtime; parameters can be implemented directly; no server or ongoing service fee. | TypeScript build and Obsidian installation/reload; custom blur/grain/performance work; modal and download must be checked in-app. |
| **B. Obsidian plugin + CSS/canvas built-in color filters** | Faster technical spike and simpler code. | Cannot faithfully produce the specified shadow/midtone/highlight tinting, selective saturation, grain, bloom, and film smear; a CSS-only preview would also need a separate export path. Use only as a disposable feasibility probe, not the final result. |
| **C. Standalone local HTML tool** | Easiest browser-only implementation, without plugin packaging. | Fails the requirement to launch from Obsidian command palette/ribbon and work directly inside the vault. |

### Risk, test, and effort

- **Largest uncertainty:** Four multi-pass 1600px Canvas filters may feel slow or freeze the modal on a real image. The specified `MAX = 1600` also caps exported dimensions; the PNG is **not guaranteed to retain original resolution**. Blur passes should be implemented with efficient separable/running-sum approaches rather than a naive large-radius per-pixel neighborhood. Image decode, drag/drop interception, download behavior, CSS isolation, and actual grade aesthetics all require in-app tests. `readAsDataURL` plus `toDataURL` also raises memory use; limit oversized or undecodable files and report errors.
- **Recipe precision:** Several numerical steps do not specify complete formulas (weights, edge measure, red bloom mask, grain sampling). Implement documented, bounded interpretations and compare results with the user's eye; do not claim byte-for-byte reproduction of an unseen original.
- **Smallest falsifiable test before all four grades:** Build a disposable plugin that opens a modal from command/ribbon, accepts one local PNG/JPEG by click and drop, draws a reduced-size image to Canvas, applies one visibly altered pixel transform, previews it, and downloads a PNG. Test it in a dedicated Windows Obsidian vault, including one bad file and one large image. Confirm the preview/output match and that no network request is needed after build. If the in-app drop/export flow or performance fails, stop and revise the route before implementing all four filters and SFX. **Not run yet.**
- **Effort estimate, not a promise:** Roughly 1–3 hours for setup and the smallest in-app test; another 8–16 hours for the four recipe interpretations, polished modal, SFX, error handling, and desktop checks. Visual tuning or performance problems could increase that substantially. No runtime service cost is expected; local build tooling is already present. User has not set a time ceiling.

**Decision:** The user approved Route A, the dedicated test vault, and the recommended manifest corrections (`id: gaze`, `name: Gaze`, `isDesktopOnly: true`) on 2026-10-08, and explicitly asked to build the functional plugin. The approved plan is saved in [[AI 101/Project 2/outputs/obsidian-gaze/02-check-feasibility.md]]. **Status: Step 2 approved as a plan, not a tested implementation. Proceed to Step 3 and stop for the human check after building and reporting actual results.**

## New run: idea.quest — provisional route (2026-10-08)

The user asked for a **live** project board tied to ideas we start in this vault. A static hosted page would not itself see private local Markdown or know when an approval occurred. I chose a local-only, dependency-free Node server with a small JSON registry: it can read changes from this vault on each request, persist the user's explicit decisions, and regenerate the Obsidian progress card. The tradeoff is that the site works only while its server runs on this Windows computer; it is not a phone/shareable link or a multi-user service. Public hosting would require a separate authenticated data and sync design before publishing vault-derived content. Node 24.15.0 was present locally, and the server/API worked in this environment. **Route not yet approved by the user.**

## idea.quest potion-room redesign — Step 2 route proposal (2026-10-11)

**Starts from:** The provisionally accepted [[AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md|Step 1 scope]]: keep the vault-backed tracker and all four records; make one table, one original cat witch, and three data-driven jars (0/5, 2/5, 5/5); select a jar to see real details. The public mirror is read-only; local approvals must remain explicit. This is a route recommendation, **not an approved route or a running redesign**.

### What exists and what the redesign actually needs

- **Local evidence checked 2026-10-11:** The current dependency-free HTML/CSS/JavaScript frontend reads `projects.json` through its Windows Node server; the server handles project selection, notes, revisions, and explicit approvals, and `sync-progress.mjs` regenerates `progress.md`. Node v24.15.0 and npm 11.12.1 are available. The public Site currently fetches the public GitHub registry and is read-only; the separate Vercel copy is a snapshot, not a live Git-linked build. The source uses a two-minute hosted refresh and four-second local refresh. None of this proves the new room will work on a phone.
- **Data contract:** Reuse the existing `projects.json` and gate-count calculation. Jar height = approved gates / 5, while the artifact record gets no false five-step score. Keep project detail text as live DOM content rather than baking it into art. A single selected-project state drives jar enlargement and the detail panel; it never calls the approval action.
- **Visual asset contract:** The concept image contains baked-in bottles and text and draws the 5/5 bottle as less than full, so it cannot be the functional scene by itself. The production room, cat, jars, and labels need separate layers or authored vector shapes. The cat must be original rather than copied from the cited game aesthetic.

### Routes to compare

| Route | Benefit | Tradeoff / likely bottleneck | Rough effort to first test* |
| --- | --- | --- | --- |
| **A. Layered 2.5D HTML/CSS + SVG jars (recommended)** | Keep the existing server, registry, and plain-JS actions. A separate background/table/cat layer can carry the atmosphere; SVG jar shapes and clipped liquid respond to real counts; native HTML buttons and a DOM detail panel support touch and keyboard. No new framework or rendering engine. | Art layers must be created cleanly and compositionally matched. A beautifully painted *single* image is insufficient; responsive crops, labels, and panel placement still need design. SVG/CSS can imply depth, not provide true free camera motion. | About 3–6 hours for an intentionally simple interactive spike; polished original artwork and mobile tuning could take 1–3 more days. |
| **B. Canvas 2D scene + DOM controls/details** | Can draw and animate a single coherent scene and offer more painterly composition. | Must maintain scene coordinates, pointer hit-testing, resize behavior, and synchronized DOM control positions. Canvas itself needs meaningful alternative/fallback content. Adds complexity before the three-jar interaction is proven. | Roughly 1–2 days for a functional spike, plus art tuning. |
| **C. Three.js real-time 3D room** | Gives actual camera depth, bottle rotation, lighting, and spatial movement. | Models/materials, lighting, picking, responsive camera, text overlay, asset loading, and mobile GPU tuning are a much larger build. A simple first room may look less like the supplied high-quality cartoon concept unless substantial art direction is added. | Several days to a basic scene, likely longer for exhibit-quality art and phone optimization. |

*Estimates are judgment calls, not measured build times or cost promises. No new paid service is required by Route A's proposed prototype, but art-production time, any asset-tool costs, and the user's time/budget ceiling are still unknown.*

### Verified platform facts and what is inferred from them

- SVG [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/clipPath) can restrict liquid drawing to the jar body; [SVG `viewBox`/aspect ratio behavior](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio) supports scaling across viewport shapes. These browser facts support a data-driven jar design; they do **not** prove that a particular SVG will look good or stay unclipped on this user's phone.
- Native HTML [buttons](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) can be activated by mouse, keyboard, touch, voice, and assistive technology. Thus the jar should be a real labelled button with decorative art inside or alongside it, rather than only a painted hotspot. The [reduced-motion media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) can turn off nonessential zoom/bobbing. Both still need interaction checks, not just valid code.
- MDN notes that [Canvas content needs useful accessibility fallback](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage). Three.js's own [scene guide](https://threejs.org/manual/pages/creating-a-scene.html) uses a renderer/animation loop, and its [responsive guide](https://threejs.org/manual/pages/responsive.html) describes drawing-buffer/performance tradeoffs. Route B/C overhead is an inference from those requirements plus this project's small interaction scope, not a claim that Canvas/3D cannot work.
- The current hosted client calls GitHub's REST API every two minutes. GitHub's [unauthenticated REST limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2026-03-10) is 60 requests/hour per originating IP. That is a pre-existing scale/reliability risk—roughly 30 polls/hour per continuously open tab before other requests—not caused by the visual route. A phone/site test should inspect failures and fallback labeling; do not silently call the mirror “always live.”

### Recommendation, smallest falsifiable test, and gate

**Recommend A:** Keep the existing tracker data/write model, replace only the presentation with separately authored 2.5D layers, SVG jars, and an HTML detail panel. Start with simple original art, not a fully rendered room. Make the *clickable three-jar slice* convincing before spending time on scenery polish. Keep the current website available until the user approves a tested replacement; do not publish a concept image as if it were an interactive build.

**Smallest test after route approval:** In a local copy/branch of the current site, render exactly three jars from a fixture or copied registry with 0/5, 2/5, and 5/5, and one cat/table composition. Clicking, tapping, and keyboard-activating Gaze must enlarge only Gaze and show its actual 2/5 record; Return/Escape restores the table without changing any gate. Deliberately change a copied gate value to 3/5 and reload/refresh to see whether the liquid moves to 60% while the label remains accurate; do not alter the real accepted records for this test. Inspect one desktop and one narrow/mobile viewport, focus order, and reduced-motion setting. If live fill, readable composition, or basic interaction fails, stop and revise the route before drawing more assets or deploying.

**Unresolved:** Exact production art method (hand-authored SVG versus separately generated/edited transparent layers), quality threshold for the first cat, actual phone browser and performance, the user's effort/budget ceiling, and whether the current hosted polling approach needs improvement. These do not prevent proposing Route A, but they prevent promising final visual fidelity or reliable phone performance.

**Decision needed:** User chooses Route A, B, or C and approves/revises the small test. Until then Step 2 remains active, the prototype is not built, and idea.quest remains **1/5 approved gates**. Save a Step 2 output and advance the route gate only after explicit user approval.
