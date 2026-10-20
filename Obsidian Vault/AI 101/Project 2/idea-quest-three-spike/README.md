[ESF: no PS for idea.quest shelf release; note one?]

# IdeaQuest Final — The Midnight Workshop

## Published shelf-selection revision — October 20, 2026

The current Three.js room now keeps individual wall-shelf project labels out of the distant Worktable overview. A projected **Wall shelf** button sits on the shelf sign when shelved projects exist; click, tap, or keyboard-activate it to reuse the shelf camera view. The desktop shelf camera now moves closer, while shelf project labels appear only in that view. Select a shelf artifact to open its existing journal; Return preserves the shelf view, and Escape from that view returns to the worktable. The existing Wall shelf tab and All projects collection remain accessible fallbacks, including when WebGL is unavailable. No gate data, project record, or status-publishing scope changed.

Local checks: 25 idea.quest and four tracker tests passed, including shelf-label visibility policy; build succeeded. Headless Chrome checks at 1440×900 and 390×844 exercised the projected button, camera view, visible/hidden labels, project detail/return, and Escape with no page errors. A separate emulated touch run tapped the shelf and artifact without horizontal overflow or write requests. [Quiet overview](preview-shelf-overview-local.png) · [Desktop shelf view](preview-shelf-closeup-local.png) · [Emulated mobile shelf view](preview-shelf-mobile-local.png).

