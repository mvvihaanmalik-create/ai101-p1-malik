# AI use log

Vihaan Malik · AI 101 · Project 1 + Project 2

Each entry records the **ask, result, and decision with a reason**. Tools are named at the start of each section; checks appear only when they affect the decision. Statuses describe what was known at that point in the session.

[[#2026-10-11 — idea.quest potion-room redesign|Latest project work]] · [[#2026-10-01 — Class 6|Class 6]] · [[#2026-09-29 — Class 5|Class 5]] · [[#2026-09-22 — Class 3|Class 3]] · [[#2026-09-17 — Class 2|Poster rounds]] · [[log-archive/ai-use-log-before-2026-10-10|Full original record]]

> [!info] Last recorded project status — October 11
> - **Image Palette Studio:** revised prototype accepted for now; the later manual-accent feature still needs an interaction check.
> - **Gaze:** two workflow gates approved; installed and user-enabled in the main vault. Cinema UI needs aesthetic review and a main-vault reload/check.
> - **idea.quest:** current public ASCII mirror remains live; Goal and Three.js Route approved (2/5). The local 3D side prototype awaits Step 3 visual review and is not published.
> - **Project 1:** exact three-colour submission poster retained; later horror posters are candidates.

> [!tip]- Add a future entry
> Under the relevant date and project, use:
>
> ### Short activity title · Tool
> - **Ask:** Goal + the prompt or change that mattered.
> - **Result:** What came back; link the artifact instead of describing every detail.
> - **Decision:** Keep / change / reject / pending — one reason or next check.
> - **Check:** Optional. What was actually checked, who checked it, and any material limit.
>
> Combine follow-ups about the same activity. Start a new entry for a meaningful change, output, or decision. Use “none” for editing-only work and “not recorded” when the original evidence does not identify a tool. Keep rejected attempts and distinguish approval from a passed test.

## 2026-10-11 — idea.quest potion-room redesign

### Step 1 concept and scope · Codex

- **Ask:** Use the supplied potion-room image to redesign idea.quest while testing the Project 2 workflow: a cozy, mysterious cartoon workshop with a black cat witch, wooden table, candles, and project jars whose liquid reflects recorded progress. Preserve project records; review the concept before comparing implementation routes. First prototype: one table, cat, and three jars.
- **Result:** Inspected [[AI 101/Project 2/00-start-here.md|the workflow]], the current [[AI 101/Project 2/progress-arcade/README.md|tracker]], and its four project records. Drafted [[AI 101/Project 2/01-define-the-goal.md|a revised Step 1]] with observable data, interaction, preservation, accessibility, and narrow-layout checks. Linked the existing [[AI 101/Project 2/progress-arcade/design/potion-room-concept-v1.png|mood concept]], which is not a data-accurate working UI. Updated idea.quest's next decision without changing any gate or deleting a record.
- **Decision:** **Pending user review** — the visual direction and three-jar slice are proposals, not approvals. Step 2 route assessment and new implementation stop until Step 1 is accepted.
- **Check:** Registry still contains idea.quest 0/5, Gaze 2/5, Image Palette Studio 5/5 for its original run, and the unscored Project 1 artifact. No new interaction or phone test was run.

### Step 1 accepted; Step 2 routes proposed · Codex + web documentation

- **Ask:** “i agree for now” to the Midnight Workshop Step 1 concept; continue one workflow step at a time.
- **Result:** Saved [[AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md|the accepted scope]] and advanced only idea.quest's Goal gate to 1/5. In [[AI 101/Project 2/02-check-feasibility.md|Step 2]], compared layered HTML/CSS/SVG on the existing tracker, a Canvas 2D scene, and a Three.js room. Recommended the smallest 2.5D route and a three-jar data/interaction test before art polish. Checked browser and GitHub documentation dated October 11; no redesign code or deployment was made.
- **Decision:** **Step 1 provisionally approved; Step 2 pending** — “for now” accepts the bounded direction, not final visuals, technical route, prototype, or release. Await the user's choice of route and small test.
- **Check:** Registry and generated [[AI 101/Project 2/progress.md|progress card]] show idea.quest 1/5, Gaze 2/5, Image Palette Studio 5/5 original run, and the unscored Project 1 artifact. The tracker test initially failed because its seed assertion still expected idea.quest 0/5; updated that assertion to the approved state and reran all three tests successfully. Vault sync passed its safety dry run and pushed the records to the public course repo at `577fdbee8f110803cd4065800275191b02955bca`. Current Node/npm tools were present; new jar interaction and phone behavior have not been tested.

### Three.js route accepted; isolated 3D feasibility build · Codex + Three.js + esbuild

- **Ask:** Choose Route C rather than the recommended 2.5D route; keep the existing public website shareable while the 3D version is built on the side.
- **Result:** Saved [[AI 101/Project 2/outputs/idea-quest/02-check-feasibility.md|the chosen route]] and advanced only the Route gate to 2/5. Built [[AI 101/Project 2/idea-quest-three-spike/README.md|a separate local read-only 3D test]] with one table, original cat witch, candles, three real 3D jars, raycast selection, and live project details. The normal view reads the unchanged registry and now honestly shows **2/2/5** because idea.quest gained two approved gates. A visibly labelled demo view shows **0/2/5** using an in-memory empty-jar fixture, never a false live record. No current public site source, deployment, or project gate was overwritten by the side build.
- **Decision:** **Keep Route C as the approved plan; Step 3 pending my review** — the rough procedural art tests 3D mechanics, not the final visual quality. Stop before larger modeling, public replacement, or Step 3 approval.
- **Check:** Pinned Three.js/esbuild installed outside the vault; bundle and 2/2 Node tests passed, and the existing tracker passed 3/3 tests. Headless Chrome showed the WebGL scene, correct data levels, 3D jar click, details, Return/Escape, mobile-emulated touch, no 390px horizontal overflow, and no page errors. Demo view showed 0/2/5 with a “NOT LIVE” badge. Both existing public links returned HTTP 200; no real-phone GPU test or user visual acceptance yet. The in-app browser handoff was unavailable, so the local URL must be opened manually. A safety dry run passed and the updated vault/side source was synced to the public course repo at `1396047728ca4522500f7f74696f10549f9beb51`.

### Pause 3D; explore owner chat and status · Codex + official documentation

- **Ask:** Pause the potion-room build and explore whether the existing public idea.quest could show project status and let me prompt the Codex-connected Claudian agent in Obsidian.
- **Result:** Checked the current public read-only mirror, local tracker, enabled Claudian plugin manifests, installed Codex CLI, Claudian's upstream documentation, and OpenAI's Codex app-server documentation. Recorded [[AI 101/Project 2/idea-quest-chat-feasibility.md|a status-only / local-chat / protected remote-bridge comparison]]. Updated idea.quest's next move but kept its **2/5** gates and all project records. No chat UI, backend, credentials, access change, or redeployment was made.
- **Decision:** **Pending my scope choice** — a website can use a separate Codex-backed bridge, but cannot simply embed the desktop Obsidian plugin; sharing the exact current Claudian conversation is unverified. Keep the public site live and do not expose the vault or allow unauthenticated prompts.
- **Check:** `codex-cli 0.154.0` lists `exec` and `app-server`; this is a capability check, not an end-to-end prompt or security test. The existing local site still binds to `127.0.0.1`; the public site remains read-only.

## 2026-10-10 — idea.quest deployment and public access

### Deploy the tracker; discuss a 3D makeover · Codex + Sites

- **Ask:** Deploy the latest Obsidian project tracker, make the existing site public, then plan a responsive, animated cat-witch potion room where each jar represents a project and liquid level shows progress.
- **Result:** Located idea.quest in `Project 2/progress-arcade`; republished saved version 4 to [the existing hosted link](https://idea-quest-ai101.mv-vihaanmalik.chatgpt.site) and changed access from owner-private to public. Then deployed the current hosted files to [Vercel](https://idea-quest-ai101.vercel.app) after I confirmed it should stay public. Recorded both links and their update behaviour in the local README.
- **Decision:** **Both public deployments completed at my request; makeover scope pending** — the existing hosted mirror continues to update after GitHub sync; Vercel is a static snapshot and needs a new deployment for changes. Project-level Vercel SSO is off so people with the link can visit. No makeover code or workflow approval was added.
- **Check:** Sites returned succeeded; Vercel reported the production deployment READY. Its management connector could not perform an anonymous-access check because its linked account was denied access to the project. No new phone, visual, or performance test was run.

## 2026-10-10 — Log redesign

### Compact session format · Codex

- **Ask:** Make the existing AI use log more compact, readable, and useful.
- **Result:** Grouped work by date/project, shortened entries to Ask → Result → Decision, and separated checks from approval. Updated both existing log copies; preserved the full original in the linked archive.
- **Decision:** Applied at my request; visual preference has not yet been reviewed. This changes the record's presentation, not any project's approval status.

## 2026-10-08 — Project 2 builds

Tool: **Codex** throughout this date. Tools used to build or check an output are included where relevant. Project records: [[AI 101/Project 2/00-start-here.md|Start guide]] · [[AI 101/Project 2/process-map.canvas|Workflow map]].

### Workflow — close the dry run and test a real idea

#### Step 5 accepted

- **Ask:** Accept the proposed stop to generic workflow editing.
- **Result:** Completed [[AI 101/Project 2/05-iterate-or-stop.md|Step 5]] and saved [[AI 101/Project 2/outputs/05-iterate-or-stop.md|the accepted output]].
- **Decision:** **Stop this pass** — apply the workflow to a concrete coding idea next. Only the missing-input gate had been validated; no app's feasibility was established.

#### Intent gap recorded

- **Ask:** Log [[AI 101/Project 2/intent gap.md|the gap]] between the intended feasibility checks and the generic dry run.
- **Result:** Recorded that tools, alternatives, OS constraints, and budgets still needed testing on a real project.
- **Decision:** **Keep the gap; treat its cause as a hypothesis** — using a broad problem instead of a concrete idea is my explanation, not an experimentally established cause.

### Image Palette Studio — goal to accepted prototype

[[AI 101/Project 2/image-palette-prototype/README.md|Prototype and instructions]] · [Live test app](https://mvvihaanmalik-create.github.io/ai101-image-palette-studio/)

#### Step 1 — goal drafted, clarified, accepted

- **Ask:** Build an image-to-palette app with a recoloured website preview; choose the easiest route and pause at each workflow check.
- **Result:** Drafted [[AI 101/Project 2/01-define-the-goal.md|the goal]]. Follow-ups chose automatic colour assignment, online sharing, Windows development, and phone usability. Budget stayed unknown.
- **Decision:** **Approve Step 1** — saved [[AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md|the accepted scope]]. Manual colour assignment and palette-sharing extras were not yet approved.

#### Step 2 — route researched and approved

- **Ask:** Check feasibility after goal approval; compare routes and a small Windows/phone test.
- **Result:** Using MDN, GitHub, Cloudflare, and W3C documentation, proposed browser-only HTML/CSS/JavaScript with a separate public app-code repo and GitHub Pages. Compared private-repo hosting and a framework route; recorded palette, contrast, format, privacy, and account risks.
- **Decision:** **Approve the route** — public app code and JPEG/PNG baseline accepted; other formats depend on browser decoding. Saved [[AI 101/Project 2/outputs/image-palette-web-app/02-check-feasibility.md|Step 2]]. Approval preceded any build or actual feasibility test.

#### Step 3 — local prototype and design objection

- **Ask:** Build only the small approved test, then review it.
- **Result:** Built local image input, Canvas colour extraction, swatches, automatic preview recolouring, contrast fallback, and decode errors. I called the initial design basic and unpolished; this objection was recorded in [[AI 101/Project 2/03-build-a-small-prototype.md|Step 3]].
- **Decision:** **Partial pass; review pending** — no polish approval or real phone/browser check yet.
- **Check:** Syntax and simulated colourful/monotone/transparent-pixel tests passed; local files returned HTTP 200. Real decoding, appearance, and touch use were still untested.

#### GitHub sign-in → publication for testing

- **Ask:** Provide a sign-in path and one-time device code, then publish the approved app-only test.
- **Result:** Started GitHub CLI authentication; after I completed it, verified sign-in and published only five prototype files in a separate public repo with the live Pages link.
- **Decision:** **Publish for testing** — the temporary authentication code was not logged. Publication did not resolve my design objection or constitute prototype acceptance.
- **Check:** Repository reported public, Pages reported built, and page/CSS/JavaScript returned HTTP 200. Phone behaviour and runtime privacy were not yet checked.

#### Desktop screenshot + phone confirmation

- **Ask:** Review the desktop screenshot and confirm image selection updates the phone preview.
- **Result:** Screenshot showed image → five swatches → recoloured preview and a contrast fallback. Blue-gray dominated while vivid cyan seemed underrepresented. I confirmed the phone flow worked.
- **Decision:** **Accept the narrow Step 3 result** — saved [[AI 101/Project 2/outputs/image-palette-web-app/03-build-a-small-prototype.md|Step 3 output]]. Visual polish, errors, privacy, speed, accessibility, and wider format/device coverage remained open.
- **Check:** Desktop evidence was a supplied screenshot; phone success was user-reported.

#### Step 4 — audit, clarification, approval

- **Ask:** Review the functional prototype before a bounded redesign.
- **Result:** Audited source/published files, reran simulated tests, independently calculated the displayed contrast, and benchmarked extraction logic only. An ambiguous “i do” reply was clarified as “i agree lets proceed.”
- **Decision:** **Keep the browser core; reject the generic design** — approved upload-control, editorial-preview, and accent-selection revisions only. Saved [[AI 101/Project 2/outputs/image-palette-web-app/04-human-check.md|Step 4 output]]. Phone lag/clipping remained unanswered; this was not release approval.

#### Step 5 — editorial preview and accent revision

- **Ask:** Make one design-and-palette pass, retest, and stop for review.
- **Result:** Added a single labelled chooser, an editorial preview using the selected image, larger swatches, and accent-aware extraction. Published the revision; recorded it in [[AI 101/Project 2/05-iterate-or-stop.md|Step 5]].
- **Decision:** **Pending visual/phone review at this point** — automated results did not prove the actual image's vivid cyan was captured or the design felt polished.
- **Check:** Syntax, whitespace, and four simulated-pixel tests passed, including a 1%-area cyan accent; Pages built and revised files returned HTTP 200.

#### Revised screenshot + phone check → stop for now

- **Ask:** Review the revised preview and choose another accent pass or stop.
- **Result:** Screenshot showed the structured two-column preview and pale cyan/blue accent, but cropped out the source filename/swatches. I reported “works fine on phone,” then chose “fine for now lets proceed.”
- **Decision:** **Keep and stop this iteration** — saved [[AI 101/Project 2/outputs/image-palette-web-app/05-iterate-or-stop.md|Step 5 output]]. Phone success was user-reported; accent accuracy and format/error/privacy/speed/accessibility coverage remained limited.

#### Unspecified “proceed”

- **Ask:** Proceed after the accepted stop, without a new target.
- **Result:** Asked what to work on next.
- **Decision:** **Await direction** — no sixth step, code change, or new acceptance was inferred.

#### Utility iteration — manual accent trial

- **Ask:** Improve functionality and utility.
- **Result:** Made swatches tappable as trial accents, with contrast-aware foreground and Reset to automatic; background/main text stay automatic. Updated scope, feasibility, [[AI 101/Project 2/05-iterate-or-stop.md|iteration notes]], public app repo, and live app.
- **Decision:** **Pending desktop/phone interaction check** — this later feature has no accepted output or final-release decision.
- **Check:** Syntax, whitespace, and six simulated logic/DOM checks passed, including swatch click, `aria-pressed`, and reset; Pages built and live files returned HTTP 200. Actual visual/touch use was not observed.

### Gaze — offline Obsidian image grading

[[AI 101/Project 2/obsidian-gaze-prototype/README.md|Prototype and installation notes]] · [[AI 101/Project 2/03-build-a-small-prototype.md|Build record]]

#### Step 1 — new goal, then accepted scope

- **Ask:** Build `obsidian-gaze`: one image in, one graded PNG out, four director filters, offline use.
- **Result:** Drafted a separate goal. Flagged absent original filter source, conflicting full-screen/900px sizing, mobile uncertainty, and missing `directors.ts`. I approved implementing the supplied recipes, delegated sizing, and excluded mobile.
- **Decision:** **Approve Step 1** — chose a centred 900px/90vh modal and saved [[AI 101/Project 2/outputs/obsidian-gaze/01-define-the-goal.md|the goal]]. Recipes were not claimed as exact copies of unavailable source.

#### Step 2 — feasibility and manifest route

- **Ask:** Assess the desktop plugin route before building.
- **Result:** Checked official Obsidian and MDN build/image/export/audio documentation and local tools. Proposed `id: gaze`, `name: Gaze`, desktop-only manifest, a required `directors.ts`, and a separate test vault.
- **Decision:** **Approve the recommended route and test vault** — saved [[AI 101/Project 2/outputs/obsidian-gaze/02-check-feasibility.md|Step 2]]. Kept `obsidian-gaze` as the project name.

#### Step 3 — build and visible project snapshot

- **Ask:** Build the functional plugin; make it easy to find in Project 2.
- **Result:** Built four grades, image preview, original toggle, PNG export, generated SFX, and command/ribbon outside the synced vault; installed three assets in a disposable vault. Copied source/build/tests into Project 2 without `node_modules`.
- **Decision:** **Build available; human check pending** — Step 3 not yet accepted. Corrected the running Obsidian version to 1.14.4 from earlier executable metadata.
- **Check:** TypeScript/esbuild and 4/4 synthetic tests passed; synthetic 1600×1000 grades took ~343–488 ms in Node. Installed hashes and 14/14 snapshot files matched. Production dependency audit was clean; two moderate development advisories remained. No in-app test had run yet.

#### First launch — trust prompt

- **Ask:** Run the prototype.
- **Result:** With Obsidian CLI disabled, opened the disposable vault through the vault manager and reached its “Do you trust the author?” prompt.
- **Decision:** **Wait for my trust choice** — reaching the prompt did not prove Gaze ran.

#### In-app run — clipping and window controls fixed

- **Ask:** Run after enabling; fix leaking card text and add minimize/full-window modes.
- **Result:** Tested all four grades, original toggle, and a downloaded David Lynch PNG. Fixed card bounds, added collapse/restore and in-app full-window controls, and retained a single native close icon. Reopened the updated empty modal for my next check.
- **Decision:** **Pending Step 3 human review** — minimize collapses the modal; it does not minimize to the Windows taskbar, and the open modal still blocks the vault.
- **Check:** Build and 4/4 tests passed. In Obsidian 1.14.4, text fit and controls worked; exported PNG kept 960×640 dimensions and sampled changed pixels even with original preview shown. A personal JPEG reached 1170×885 “PNG ready” without being saved/distributed. Sound, drop, and network trace remained untested.

#### Main-vault installation → discovery fix

- **Ask:** Put Gaze in this vault, then resolve its absence from the plugin list/command search.
- **Result:** Copied `main.js`, `manifest.json`, and `styles.css` to `.obsidian/plugins/gaze/`; hashes matched. Reload plugins refreshed the installed count from two to three and exposed Gaze v1.0.0.
- **Decision:** **Installed and discoverable** — its switch was left off in this step. Command/ribbon availability required enabling; installation alone was not Step 3 acceptance.

#### Cinema UI iteration

- **Ask:** Add film/cinema cues after I enabled Gaze in the main vault.
- **Result:** Added a perforated film surround, colour-room label, frame/local-grade metadata, numbered cards, and director-linked frame count. Updated isolated source, test/main-vault assets, snapshot, and [[AI 101/Project 2/05-iterate-or-stop.md|iteration record]].
- **Decision:** **Pending aesthetic review** — main-vault code needed reload/restart and visual check. No accepted output or final release.
- **Check:** Build and 4/4 tests passed. Test-vault image/grade counter, bounded cards, collapse, and full-window states worked; asset hashes matched. Main-vault visuals, new export, narrow windows, sound, and drop were not checked in this pass.

### Workflow progress cues

#### Five approved gates, not percent of effort

- **Ask:** Make ideation and step transitions less text-heavy with visual progress cues.
- **Result:** Added a five-gate strip to the start guide, [[AI 101/Project 2/progress.md|a live status card]], compact Canvas cards/legend, and one-line approval/output labels.
- **Decision:** **Pending my usefulness check** — Gaze showed 2/5 approved, with prototype review active; a new project resets to 0/5. Revisions do not fill approval gates.
- **Check:** Canvas JSON parsed; seven nodes, four sequential arrows, six linked files, and the red human-check node were verified structurally. Canvas appearance was not reviewed.

### idea.quest — progress arcade

[[AI 101/Project 2/progress-arcade/README.md|Source and instructions]] · [Hosted mirror](https://idea-quest-ai101.mv-vihaanmalik.chatgpt.site)

#### Local retro progress site

- **Ask:** Build a cute ASCII/pixel website showing live progress for ideas we start together.
- **Result:** Built project tabs, five checkpoints, approval-only progress/XP, quest log, new-idea form, and approval/revision controls. Seeded Gaze, Image Palette Studio, Project 1 as a bonus chapter, and idea.quest; registry changes update the vault progress note.
- **Decision:** **Prototype for review; 0/5 approved** — local-only initially, with no accepted outputs or automatic inference from prose notes.
- **Check:** Syntax, 3/3 API tests, and HTTP checks passed; 1440×1000 headless screenshot showed a populated board. Idea creation, gate approval, revision, invalid input, and cross-origin writes were checked. Real phone and hand-driven modal flow were not.

#### Hosted mirror

- **Ask:** Provide a usable hosted link.
- **Result:** Published an owner-private, read-only mirror that fetches [[AI 101/Project 2/progress-arcade/projects.json|the public GitHub registry]] every two minutes while open. Local version retains editing/approval controls.
- **Decision:** **Available for review; 0/5 approved** — changes appear after GitHub sync, not directly from unsynced vault files. Hosted editing is disabled.
- **Check:** Registry HTTP/CORS checks and hosted-mode screenshot passed; deployment succeeded. Real phone and authenticated hosted browsing were not tested.

#### Icon motion and microinteractions

- **Ask:** Animate icons and add feedback.
- **Result:** Added live pulse, floating rocket, twinkling stars, hover/focus/press states, idea-arrival flash, and approval-only checkpoint/XP pop; respected reduced motion. Published to the same hosted link.
- **Decision:** **Pending visual review; 0/5 approved** — motion changes did not approve a workflow gate.
- **Check:** Syntax and 3/3 API tests passed. Desktop boards fit; timed captures showed movement and reduced-motion captures stayed still. Hand-driven hover/touch was untested; test servers stopped afterward.

#### ASCII cat animation

- **Ask:** Animate the existing cat mascot.
- **Result:** Added blink, tail flick, and hover wink to its three-line ASCII form; kept it visible in compact layouts and suppressed movement in hidden tabs/reduced motion. Published the update.
- **Decision:** **Pending aesthetic check; 0/5 approved** — no workflow gate accepted.
- **Check:** Syntax and 3/3 API tests passed. Timed DOM captures showed poses; reduced motion kept rest pose. A 500px screenshot fit; deployment succeeded. Actual pointer-hover response remained untested.

## 2026-10-01 — Class 6

Project 2 research and workflow. **Tool:** Codex, with source PDFs and existing intent notes as context.

### Verify two sources

- **Ask:** Complete citation, summary, and verification fields for two copied source paragraphs.
- **Result:** Completed [[source-verification-log]] using Feldman/Anderson's abstract and conclusion and Kalving/Colley/Häkkilä's abstract and §5.2; checked metadata against PDF title pages.
- **Decision:** **Keep as verified entries** — only these two papers were checked, not all nine candidate links.

### Narrow the claim and write the brief

- **Ask:** Add a claim-check table and replace research-brief placeholders.
- **Result:** Narrowed “coding knowledge helps non-technical people” to code-reading skills helping them use code LLMs more effectively. [[research-brief]] separates the paper's finding from my proposed pre-expansion explanation/test checkpoint.
- **Decision:** **Fix the broad claim; keep the working brief** — the safeguard is a workflow inference, not a result directly tested by the paper. Research updates synced in commit `58b2b0e`.

### Map and write the workflow

- **Ask:** Create three-to-five connected steps, highlight human review, then fill the start guide and step instructions.
- **Result:** Made [[AI 101/Project 2/process-map.canvas|a five-step Canvas]] with four arrows and red human check; created numbered files and [[AI 101/Project 2/00-start-here.md|the start guide]]. Each defines input, actions, success criteria, and approval gate.
- **Decision:** **Keep the workflow plan** — I retain scope/route/risk/stop decisions; uncertainty and unrun tests must stay explicit.
- **Check:** Map/directions synced in `4fbca9d` and `d46d603`. Empty duplicate placeholders disappeared in follow-up commits; exact removal causes were not recorded.

### Dry run — Step 1: goal

- **Ask:** Follow the workflow one step at a time.
- **Result:** Drafted the workflow's intended user, inputs, scope, success criteria, and unknown real-project details.
- **Decision:** **Approve** — saved [[AI 101/Project 2/outputs/01-define-the-goal.md|Step 1]] before moving on.

### Dry run — Step 2: feasibility

- **Ask:** Assess the workflow's simplest route and constraints.
- **Result:** Proposed an Obsidian/Markdown planning method; flagged missing coding idea, target OS/device, and time/token budget.
- **Decision:** **Approve the document route** — saved [[AI 101/Project 2/outputs/02-check-feasibility.md|Step 2]]. No project-specific feasibility conclusion was possible.

### Dry run — Step 3: smallest test

- **Ask:** Test the approved workflow without inventing an app.
- **Result:** Used the broad intent scenario and missing inputs to test whether it would flag unknowns and stop.
- **Decision:** **Accept the limited dry-run pass** — saved [[AI 101/Project 2/outputs/03-build-a-small-prototype.md|Step 3]]. No code or actual toolchain was tested.

### Dry run — Step 4: human check

- **Ask:** Review evidence and keep my added speed/lag, responsiveness, and build-audit checks.
- **Result:** Distinguished the demonstrated missing-input gate from untested technical requirements.
- **Decision:** **Accept for this dry run only** — saved [[AI 101/Project 2/outputs/04-human-check.md|Step 4]]. The added checks could not run in a no-code exercise.

### Dry run — Step 5: iterate or stop

- **Ask:** Recommend one bounded next move.
- **Result:** Proposed stopping generic edits and trying one concrete coding idea with environment/budget recorded.
- **Decision:** **Proposed, then accepted October 8** — saved [[AI 101/Project 2/outputs/05-iterate-or-stop.md|Step 5]] on acceptance, not during this initial draft.

## 2026-09-29 — Class 5

> [!note] Backfilled October 1
> Reconstructed from timestamps, notes, and Git history. AI tools/prompts and classroom decisions were not recorded for these activities.

### Project 1 folder cleanup · Tool not recorded

- **Ask:** Consolidate existing poster variants and supporting materials.
- **Result:** Gathered them in [[AI 101/Project 1]] around 5:04 p.m.; shortened log links and updated both copies.
- **Decision:** **Keep the organization** — easier to find. This is a recorded present status, not evidence of a quoted classroom critique or new AI generation.

### Project 2 question and candidate sources · Tool not recorded

- **Ask:** Investigate why AI-assisted coding promises can fail after an early prototype because of toolchain, OS, time, or token limits.
- **Result:** Created [[AI 101/Project 2/intent|the intent note]] with the five-step failure pattern, two research questions, and nine candidate links.
- **Decision:** **Develop further** — the direction was established; candidate links were not evidence of reading/verification or a completed feasibility framework.

### Brief placeholder and sync · No AI output evidenced

- **Ask:** Prepare space for the research brief and sync class work.
- **Result:** [[research-brief]] existed but was empty. The 5 p.m. scheduled push (`e88ce8a`) preceded the new Project 2 notes; they first appeared in the October 1 sync.
- **Decision:** **Pending** — brief needed writing, and a 5 p.m. sync missed work added later in class.

### Comparison lessons carried forward

- Compare Claude's six correction rounds with Codex's identical-brief Round 7 honestly; do not treat Round 6 as Claude's first attempt.
- Track reference use, exhibit clarity, and exact colour compliance separately.
- Claude's exhibit colours had fixed wall/object/shadow roles; canvases stayed abstract and no type meant no actionable flyer.
- Codex's raster could be visually reviewed immediately, but required deterministic posterisation to satisfy exactly three pixel colours.

## 2026-09-22 — Class 3

Project 1 continuation. **Tool:** Codex; deterministic palette edit where noted.

### Round 12 — the painting remembers first

- **Ask:** Deepen psychological-horror manga grammar without copying an artist; preserve the low angle, Dutch tilt, square, no text, and three colours. Round 11 was supplied as reference; gallery references were not reattached.
- **Result:** [[student-ai-art-poster-v5.png]]: giant painted double, nested portrait in its hollow head, near-touching brushes. Palette edit verified coal `#0B0C12`, vermilion `#C72D32`, paper `#E5DCC8`.
- **Decision:** **Keep as a candidate** — mirrored gesture/nested portrait give the horror a specific cause. Submission artifact was not replaced.

### Folder structure check

- **Ask:** Match the course guide's project-root diagram and continue logging.
- **Result:** Existing six root items matched; created separate [[AI 101/Project 1/context-kit/palette.md|palette]], [[AI 101/Project 1/context-kit/style-note.md|style]], and [[AI 101/Project 1/context-kit/intent.md|intent]] notes, previously only README sections; updated both READMEs.
- **Decision:** **Keep** — structure matches the guide. Notes are dated as Class 3 formalizations, not falsely represented as earlier generation inputs; `project-01` was a sample folder name.

### Repository preflight → approved public upload

- **Ask:** Upload to the supplied repo, initially described as private; subsequently I explicitly approved a public upload of the whole vault.
- **Result:** Preflight found the repo public and paused. After approval, prepared notes/art/references/safe settings under `Obsidian Vault/`, omitted 14 local app-state files, added ignore rules, and pushed [the course repo](https://github.com/mvvihaanmalik-create/ai101-p1-malik).
- **Decision:** **Keep the public-content boundary** — local device/session/plugin/workspace state excluded. Instructor invitation and reference redistribution rights were not verified.
- **Check:** Remote main matched `1801db01fb5223de830f8f6d0dbe5d8343b00091`; the earlier pending upload was completed.

### Recurring repository sync

- **Ask:** Sync Tuesdays/Thursdays at 5 p.m. Eastern with the same exclusions.
- **Result:** Created a local clone/script and Windows task `AI101 Vault GitHub Sync`; incomplete sources, potential credentials, or large unexpected deletions stop a push.
- **Decision:** **Keep** — depends on this PC, authentication, and network access; configured to wake/retry after a missed run.
- **Check:** Dry run and manual task succeeded; another manual run pushed this setup record and verified `26acc98ccca87e931fc3a8d5aa07a7011310efb0`. These are setup-time checks, not a current schedule audit.

## 2026-09-17 — Class 2

Project 1 poster. Shared starting brief: **square; student AI-art pin-up; bold flat shapes; exactly three colours; no text**. Tools: ChatGPT setup, Claude/Claudian Rounds 1–6, Codex from Round 7. Constraints changed temporarily in Rounds 3–4.

### Round 0 — orientation · ChatGPT

- **Ask:** Confirm vault access, read README, and locate the log to start the context kit.
- **Result:** Located project files and summarized requirements.
- **Decision:** **Keep** — provided a starting format for the kit and record.

### Round 1 — bare prompt · Claude

- **Ask:** Build the shared brief after clarifying that I wanted a file.
- **Result:** [[poster-flat-three-color.svg]]: 1000×1000 Bauhaus-style disc/mast/base geometry; cream, navy, red.
- **Decision:** **Reject** — met the four constraints, but read as decoration rather than a student art pin-up.

### Round 2 — use the context kit · Claude

- **Ask:** Act as an agency creative lead; use the references and communicate the actual pin-up subject.
- **Result:** [[AI101_P1_Malik_Vihaan_Poster.svg|The Crit Wall]]: nine pinned sheets with evolving crescent marks; kit palette `#384640`, `#FFE8A1`, `#F56543`. Three colours, no text/gradients verified.
- **Decision:** **Keep** — pinned-sheet format communicated the subject and the palette was traceable to the kit.

### Round 3 — sketch, gradients, type · Claude

- **Ask:** Replace vague geometry with bespoke hand-drawn iconography; permit gradients and typography.
- **Result:** [[AI101_P1_Malik_Vihaan_Poster_v2.svg|The Machine Eye]]: spiral eye, twelve sketch glyphs, grain, gradient field, display/mono type.
- **Decision:** **Change** — promising direction, but eight hex colours, no date/venue, and no available rasterizer for visual verification.

### Round 4 — remove text and rebuild · Claude

- **Ask:** “no text!”; retain sketch style and gradients.
- **Result:** [[AI101_P1_Malik_Vihaan_Poster_v3.svg]]: enlarged centred eye, full glyph ring and ticks; composition rebuilt after type removal. Seven hex values remained.
- **Decision:** **Keep** — the square held without words and sketch work led the hierarchy; strict colour compliance was still unresolved.

### Round 5 — strict palette, editorial layout · Claude

- **Ask:** Restore exactly three colours and borrow layout cues from the kit; keep no text.
- **Result:** [[AI101_P1_Malik_Vihaan_Poster_v4.svg]]: flat palette, centred aperture, generous margins, registration corners, glyph column/hero split.
- **Decision:** **Keep** — the reference-led grid made it read as a designed plate.
- **Check:** Three hex colours; zero opacity attributes/filters. Gradients/grain removed to avoid intermediate colours; all original constraints recorded as met.

### Round 6 — exhibit elevation · Claude

- **Ask:** Use three new references; replace eye/glyphs with an exhibit. Assign wall/object/shadow colour roles.
- **Result:** [[AI101_P1_Malik_Vihaan_Poster_v5.svg|Elevation]]: three canvases and three plinth objects; butter wall, vermilion lit faces, black shadows. References: Pole lamp rhythm/shadow, Russian Contemporary Art Week volume, TijanaT colour field.
- **Decision:** **Keep** — role-based colour made flat shapes read as a lit room.
- **Check:** Three colours; zero opacity/filters/strokes; objects seated on plinths and shadow direction consistent.

### Round 7 — same brief, new tool · Codex + ImageGen

- **Ask:** Repeat the original bare brief in Codex; retry after a host-executable failure and request a strict-palette correction.
- **Result:** [[student-ai-art-poster.png]]: 1254×1254 student with stylus/tablet and studio geometry; ultramarine/coral/cream in appearance, no text.
- **Decision:** **Keep with caveat** — clearer subject and energy, but 10,111 RGB values in the pixel audit; deterministic three-colour posterisation needed.

### Round 8 — exhibition and negative space · Codex + ImageGen

- **Ask:** Remove studio clutter, clarify the student/exhibition action, and use the three poster references.
- **Result:** [[student-ai-art-poster-v2.png]]: one student pinning work, three exhibition panels, open lower-right area.
- **Decision:** **Keep with caveat** — calmer and immediately legible, but 8,546 RGB values; still not literally three colours.

### Round 9 — art becomes the focal point · Codex + ImageGen

- **Ask:** Make it avant-garde and intentional; put exhibited AI art ahead of the character scene.
- **Result:** [[student-ai-art-poster-v3.png]]: dominant coral sheet, cropped student, one profile evolving through contours/nodes/solid form.
- **Decision:** **Keep with caveat** — transformation gave the abstraction a reason; 7,661 RGB values still required posterisation.

### Round 10 — compliance and submission · Codex + deterministic hand edit

- **Ask:** Audit submission items and make the three-colour rule technically true.
- **Result:** [[AI 101/Project 1/AI101_P1_Malik_Vihaan_Poster.png|Final poster]] plus self-contained brief, documented context items, decision note, and disclosure.
- **Decision:** **Keep as submission artifact** — preserved Round 9 direction and packaged the required evidence.
- **Check:** 1254×1254; exactly three RGB values: `#2145D9`, `#FF5A4F`, `#FFF1D0`.

### Round 11 — psychological thriller · Codex + deterministic hand edit

- **Ask:** Intensify tension: low angle, Dutch tilt, severe foreshortening, recursive painted figure reaching toward the artist; allow a new palette.
- **Result:** [[student-ai-art-poster-v4.png]]: monumental tilted canvas, impossible hand/brush contact, profile vortex. Near-black `#080B18`, crimson `#D72638`, bone `#E7DDC7`; exactly three colours after posterisation.
- **Decision:** **Keep as a candidate** — opposing diagonals and near-contact created a specific tension source. The later Round 12 is logged under September 22.

## 2026-09-15 — Class 1

### Image prompt/model comparison · ChatGPT

- **Ask:** Refine image prompts and compare outputs across model options; also installed Obsidian this session.
- **Result:** Several candidate images with varying quality.
- **Decision:** **Keep the final image** — selected after repeated prompt/model comparisons.
