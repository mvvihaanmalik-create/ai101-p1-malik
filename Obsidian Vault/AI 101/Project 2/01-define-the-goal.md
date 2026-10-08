## Starts from

An idea or problem in my own words, including any examples or inspiration I already have. Unknowns are allowed; do not treat guesses as requirements.

## Does

1. Restate the problem and intended user in plain language.
2. List the main behavior, inputs, outputs, and must-have constraints.
3. Separate must-haves from nice-to-haves and out-of-scope ideas.
4. Mark assumptions and unanswered questions; ask me to resolve decisions that materially affect scope.
5. Turn success into observable criteria that can later be tested.

## Good looks like

The goal is short and specific; success can be recognized; scope is bounded; platform, audience, and known constraints are recorded; and uncertain details are labeled rather than silently invented.

## Check

I confirm that the restated goal, priorities, and success criteria match what I want. If they do not, revise this step before assessing feasibility.

## Earlier workflow-design run — approved

**Goal:** Create a repeatable LLM-assisted workflow that helps a non-technical person decide whether and how to begin a coding project before spending substantial time or tokens. It should clarify requirements, reveal tool and operating-system constraints, compare realistic routes, and require a small human-verified test before expanding a prototype.

**Audience:** Me, when I have an idea but am not yet sure what technical requirements, tools, or implementation route it needs.

**Inputs:** An initial idea and desired outcome; examples or inspiration; the intended operating system and environment; available tools, permissions, time, and token or money budget. The specific project idea and some environment/budget details are not yet known.

**Must-have:** Expose assumptions and unknowns; check feasibility before a larger build; compare at least one realistic alternative; propose a small test for the biggest risk; distinguish verified facts from estimates; leave go/no-go decisions to me.

**Nice-to-have:** A reusable checklist and evidence links that can be revisited as tools or platform requirements change.

**Out of scope:** Guaranteeing a project will succeed; choosing or deploying a solution without my approval; building a particular application now, since no specific application idea has been selected for this workflow exercise.

**Success criteria:** Given a future project idea, the workflow should produce a bounded goal, identify platform/tool/resource assumptions and uncertainties, compare routes, name a smallest feasibility test, and wait for my review of that test before substantial prototyping.

**Open details for a future test run:** A concrete project idea, operating system/device, and acceptable time/token budget. These details do not prevent defining this workflow, but will matter when using it on a real project.

**Status:** This earlier workflow-design goal was approved and saved in [[AI 101/Project 2/outputs/01-define-the-goal.md]]. The new app idea below is a separate run of this workflow.

## New run: image-palette website preview — Step 1 draft (2026-10-08)

**Goal:** Make a small web app where I choose one image, see a short palette of its main colors, and try those colors on a simple website preview before committing to a design direction.

**Audience:** Me as a non-technical designer testing color directions on a Windows computer, plus anyone I send the app link to on a phone. A shareable online app is required; accounts and saved/shareable palette links are not assumed.

**Inputs and outputs:** Input is one image selected from a device. Output is a few visible color swatches and a simple website preview. After image selection, the app automatically assigns extracted colors to the preview's design roles; manual assignment is not required. The exact swatch count and mapping rule can be chosen during the feasibility/design steps.

**Must-have for the first version:** Select an image; extract and display its main colors; automatically apply those colors to at least the preview's background, text, and accent/button roles; visibly update the preview after a new image is selected; make the app accessible to others through a link and usable in a phone browser. I will build and test on Windows. Keep the prototype small enough to test before adding more features.

**Possible later features, not assumed for the first version:** Manual color-role adjustments, copy color codes, save/export palettes, accessibility or contrast guidance, more page layouts, accounts, or sharing a particular palette/preview state.

**Observable success:** With a test image on Windows, the app displays a compact palette that I recognize as representing important colors in that image and automatically updates the preview's background, text, and accent/button areas. Another person can open the app using its link on a phone and run the same upload-to-preview flow without a desktop-sized layout. Unsupported inputs or failures should be visible rather than silently producing a misleading palette.

**Open decisions for later steps:** I have no fixed time or cost limit yet; Step 2 should compare effort and costs before I set one. Browser compatibility, image formats, extraction method, programming framework, hosting platform, and whether a particular palette/preview can be shared are not chosen yet. For this first version, “shareable” means others can open and use the app through a link, including on phones.

**Status:** Step 1 approved on 2026-10-08: automatic color placement; shareable online app that works on phones; Windows as my build/test computer; no fixed budget yet. Saved to [[AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md]]. Stop here before Step 2.

### Later utility-scope delta — pending user check (2026-10-08)

After accepting the first prototype for now, the user selected the iterate-or-stop Canvas node and asked to “imrpove functionality and utility.” I bounded that broad direction to **one optional manual accent override**: automatic color placement remains the default; tapping a displayed swatch changes only the preview accent and recalculates its button/caption text color; Reset restores the automatic accent. Success means this works with mouse, keyboard, and phone touch without changing the automatically selected background/main text. Copy/export, accounts, saved palettes, and full manual role editing remain outside this single iteration. This is a new proposed scope slice for user review, not a retroactive change to the original approved Step 1 output.

## New run: obsidian-gaze — Step 1 draft (2026-10-08)

**Goal:** Build a minimal, offline Obsidian plugin called `obsidian-gaze` that lets a person open a single image, apply one of exactly four cinematic color grades in a modal, compare with the original using a button, and download the graded result as a PNG. One image in, one graded image out.

**Audience and environment:** An Obsidian desktop user working with images on their own device. The build environment is the user's Windows computer. Mobile support is not required for version 1.

**Input and output:** Input is one local image chosen by file picker or dropped onto the modal. Output is an immediate Canvas-rendered preview and a downloaded PNG. No image upload or external service is intended. File-type and size limits have not yet been decided.

**Must-have:** `Gaze: Open` command and camera ribbon entry; dark modal with image workspace and exactly four selectable presets (Wes Anderson, Wong Kar-wai, Greta Gerwig, David Lynch); click-to-choose and drag-and-drop image input; selected-filter preview; Show original button; PNG download; shutter and film-wind effects only; offline image processing. Preserve the supplied director names, taglines, accent colors, filter parameters, and tight feature scope unless a feasibility check finds a conflict.

**Out of scope:** Onboarding, music, Polaroid animation, AI director studio, custom presets, clipboard export, stickers, and spacebar before/after toggle. Do not fold in features from the prior image-palette website project.

**Observable success:** In an enabled Obsidian vault, invoking `Gaze: Open` or the ribbon icon opens the modal; choosing or dropping a browser-decodable image shows it; selecting each of the four presets changes the preview without network access; Show original visibly toggles; Download produces a PNG matching the selected grade. The UI remains usable at the supported viewport sizes, and invalid/unsupported files fail visibly rather than showing a stale image.

**Decisions and remaining implementation details:** The user approved implementing the supplied filter recipes rather than copying unavailable original code, and delegated the modal sizing choice. Choose a large centered modal, capped around 900px/90vh as specified, with a single-column fallback for narrow desktop windows. Mobile support is excluded for version 1. The proposed manifest's `isDesktopOnly: false` must be reconciled with this choice during Step 2. The listed tree also omits `directors.ts` even though `GazeModal.ts` imports it; Step 2/3 should resolve that without expanding the feature set.

**Status:** Step 1 approved on 2026-10-08 and saved in [[AI 101/Project 2/outputs/obsidian-gaze/01-define-the-goal.md]]. No plugin code, installation, or release yet. The selected Canvas node is Step 5, but a new project starts at Step 1 under [[AI 101/Project 2/00-start-here.md]].
