# Hosted Workshop

Site: https://ideaquest-workshop.vercel.app

Vercel project: `ideaquest-workshop`, `prj_Pgx8gFT7EwQqLkNhcLP3MCK2MHPa`, owner scope `team_rYbBIpXkLNdDUrzd7HHQ5qOZ`.

The site is protected with Vercel Authentication on all deployments. Workshop, Design Shelf and IdeaQuest are hosted under one origin. The public library includes 175 reusable assets and packs plus 22 inspiration references.

## Connection status

The user approved the exact production origin to read selected project summaries, progress, references and agent replies, and send agent requests and approved actions. Codex and project files remain on the PC. Start `start.ps1`, open the production site on this same PC, and allow the browser's local network connection if prompted.

The limited connection uses `http://127.0.0.1:4190/bridge/`. It shares project IDs and titles for the picker, then a selected project's allowlisted summary and run data. It uses short-lived tokens bound to that project. Explicit commands cover drafts, goal/route choices, reference approval, the five human gates, agent requests/stops, reviewed prototype application to the run folder, saved references and source imports. Existing revision checks and approval requirements still apply. Codex connects when the user sends an agent request.

Local `/api/*`, Codex setup, raw notes, source snapshots, vault paths and arbitrary commands are not exposed to the hosted origin. The other two PC servers have no new CORS access. Hosted IdeaQuest shows the current Workshop cycle; note editing stays in the local app. Prototype previews are sandboxed and cannot use the network.

The deployed package contains public UI code and catalog data only. No project summaries, note bodies, conversations, approval histories or credentials are uploaded. Approved live data goes directly between the browser and this PC. Saved reference boards use the PC's existing store.

Vihaan confirmed **PC connected** in Chrome after using the direct **Connect PC** button. The separate in-app browser still reports `Failed to fetch`; that preview does not share Chrome's permissions. Use Chrome on the same PC and allow the site's local network connection if prompted. The button itself does not start an agent or change any approval. Do not disable browser security protections to make it work. The hosted public catalog remains available while the PC connection is offline.

Fifteen isolated checks passed across the hosted bridge, shared runtime, context handlers and existing Workshop workflow. They cover selected-project tokens, summary boundaries, shared selected context across the three runtimes, project-specific saved boards, progress, skipped approvals, unapproved references, failed audits, stale revisions, cancellation and restart. A late-context race during rapid IdeaQuest switching was fixed and regression checked. These checks used sample projects, fixture replies and temporary stores. No real gate was approved and no live Codex request was sent. Direct inspection of Chrome's switching and a live agent round trip remain unverified by the assistant.

## Updates

Design Shelf now has 33 curated previews for the assets that previously used generic tiles: eight sheets of original icons, ten specimens using the actual licensed fonts, and fifteen source examples. The source manifest is `Project-03/design-shelf/config/asset-previews.json`. Icon/font files and their licenses are bundled under `assets/previews`; React Aria uses a captured original interface example. Other source images and clips load from the original public URLs. Videos run only while visible and pause for reduced motion or a hidden page. Assets without a known preview use compact cards instead of generic image placeholders.

`design-shelf/scripts/prepare-asset-previews.mjs` prepares these source assets; `--force` refreshes them. Existing cached previews remain usable when preparation stops on a changed source. The regular asset collector keeps using the same reference IDs, so previews survive scheduled catalog updates.

`start.ps1` starts a hidden publisher that watches the three app interfaces and the public asset catalog. It rebuilds the allowlisted package and publishes to the same production URL after changes settle. Private notes, run folders and local configuration are outside the watched source list. Builds and target-project checks must pass before upload.

The watcher needs this PC and the Vercel CLI login. Its status is in `.local/cloud-publisher.log` and `.local/cloud-publisher-error.log`.

Manual publish, from the course folder:

```powershell
node Project-03/workshop/scripts/publish-cloud.mjs
```

The temporary local review runs on port 4191 via `scripts/preview-cloud.mjs`. It serves the exact staged cloud package.

## Workshop task and approval layout

Workshop now uses one task card for the next step, a running agent, an approval, a failed check, a paused run or a completed cycle. Human approvals use a warm amber card, an explicit waiting label, the matching agent marker and paused amber route dots. Review links open the relevant task; they do not approve it. The task card is cleared while a different project loads.

The five-step progress view, agent list, approval record and run controls expand on request. The current review comes before past approvals. Repeated map labels, status messages and the save footer are hidden. Agent models, animation, project sync, server approval checks and prototype permissions are unchanged. Layout review used a separate read-only sample on port 4193; no real gate was approved.

## IdeaQuest room and journal layout

