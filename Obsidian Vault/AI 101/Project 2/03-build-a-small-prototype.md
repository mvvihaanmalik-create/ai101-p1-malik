## Starts from

The approved route and passed feasibility check in [[AI 101/Project 2/02-check-feasibility.md]], along with the goal and success criteria from Step 1.

## Does

1. Propose the smallest end-to-end slice that tests the core behavior.
2. Name the files, tools, and commands involved before making changes; explain unfamiliar terms in plain language.
3. Implement only what is needed for this test, keeping optional features out.
4. State assumptions and give a specific command or action to exercise the behavior.
5. Run the proposed check when possible and report the actual output, including failures; never describe an unrun test as passed.

## Good looks like

The prototype is small, directly tied to an approved success criterion, and has a repeatable test with a reported result. I can tell what changed and what the prototype has not yet proven.

## Check

Run the minimal test and compare its observed result with the chosen success criterion. If it fails, record the exact error and return to feasibility or revise the prototype; if it passes, send it to the human review in [[AI 101/Project 2/04-human-check.md]].

## Current workflow dry run — draft for human review

**Prototype slice:** A preflight intake gate for the workflow, asking for the concrete idea and desired behavior, success criteria, target OS/device, available tools or permissions, time/token budget, and the riskiest technical assumption. The model should stop and label missing inputs instead of claiming project feasibility.

**Test input:** The broad problem in the intent note (ideas and added features are prototyped before tool, OS, resource, and time constraints are known), followed by “proceed” without a concrete coding idea or target-environment details.

**Expected behavior:** The workflow should recognize that the document-based planning method can proceed, but must not claim that an unspecified coding project is feasible; it should surface the missing details before implementation.

**Observed result:** The feasibility check identified the missing concrete project, target OS/device, and budget; it distinguished workflow-document feasibility from project-specific feasibility. No code was generated or tested.

**Test result and limits:** Pass for the narrow intake/gating behavior in this conversational dry run. This is not a code prototype and does not verify any real project's toolchain, OS compatibility, schedule, or technical feasibility; those require a specific project and environment.

**Status:** I accepted this limited dry run as Step 3's result (“ok”). Its output is saved in [[AI 101/Project 2/outputs/03-build-a-small-prototype.md]]. It is a workflow test, not a code prototype or a real-project feasibility result.

## New run: image-palette website preview — Step 3 local prototype (2026-10-08)

**Starts from:** The approved route and unrun bounded test in [[AI 101/Project 2/outputs/image-palette-web-app/02-check-feasibility.md]]. This is separate from the earlier no-code workflow dry run above.

**Smallest end-to-end slice:** A local static page that accepts an image, draws a reduced copy on Canvas, groups pixel colors into distinct swatches, and automatically colors a simple website preview. It picks the most contrasting extracted text color when possible; otherwise it uses black or white. It rejects non-images, SVG, images over 20 MB, images the browser cannot decode, and images with no visible pixels, with a visible message.

**Files changed:** [[AI 101/Project 2/image-palette-prototype/index.html]] (page), [[AI 101/Project 2/image-palette-prototype/styles.css]] (responsive layout), [[AI 101/Project 2/image-palette-prototype/app.js]] (browser behavior), [[AI 101/Project 2/image-palette-prototype/test.js]] (simulated-pixel checks), and [[AI 101/Project 2/image-palette-prototype/README.md]] (Windows run instructions). No dependency packages were installed.

**Commands and actual results:** `node --check` returned without errors for `app.js` and `test.js`. `node test.js` printed passes for four distinct simulated source colors, a monotone image with one swatch and contrast-safe text, and fully transparent pixels producing no palette. A local Python static server returned HTTP 200 for `index.html`, `styles.css`, and `app.js`; the page is currently available on this computer at `http://127.0.0.1:8765`. These checks validate the JavaScript logic and file delivery only, not real image decoding or the actual visual/browser flow.

**Check not completed:** The available computer-use browser inventory was empty and creating a Chrome tab failed, so I could not open the app in a browser, upload real JPG/PNG files, inspect visual quality, or test phone responsiveness. `gh auth status` reported no GitHub CLI login, so I did not create a separate public app repo or publish a Pages site. A phone cannot use the local `127.0.0.1` link. Network privacy has not been independently checked. There is no evidence yet that the complete Step 2 feasibility test passed.

**User check needed before expansion:** On Windows, open `http://127.0.0.1:8765` and try a colorful JPG, a low-contrast PNG, and an invalid file. Compare palette quality and text legibility with the approved goal; report any error or mismatch. For the phone check, GitHub authentication and publication of a separate app-only repo are still needed. Do not save this new app-run Step 3 output to `outputs/` or advance to Step 4 until the user agrees with the result; do not call the prototype verified based only on simulated-pixel tests.

**User feedback (2026-10-08):** The user opened the local prototype and found it very basic and not polished. That is a design-quality gap, not approval of the current visual result. They asked for the GitHub sign-in link next; no additional polish or phone test has yet been completed. Keep the small-test gate open and let the user decide the desired visual direction before expanding the design.