Vihaan then explicitly requested publication. The six-file public package was staged in the existing `idea-quest-ai101` Vercel project under the `vihaanmalik` scope; the five web-served assets matched the local SHA1 manifest before and after promotion. (`vercel.json` was included in the upload but is configuration, not a web-served asset.) Production deployment `dpl_EFLsog6Dsf8eaJ4qGVEopNFocQs2` is Ready at [idea.quest](https://idea-quest-ai101.vercel.app/); its immutable build URL is <https://idea-quest-ai101-35c1zad1x-vihaanmalik.vercel.app>. The local status-only publisher's visual pins were updated and its single watcher restarted; its scope remains status summaries only. **Actual-phone shelf framing/touch feel still awaits Vihaan's check.** No new workflow gate is claimed.

**[Open IdeaQuest Final](https://idea-quest-ai101.vercel.app/)** · [Professor review guide](../IdeaQuest%20Final.md) · [Project record](../Workshop%20Projects/idea-quest.md)



**Status:** The local vault-connected workshop supports editable project notes and checkpoints. Its public, read-only 3D edition is now deployed at [idea-quest-ai101.vercel.app](https://idea-quest-ai101.vercel.app). The [existing 2D Sites board](https://idea-quest-ai101.mv-vihaanmalik.chatgpt.site) remains available. No class approval gate changed.



The current October 12 revision is a cozy, dimly lit Midnight Workshop with a stone fireplace, animated flames, logs, a mantel clock, candlelight, and a smaller moonlit window. Bob is now a round charcoal witch cat with cream paws, a tiny smile, a single plush curled tail, and a floppy felt hat with a stitched band. The earlier Jibanyan-inspired red design and twin flame tails have been removed at the user's request.



The bottles retain their animated potion surfaces, bubbles, medallions, and project-journal interactions. The mobile composition raises the cat on a perch behind the bottles. All models and textures are local procedural assets.



[Current live preview](preview-performance-live.jpg) · [Desktop collection](preview-connected-collection-desktop.jpg) · [390px emulated journal](preview-connected-journal-mobile.jpg)



## Run on this Windows computer



The checked-in `app.js` already bundles Three.js; no runtime CDN or npm install is needed.



1. Open PowerShell and run:



       node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-three-spike\server.mjs'



2. Open <http://127.0.0.1:4188/>. Keep PowerShell running; press Ctrl+C to stop.



The server binds only to 127.0.0.1. Project notes under the connected AI 101 workspace are discovered on each refresh (every five seconds while the page is visible). New projects, links, states, custom milestones, and session checkpoints can be saved locally. Existing class approvals are read from `../progress-arcade/projects.json` and cannot be changed by this room. The collection now includes the Project 1 artifact and can grow beyond the original three projects; the physical table holds three artifacts. This local connection is not accessible on a phone or through the existing public snapshots.



**Current data note:** After Step 1 and Step 2 approval, idea.quest itself is **2/5**; Gaze is **2/5**; Image Palette Studio is **5/5** for its original accepted run. The normal local page therefore honestly shows **2/5, 2/5, 5/5**, not a fabricated 0/5 jar. To see the requested three *different* prototype levels, open the clearly labelled **[demo-level view](http://127.0.0.1:4188/?demo=1)**: it shows a simulated empty idea.quest jar beside real 2/5 and 5/5 jars, entirely in memory. It never changes the vault record. A temporary test fixture also verifies 3/5 without altering the real registry.



## Try the narrow interaction



- Click or tap a 3D jar, or use its labelled button under the scene. The chosen jar moves closer and the correct project detail panel opens.

- Press Escape or use **Return to table** to close it. Selection alone never changes gate status.

- Click Bob or **Say hello** for a greeting. Use the speaker button to enable or mute the short interaction chimes.

- Try a narrow browser window and system reduced-motion preference. Native buttons remain the keyboard/touch path if 3D picking is difficult or WebGL is unavailable.



## Files and repeatable checks



- `src/main.js`: bottles, picking, animation, sound, and DOM details.

- `src/spirit-cat.js`: procedural witch cat, hat, and animation.

- `src/workshop.js`: room, furniture, lighting, textures, and atmosphere.

- `src/progress.js`: pure approved-count/level calculation.

- `server.mjs`: loopback-only server with origin/token-protected project saves.

- `index.html`, `styles.css`: accessible text, controls, and narrow layout.

- `app.js`: pinned Three.js 0.186.1 browser bundle; `THREE-LICENSE.txt` is included for its MIT license.

- `tests/spike.test.mjs` and `tests/vault-store.test.mjs`: approvals, discovery, persistence, conflicts, links, milestones, and local API checks.



Run `npm test --prefix 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-three-spike'`. To rebuild `app.js`, run the absolute `build.ps1`; it installs pinned Three.js/esbuild packages under local AppData, **outside this synced vault**, then bundles the source. It does not touch the public tracker.



## October 12 verification



- Rebuilt the bundled browser app using the existing pinned dependencies; no new package was added.

- Both existing automated tests passed: approval-to-liquid calculations and the read-only server/registry flow, including demo and temporary fixture isolation.

- Browser checks at 1440×900 and 390×844: room loads, no runtime errors, no mobile horizontal overflow, a click on a real 3D bottle opens the corresponding record, and all three projects show their recorded approvals.

- Checked dialog keyboard focus containment, Escape, focus restoration, the greeting control, and sound toggle state. Audio playback was not independently listened to.

- Saved desktop/mobile screenshots above. Real-phone GPU performance and a full accessibility audit remain unverified. The procedural model and textures remain areas for further art refinement; this pass does not approve Step 3 or replace the public site.



### Cozy hearth revision



Rebuilt and visually checked at desktop and 390px mobile sizes. The matching central scene crop has roughly half the previous average luminance (0.209 versus 0.418), with the cat and controls still readable. Browser runtime error check passed. Fireplace flicker respects reduced motion. No data or server behavior changed.


### Painted storybook reference pass

The supplied sheep illustration informed the cat's broad matte ivory eyes, fleece collar, muted blue felt hat, and subtle pigment texture. Lighting now pairs amber illumination on the face with teal moonlight in the background. The witch cat and fireplace remain. Built successfully and checked at desktop and mobile sizes; workflow data is unchanged.

### Gouache surface revision

Added `src/painterly.js`: a baked brush-stroke atlas sampled across three object-space planes, warm/cool pigment variation, and brush-driven shading variation. Applied it to the cat, room, props, and potion surfaces. Reduced material reflections and glass highlight strength. Rebuilt and visually checked desktop/mobile with no browser shader errors. This is procedural painted shading; it is not a hand-painted asset replacement.

### Soft silhouettes and expressive Bob

The scene now uses an edge-aware, variance-weighted painting pass (`src/paint-renderer.js`) in addition to surface color variation. It blends neighboring colors while retaining face details; HTML text stays sharp. Furniture, brickwork, and the cat silhouette have small deterministic shape irregularities. Existing Three.js add-ons were used; no dependency was added.

Bob has large warm pupils, narrow ivory eye whites, cheek blush, relaxed brows, pointer-following eyes/head, curiosity, sleepy idle eyes, a waving greeting, happy petting eyes and hearts, and a full-potion celebration. **Say hello** and **Pet Bob** expose the reactions to keyboard/touch users. Input events explicitly render feedback to handle hosts that throttle animation frames. Reduced-motion mode keeps expressions but removes continuous motion. The phone perch is higher so the face remains visible above the bottles.

Verified the build, desktop/mobile layouts, petting response and hearts, greeting text, project selection/5-of-5 details, Escape return, and absence of runtime errors. The in-app screenshot pipeline can return a prior frame; reaction verification used the following composed frame. Real-phone frame rate and a full accessibility audit remain unverified. This is still a stylized 3D scene, not a hand-painted 2D asset set.

### Usable quest tracker and legibility pass

Larger, high-contrast project cards now show status, approved milestones, and one concise next action. A focus quest can be chosen from the project journal and is saved in this browser's local storage. Continue quest opens that record; it does not launch another app or mark work complete. Main-quest completion and a pending bonus quest are shown separately. Full milestone history and source notes are available in a collapsed disclosure.

Concise summaries are used only for recognized existing next-move text; changed registry notes fall back to their first sentence. The read-only registry and approvals are untouched. Mobile uses a scrolling list with readable cards rather than squeezing the entire tracker into one screen.

Checked focus selection and persistence after reload, notes expansion, Escape return, and desktop/mobile visual layout with no horizontal overflow. Restored idea.quest as focus after testing. Data/server tests were not rerun for this presentation/local-preference change.

### Potion organization: worktable, wall shelf, retired

Open a potion journal to move it to the back wall shelf or dispose of it into Retired. Shelving uses a lifted, gently tilted flight into a reserved wall slot; disposal shrinks the bottle into a spiral of sparkles. Restore and Undo retain all progress. Remaining worktable potions recenter, and focus falls back to another active project or a clear-table prompt. Reduced-motion mode skips these flights.

Placement is saved only in this browser (separate demo storage). Project files, registry records, and approval gates are unchanged. Retired is recoverable, not file deletion.

Verified shelving and persistence after reload, disposal, Undo, restoration, all-potions-shelved empty state, focus fallback, and mobile controls with no horizontal overflow or browser errors. Three organization helper tests pass. Restored all three potions to the worktable and idea.quest focus after testing. Screenshots: preview-potion-shelf-desktop.jpg and preview-potion-controls-mobile.jpg.

### Direct potion dragging

Drag a scene potion between the worktable and wall shelf. A glowing destination appears during the gesture; valid drops settle with a short bounce, and invalid drops return home. Pointer capture keeps the gesture intact outside the canvas; Escape or pointer cancellation returns the bottle. A short tap still opens the journal. Reduced motion removes tilt and flight. Desktop browser verification covered both directions and invalid drops with no runtime errors. Touch pointer handling is included; real-device feel is not yet verified.

### Room exploration and focus

Added eased shelf camera exploration and stronger pointer parallax, clickable hearth stoking, lantern toggle, and a physical journal that starts/ends a 15-minute focus countdown. Equivalent visible controls provide keyboard access. The focus countdown is session-only and resets on reload; it does not change project progress. Mobile uses the shelf collection without camera zoom. Verified desktop camera/control interactions and direct journal clicking, countdown start/end, lantern state, and no browser runtime errors. Real-device testing and timer completion remain unverified.

### Responsive Bob and parchment journals — October 13

Bob tracks a dragged potion in world space with eyes, head, a raised paw, and tail motion, retaining attention briefly after release. Fire stoking triggers a 16-second cozy pose with closed smiling eyes and warming paws. A folded, gold-edged open wool cloak breathes and sways with the body. Project cards and focus use rolled parchment, larger serif headings and dark ink, animated arrivals, journal unfurling, and consolidated Room rituals. Reduced-motion preferences suppress transitions. Verified local build, fire response and cloak visually, drag shelving/Undo, phone-sized journal, and absence of runtime errors. Mid-gesture gaze and real-device performance still need hands-on review. Original project arrangement restored.

### Mixed artifacts and the tucked-note reveal — October 13

Project state now chooses an artifact through `artifact-kind.js`: completed runs and standalone artifacts become keepsakes (a bonus review does not erase completion); the registry's primary active project brews as a potion; another draft awaiting review becomes a sealed scroll; other work in progress stays a potion. This presentation choice is independent of browser-saved table/shelf/retired placement and does not approve any work. The current three projects render as a potion, review scroll, and keepsake chest.

Selecting an artifact brings it forward and offers its opening gesture. The cork lifts, the scroll seal breaks, or the chest lid opens; a small note emerges. Dragging the note's ribbon down, or tapping/pressing its seal, unfurls the project journal. Bob tracks the reveal. Escape/Return cancels every stage, background controls are inert during the dialogs, reduced-motion preferences shorten the sequence, and mobile opens at the top of the room with a fixed reveal panel. Existing shelf dragging, Undo, retirement and restoration work with every artifact shape.

Built successfully. Five classification/organization helper tests pass, including completed work with pending bonus review. Browser verification covered potion ribbon drag to journal, scroll and keepsake opening/tap to journal, desktop scroll/chest shelf dragging and Undo, mobile reveal/journal, and no runtime errors. Original placement restored after testing. Real-phone gesture feel remains unverified. Screenshots: preview-artifact-collection.jpg, preview-artifact-note.jpg, preview-artifact-reveal-mobile.jpg.

### One-tap journals and the visual quest trail — October 13

An ordinary tap now opens the artifact automatically and brings up its journal after a short 720ms opening transition. The ribbon interaction is optional via Play with the ribbon. Move/retire actions are grouped in a collapsed Move or put away disclosure; the redundant current-focus button is hidden. Escape still returns to the room. Reduced-motion mode opens immediately.

Step fractions are replaced by five linked fantasy gems: gold stars for approved chapters, a gently glowing green diamond for the active chapter, and hollow diamonds for upcoming chapters. The detailed trail labels Goal, Route, Build, Review, and Refine; its numeric value and chapter states remain available to assistive technology. Completed original runs stay fully gold when a bonus task is pending. The registry is the same approval-only source.

Verified one-click entry to the journal, optional ribbon replay, correct approved/active/upcoming trail states and no visible fractions, completed bonus status, phone layout, organization disclosure, and no runtime errors. Build succeeds. Screenshots: preview-quest-trail-desktop.jpg and preview-quest-trail-mobile.jpg. Real-phone performance remains unverified.

### idea.quest branding and detailed art pass — October 13

The character is named Bob; the app is idea.quest. The compact original gold wizarding wordmark keeps the header small. The browser title, project display label, and journal use idea.quest, while the keeper label, pet action, accessible description, and interaction dialogue use Bob. Existing project IDs/preferences and source registry records remain compatible.

Rendering now uses a multisampled half-float target, desktop supersampling, a much lighter paint blending pass (78% original detail), and restrained HDR glow. Painted colour variation is retained, while normal perturbation is reduced and authored material roughness/metalness is respected. Glass is clearer; metal catches controlled highlights. Phones cap resolution separately.

Scrolls now have turned wood finials, decorated high-resolution vellum, seals and a small stand. Keepsakes have bevelled walls, an arched banded lid, a faceted gem setting, studs, an embossed star clasp, and a patterned interior. Bob has finer curved geometry, stitched cloak constellations and hat-brim seams. The hearth gains gradient flame shading, moving embers, visible log grain and clock markings. These remain procedurally made local assets; this pass does not establish parity with commercial Nintendo production art or hardware performance.

Build succeeded. Browser checks covered the small logo/renamed labels, sharp render and new models, one-tap journal, keepsake opening/lining, desktop and phone layout, and no shader/runtime errors. Desktop canvas supersampling measured 2161×1350 for a roughly 1441×900 viewport. The screenshot wrapper can return delayed or cropped frames; full-page capture also intermittently failed. A normal composed screenshot and following frame were used where available. Real-phone frame rate remains unverified. The local preview server was restarted after an old tab had become an internal connection-error page.

### Name correction — October 13

Corrected the previous mistaken app rename: Bob is the cat, and idea.quest is the app. Kept the compact wizarding treatment and the sharper art pass.


## Connected collection and session journals — October 13

**Use it:** open Collection to browse/search every project. + New idea also imports existing work: provide a name and optionally its GitHub repository, live app, or linked folder relative to AI 101. Released projects become keepsakes; Reviewing uses a scroll. Opening a project puts its links, last change, and next step first. Save where you stopped writes a dated Markdown session into the project note. Links, state & milestones edits its properties. Existing class approval gates remain in the original registry; newly added projects use their own optional Markdown checkboxes.

**Notes:** existing records were imported once into `Project 2/Workshop Projects/`. A project note has flat frontmatter with `ideaquest: true`, `title`, optional `id`, `pitch`, `phase`, `repository`, `live`, `next`, `changed`, and `folder`. The connector gives an ID to a marked note without one; keep that ID when renaming/moving it. Milestones are ordinary Markdown checkboxes between the milestone markers. Sessions are readable Markdown blocks. Keep the markers to retain structured history, and use the `next` property for the current next action. Normal prose and unrelated properties are preserved when the app saves.

**From Obsidian:** use `Templates/idea.quest project.md` with Obsidian Templates (or copy its frontmatter into a new note and set its title). The Templates folder itself is excluded from discovery. A marked new note appears automatically while the local connector runs. Notes added inside a linked folder show under Recent vault activity. Unmarked project README folders are offered as possible imports, rather than guessed into completed work. Ordinary unrelated notes are not made into projects. The configured connection covers this AI 101 workspace, not folders outside it.

**Persistence:** project data lives in vault Markdown; table/shelf/retired placement and preferred focus remain per-browser preferences. A stale save is rejected with the draft intact. Keep my draft and use the latest note reloads the current revision while preserving the form; save again to confirm your version. Broken links, unavailable folders, and duplicate IDs are reported in Collection. Retiring an artifact never deletes its note or code. Removing an imported note does not recreate it on restart.

**Local and hosted:** no GitHub/Vercel account connection is required to attach links. Automatic remote commit/deployment tracking and private online sync are later integrations. This collection initially ran locally; the public snapshot was subsequently deployed as documented below. No Git push was performed.

### Verification of the connected collection

11 automated tests pass: seeded approvals, local API persistence, foreign-origin rejection, note discovery and identity after moves/restarts, deletion without resurrection, stale-write rejection, linked-note activity, path boundaries, link deduplication, editable milestones, and retained released state while revisiting. The real browser verified creation, custom milestones, imported destinations, direct vault edits, retained drafts and conflict resolution, checkpoints, and released state. Disposable verification records were removed. Desktop and 390px emulated phone views showed no horizontal overflow; browser warning/error logs were empty. Native Obsidian protocol launch and real-phone behavior remain untested. Previews: `preview-connected-collection-desktop.jpg`, `preview-connected-journal-mobile.jpg`. Released status is retained separately from current work state through the `released` property.


## Public Vercel workshop — October 13, 2026

User requested deployment. Production deployment `dpl_9EMwd9A1imVQtYAzDDsFQf7ehPrz` is READY and promoted to https://idea-quest-ai101.vercel.app. Its immutable build URL is https://idea-quest-ai101-8uuv57ibg-vihaanmalik.vercel.app. Target: existing project `idea-quest-ai101`, owner VihaanM / `vihaanmalik`. Source: local prepared files (no Git commit SHA); SHA1 hashes and the publication timestamp are saved in `deployment-manifest.json`.

The hosted room, Bob, artifact opening, Collection, progress trails, and project GitHub/live destinations work online. It is labelled Published snapshot. Local-only project creation, checkpoint/settings saves, and vault-note links are hidden; shelf/focus preferences still belong to the current browser. Only project summary fields are published: no raw vault notes, local paths, session history, write token, server code, or credentials. Automatic vault sync continues in the local workshop; online changes require republishing until a separate authenticated sync service is built.

Verification: 11 local tests pass. Hosted edition inspected before upload; CLI dry run verified exactly six static files. After staging and promotion, HTML, bundle, stylesheet, project JSON, and Three.js license returned HTTP 200 and matched the recorded source hashes at both the build URL and permanent alias. The live browser loaded the room/collection without a sign-in wall; Bob's pet response worked. One harmless GPU shader precision warning was observed on the staged browser, with no runtime failure. Screenshot: `preview-production-vercel.jpg`. The temporary 4190 hosted-check server was stopped after verification.

To prepare another publication, run `node prepare-hosted.mjs`, inspect `public-deploy/projects.json`, then deploy from `public-deploy` using the existing project and scope. The current CLI is the cached Vercel 58.1.0 package. Use `deploy --prod --skip-domain --project prj_zblNLbIE9RMYCLvgbmcWDpdHipAQ --scope vihaanmalik --yes --non-interactive`, verify the returned READY build, then `promote <build-url> --scope vihaanmalik --yes --non-interactive`. Verify the permanent alias serves matching hashes. Authentication remains in the CLI's credential store.

## Faster opening and clearer controls — October 13, 2026

Project controls now load before construction and compilation of the 3D room. The room uses a native-density/pixel budget, a 1024px shadow map, and a nine-sample paint filter instead of 37 samples; bloom and four-sample postprocess MSAA were removed. The authored room and Bob geometry remain intact. Sustained slow foreground frames can select a lighter rendering mode.

Animation pauses in hidden tabs, offscreen rooms, the collection, and idle journals. A shared frame gate keeps pointer events and the animation loop from doubling drag rendering. Normal room animation targets 30fps and active dragging targets 60fps; these are budgets, not measured device guarantees. Room extras includes a saved pause-motion choice. The focus countdown advances independently of rendering.

All projects and View project make the hosted actions explicit. Links and important controls have 44px tap targets, visible keyboard focus, and clearer snapshot explanations. Ordinary opening takes 260ms, with the longer ribbon interaction remaining optional. Hosted polling is once per minute; local discovery remains every five seconds.

Measured in one native 480×712 embedded preview: project controls became usable at 0.23s versus 3.49s before; render submission was approximately 3.3ms versus 6.6ms. These are illustrative local runs with uncontrolled cache/scheduling. The embedded browser throttled animation callbacks to about 1Hz, so no actual phone FPS claim is made. Physical phone GPU performance remains unverified.

Verification: 15 tests passed, including rendering budgets, lifecycle pause conditions, adaptation, and competing pointer/frame callbacks. Browser checks covered desktop and 390px phone layouts without horizontal overflow, searching/opening projects, destination links, quiet mode, and the focus clock advancing while motion was paused. No runtime errors were observed. Saved an actual checkpoint in the idea.quest vault note; no approval gates changed.

Final production deployment dpl_EDUK3TYs576KofkD32TAknf48aca is READY and promoted to https://idea-quest-ai101.vercel.app. Immutable URL: https://idea-quest-ai101-pzz8gs8vd-vihaanmalik.vercel.app. All five public assets returned HTTP 200 and matched the manifest hashes at both URLs. Public hosting remains a read-only published collection; vault changes appear online after republishing. Live preview: preview-performance-live.jpg.

## IdeaQuest Final naming — October 13, 2026

The current published build is labelled **IdeaQuest Final** in the page title, wordmark, project record, and professor review guide. The source folder retains its existing path for compatibility. The earlier review note redirects to `IdeaQuest Final.md`. Naming does not approve additional class gates. Production naming build: dpl_EKRCQto9QTZtiBt9G5sHJuuPUU5P, https://idea-quest-ai101.vercel.app/.

## Room spacing and selection-only journals — October 13, 2026

Removed the always-visible focus parchment and the large progress/next-step cards from the overview. Each rendered artifact now has a small clickable name beneath it, positioned from the camera projection. Labels follow camera/room changes and hide during dragging. Crowded shelf names stagger with a subtle connecting line. Detailed progress and notes remain inside the one selected journal. Bob uses a compact control strip and a temporary response line; navigation and its hint sit in a separate lower band. Phone artifact/mat spacing is wider, and startup/resize place objects in their correct slots immediately.

Verification: 15 existing tests passed. Desktop 1440×900 and phone 390×844 checks covered artifact labels, journal open/return, and no horizontal overflow. Phone table label gaps measured about 13px and the Bob/navigation gap about 24px. Two shelf labels remained separate after moving a potion; Undo restored the original three-table/one-shelf arrangement. Browser runtime errors were empty. Public release and matching GitHub source were updated; approvals unchanged.

## Status-only automatic publisher — October 13, 2026

`status-auto-publish.mjs` is a **local monitor**, not a public write API. It reads `../progress-arcade/projects.json` and marked `../Workshop Projects/*.md` status records. After a quiet period, it builds the same allowlisted project-summary JSON used by the hosted collection. It copies the five pinned public visual/configuration files unchanged, runs the idea.quest and tracker tests, rejects suspicious paths/credentials or unexpected files, stages a production deployment on the existing Vercel project, checks the staged JSON hash, promotes it, and verifies the live JSON hash. It never reads a remote ChatGPT conversation, gives visitors edit access, or changes course approval gates by itself. Logs and the last-published fingerprint live under `%LOCALAPPDATA%/AI101Projects/idea-quest-status-publisher/`, outside the Vault.

Commands from this folder: `node status-auto-publish.mjs --dry-run` validates without deploying; `node status-auto-publish.mjs --once` publishes one validated status; `node status-auto-publish.mjs --watch` monitors selected local status inputs until stopped. On October 15, after Vihaan's “proceed,” a per-user Windows Startup shortcut was installed at `%APPDATA%/Microsoft/Windows/Start Menu/Programs/Startup/idea.quest status publisher.lnk`. It invokes `%LOCALAPPDATA%/AI101Projects/idea-quest-status-publisher/start-status-publisher.ps1`, which checks for an existing watcher before starting one hidden. Invoking the launcher started the monitor, but a real sign-out/sign-in cycle has not been tested. Delete the shortcut to disable automatic startup; this does not delete the monitor or project data. The Windows computer must be on, the Vercel CLI session valid, and the exact project/account scope available. Website HTML/CSS/JavaScript changes are intentionally **not** watched or published by this route; pinned asset hashes stop publication if the visual package changes.

Live trial: an assistant changed only `Workshop Projects/idea-quest.md`'s `next` status. The monitor detected it, passed 19 idea.quest tests and four tracker tests, staged and promoted a deployment, then verified that `https://idea-quest-ai101.vercel.app/projects.json` showed **3/5** and the new next step. HTML, JavaScript, CSS, and license hashes remained unchanged; no raw note history or Windows path appeared in the public JSON. An edit made during the first validation safely aborted that attempt and retried after the inputs settled. The first successful run logged a Windows temporary-stage cleanup `EPERM` **after** live verification; cleanup was changed to retry and report separately, and a subsequent dry run passed. The unattended watcher's longer-term reliability, reboot behavior, and arbitrary future status edits are not yet established by this one live test.

Further safety check: the publisher now resolves the inspected **immutable Ready deployment** before promotion instead of promoting a moving Vercel alias. This is covered by a new test; the current suite passed **20/20** idea.quest tests plus **4/4** tracker tests at that point. The Vercel CLI can hold its temporary staging directory briefly on Windows; an `EPERM` cleanup warning is logged separately and does not claim publication failed after live-hash verification. The monitor now has a user-level login shortcut, not a Windows scheduled task.

## Usability and sound — October 15, 2026

[Audit findings and evidence](usability-audit-2026-10-15.md). Journals opened from All projects now return to the same search/filter. A compact Continue shortcut exposes the chosen focus; the journal can start/end a 15-minute session that survives reloads. Shelf controls change the camera view on phones and desktop, and paused labels use the current camera transform. Full-table guidance appears before an unavailable move, with direct restoration to the shelf for retired work. No overview scroll cards were reintroduced.

Enable **Sound off** in the header to hear the local synthesized palette: potion, paper, keepsake, placement/Undo, purr, hearth/lantern and completion. **Room extras** contains remembered volume and fireplace ambience preferences. Sound is off initially and starts after interaction; mute/backgrounding stops active sources. No sound downloads or microphone access.

24 tests passed. Browser walkthroughs covered collection return/search reset, countdown reload, sound preferences, shelf/table view, paused labels, and retirement/restoration with the original arrangement restored. Desktop and 390px phone layouts had no horizontal overflow; runtime error logs were empty. Sound waveforms/controller behavior were tested, but hardware listening quality and real-phone performance remain unverified. Status publishing pins were updated for this reviewed release while drift checks remain in force. Production release: dpl_BG3kE3FgwUmEBfQxjApKyBvjp8Nh at https://idea-quest-ai101.vercel.app/.