IdeaQuest now has one compact project card showing the next step and progress. The journal puts that step first, with progress, project details, focus tools and editing controls expandable below it. Secondary room controls live in Room extras. The room scene, artwork, characters, reveals and interactions are unchanged.

Inside the shared app, the card and journal read the selected project's current Workshop cycle. Review in Workshop opens the current review without approving it; the parent checks the selected project and chooses the destination from its own current state. Standalone IdeaQuest retains its original note milestones and local editing. The read-only cycle display does not overwrite note milestones or change the room's keepsakes.

## Interactive Shelf previews

Opening a supported asset now starts a local sample in the reference dialog. Five motion libraries (Motion, Anime.js, React Spring, AutoAnimate and Use Gesture) and four 3D libraries (Three.js, Fiber, Drei and Rapier) run their actual npm packages. Captured sample thumbnails are bundled, so these cards do not depend on remote demo images. Original source media remains available under **Source preview**.

Poly Haven model cards load the actual 1K glTF, geometry and textures from its public API. Orbit, zoom, wireframe, auto rotation and reset are available in the dialog. Packs without an individual web model keep their original pack image; they are not presented as live models. Source links, licenses, reference IDs, saved boards and approval gates are unchanged.

Only an explicit demo identifier or a public Poly Haven asset slug enters the sandboxed preview frame. It receives no project summaries, PC tokens or private notes. Its separate content policy permits the exact bundled scripts, WebAssembly for Rapier, and the two public Poly Haven hosts, with no PC bridge access. Each demo is a self-contained HTML document, so protected Vercel hosting needs no additional authenticated module requests. The parent app keeps its existing script and network policy. Closing or changing the reference removes the frame. Dependencies are pinned in the Shelf lockfile, and bundled notices are served at `/shelf/try/licenses.txt`. Preview code is under `design-shelf/src/try`; rebuilding the Shelf also builds the lazy demo bundles.

## Scope and review history

Automatic review rejected an earlier broad `/api/*` CORS proposal. The implemented bridge replaces it with exact endpoint and method allowlists, explicit command fields, selected-project tokens, and response projections. No broad API exposure or tunnel was added. Only the stable production origin is allowed; preview deployments cannot access PC project data.

## Weekly asset shelf

Shelf now shows only licensed reusable assets, with no Inspiration or collection/type/license filters. Its default is a rolling fourteen-day selection with up to five items per category in each seven-day period, balanced across makers and asset types. Full collection, search and saved boards retain older assets. Added dates survive collection refreshes.

Vercel now runs the asset refresh on Sundays at 15:00 UTC without the PC. The old PC automation was removed; cloud catalog snapshots survive later interface deployments. Every visible card requires a validated bundled image or original font specimen; failed previews are excluded. The current 175 assets have 165 verified image files and ten original font specimens.

## Cloud asset refresh and exclusive categories

The prepared cloud refresh uses a private Vercel Blob store for public catalog metadata and original thumbnails only. It does not contain project summaries, boards, notes, agent replies or PC credentials. The store is `ideaquest-shelf-assets`, scoped to production in the existing Workshop project/team. The user explicitly approved this setup after automatic review requested approval. The private store is `store_ioKZZP4bQoWVLloQ` in iad1, connected only to this project’s production environment. The Hobby plan was retained; no paid upgrade was selected.

`cloud-runtime/` contains the catalog, thumbnail and refresh handlers. The source directory and a verified catalog/preview fallback are bundled. Store access uses the linked project’s OIDC credentials. A separate generated `CRON_SECRET` protects the refresh. The cron is omitted unless `.local/cloud-assets.json` has `enabled: true`; the approved setup is enabled and runs Sundays at 15:00 UTC. Vercel Authentication remains enabled. The refresh checks original publishers and licenses, preserves added dates and last-good assets, stores new previews before publishing the catalog, and avoids overlapping or duplicate weekly runs. It does not call an LLM or the PC bridge.

The public catalog is read separately from the PC connection. Saving a newly collected asset uses the existing URL import command: the PC independently checks the configured original source and license before accepting the asset ID. Agent execution, approvals and saved boards still run locally.

Each asset has exactly one home category. Project tags remain available for recommendations; they do not duplicate cards across the category carousel. A manual browser review covered all 175 assets: 165 decoded images, ten rendered font specimens and zero category overlap. Cached previews load eagerly, including below the initial screen. Opening an image keeps the cached preview; source videos retain a cached poster. Model slugs preserve original case.

Cloud validation: the first production invocation completed with 175 assets, zero new additions, zero failed sources and zero preview failures. The saved cloud snapshot is served by `/api/shelf-library`; Vercel reports the Sunday job enabled with no undeployed changes. The job endpoint returns 401 without its private secret. No real agent request, board edit or approval was performed during validation.
