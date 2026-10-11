# 01 / 05 · Frame the idea

**Output:** goal + success test · **Gate:** you approve the scope

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

## New run: idea.quest progress arcade — Step 1 draft (2026-10-08)

**Goal:** Make a cute retro/ASCII gamified website that shows the live status of projects and new ideas we start together, with clear step progress and less text-heavy check-ins.

**Audience and setting:** The user on this Windows computer, working in the AI 101 Obsidian vault. The requested live view should reflect decisions in vault-backed records. Remote/phone access was not specified for this new site; the first implementation is local-only to avoid exposing the vault.

**Must-have:** Show multiple projects, honest approved-gate progress, the active/next step, and a concise dated quest log; let the user start an idea, approve a gate, request a revision, and add a note. The board must update when its vault registry changes. Keep actual human approval separate from code/test completion.

**Success check:** Open the local board, see the current Project 1/2 ideas with their distinct states, start a new 0/5 idea, request a revision without filling a block, approve once and see exactly one gate fill and the next unlock, and confirm the selected project's Obsidian progress card updates. Check desktop and narrow layouts for clipped controls.

**Out of scope for this pass:** Public hosting, accounts, multi-user editing, phone sync, scraping every unstructured vault note, or automatically interpreting prose as approval.

**Status:** The user's full-site request prompted an early runnable prototype, but **no idea.quest gate is marked approved**. Its scope and aesthetic direction are waiting for human review.

## idea.quest redesign — Step 1 approved (2026-10-11)

**Status:** The user said “i agree for now” on 2026-10-11. Treat the bounded goal and concept as Step 1 approval, not as final visual acceptance or permission to build a full scene. The idea.quest Goal gate is 1/5; Step 2 route review is next.

**Goal and audience:** Redesign the existing vault-backed project tracker as an inviting, slightly mysterious potion-room interface that makes the user's real AI 101 project status understandable at a glance. The user should feel they are visiting a playful cartoon witch's workshop rather than reading a dense dashboard. It remains a functional tracker, not just an illustration. Primary review is on this Windows computer; the public read-only link and narrow/phone layout must remain usable. A real-phone check has not yet been performed for this redesign.

**Visual concept — “The Midnight Workshop”:** One readable wooden worktable in a warm amber candle pool, framed by sparse shelves and a cool moonlit window. An original charcoal-black cat witch with an oversized floppy violet hat sits to one side as a friendly guide. Three large, clearly separated glass project jars sit on the table; plum, teal, and gold help distinguish them. The scene uses rounded silhouettes, restrained outlines, broad cel-shaded color bands, and expressive storybook proportions inspired by playful supernatural cartoon games, without copying a franchise character, logo, or game asset. Reserve uncluttered space for a project-detail panel; the room supports the data rather than swallowing it. One or two candles, not a shelf of competing props. [[AI 101/Project 2/progress-arcade/design/potion-room-concept-v1.png|Existing concept image]] communicates mood and composition only; its illustrated liquid heights and text are **not** the data source or a validated UI.

**First-prototype slice:** One table, one cat, and exactly three interactive jars: idea.quest at 0/5, Gaze at 2/5, and Image Palette Studio at 5/5 for its original accepted run. On selection, one jar moves/zooms forward and a readable detail view shows its real title, approved gates, current/next step, dated updates, and a way back to the table. Project 1's AI-art pin-up record must remain intact in the registry even if it is not one of the first three visible jars; it is an artifact, not a fabricated 5/5 workflow. No new artwork or status may overwrite those records.

**Must-have behavior and data:** Jar liquid fill derives from the existing `projects.json` gate states, not hand-painted art: 0/5 is visibly empty, 2/5 is about 40% of usable jar height, and 5/5 is full to the neck. Each jar also has a legible project name and numerical progress independent of color. Tapping/clicking a jar opens its correct project details; returning closes the detail view. The selection interaction must not approve a gate. Existing local actions remain explicit user decisions and the hosted version remains read-only unless a later step separately approves a changed publishing model. Preserve the full registry and update/sync path to `progress.md`.

**Success criteria to test later:** (1) The three jar labels and levels match the registry's approved counts on load and after a deliberate registry change/refetch; no gate fills from code completion, animation, or jar selection. (2) Selecting each jar brings the chosen jar forward and reveals that project's actual details, then Return to table restores the overview. (3) Mouse, touch, keyboard focus/activation, and Escape/close give a usable path; labels and details remain readable on desktop and narrow layouts, with reduced-motion fallback. (4) The fourth Project 1 artifact still exists in the registry and is not scored as 5/5; Image Palette's later unaccepted accent side quest is still identified as pending. (5) The working local edit/read-only-hosted boundary and existing project records survive the redesign. These are acceptance tests, not claims that the new UI already passes.

**Nice to have later:** Subtle cat expression, candle flicker, jar bob/tilt, and ambient depth, provided none obscures status or worsens reduced-motion use. A fuller room, extra shelves, and richer animation are not required for the first prototype.

**Out of scope for the first prototype:** A literal 3D game world, free-roaming camera, extra project jars, account system, remote editing, automatic approval from prose, and an AI-generated image used as the clickable interface. The reference's decorative slogans are not required UI copy.

**Assumptions/open decisions:** Exact rendering method, art production cost, mobile performance, and whether the look should be 2D/2.5D or real-time 3D are unresolved; compare them with evidence in Step 2 only after Step 1 approval. The proposed first three jars are a prototype visibility limit, **not** a deletion of other projects. The user may revise art direction, information density, or which project details matter most before accepting the goal.

**Step 1 check:** The user provisionally accepted the concept, preservation rule, prototype boundary, and success criteria. Saved as [[AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md]]. Step 2 may compare routes, but no larger build begins until the route and small feasibility test are reviewed.
