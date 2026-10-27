# idea.quest workshop

[Open the hosted Workshop](https://ideaquest-workshop.vercel.app/) or use **http://127.0.0.1:4190/** locally. **Connect PC** is needed for project data and agent work. Public asset collection works while the PC is off.

Start it with `start.ps1` on Windows, or run `npm start` in this folder. The Windows launcher starts all three local apps in hidden processes: Workshop (4190), idea.quest (4188), and Design Shelf (8917). It does not install a startup task.

The app switcher keeps Workshop, idea.quest, and Design Shelf inside one local window. The two original apps load once, in separate frames, and remain mounted when hidden. The project selector is shared: selections in the header, Shelf, or idea.quest are passed to the other views. Messages accept only the exact local app origins and frame windows and carry project selection, theme, and visibility, never approvals. Missing or unavailable apps show a retry message.

The sun/moon icon switches day and night; Shelf follows the shell theme. idea.quest keeps its original night-room artwork. Hidden idea.quest pauses its room animation and audio. The local idea.quest server includes Design Shelf without changing its note’s public-publishing exclusion. The same three views also run in the protected [Vercel app](https://ideaquest-workshop.vercel.app/).

## What connects

- Project summaries come directly from `Project 2/Workshop Projects` and the original class registry, through Design Shelf's existing bounded summary reader.
- Chief of Staff uses the standing vault agent. Technologist uses `Project-03/workflow-agent.md`. Pip uses `design-shelf/agent/pip.md` and the source guide. All roles load Vihaan's existing voice profile and hard rules.
- Creative Partner, Programmer, and Auditor are defined in `Project-03/agents`.
- Hosted Shelf reads the cloud asset catalog. The PC independently checks a newly saved cloud asset. Saved boards and approval snapshots remain project-scoped on the PC. The local app uses its bundled collection.
- Agents use the existing Codex login through its local App Server. Click **Connect agents**. No API key is stored by the workshop. Each turn uses an isolated context; recent role conversation and current project handoffs are supplied explicitly.

## The five stops

1. **Goal:** you save and approve what this cycle should do.
2. **Route:** you choose the design direction, references, technical route, and small test, then approve that exact plan.
3. **Prototype:** Programmer proposes a separate browser prototype. Inspect its files, apply it to the run folder, then accept it for review.
4. **Human check:** Auditor reviews the applied source and actual syntax results. Failures block this gate. You must try and acknowledge unverified checks and write what happened before accepting.
5. **Decide:** continue in a new cycle or finish this pass.

Agent replies never authorize gates. There are no publishing or original-source-edit tools. The current Programmer can create HTML/CSS/JS browser prototypes only. If the agreed test needs a native app, plugin runtime, backend, or hardware, it should explain the limitation instead of faking a pass.

A failed required check stops agent work except Chief of Staff discussion. **Request a fix** permits one Programmer attempt; the failure stays unresolved until a new prototype is applied and audited. **Revisit plan** starts a new approval cycle and retains the earlier journal. Changed note context requires revisiting. Running work can be stopped; it is never replayed automatically after restart.

## Records

Private conversations, drafts, outputs, and runtime state stay in ignored `.local/`. Browser drafts are also saved per project and role. Human decisions and applied prototype files appear in `Project-03/workshop-runs/<project>/<cycle>/` so they can be opened in Obsidian. Existing class gate history is read, never overwritten.

The server binds only to `127.0.0.1`. Writes require a per-process token and matching origin. Agents have public search and structured output, with shell, file, app, plugin, and delegated-agent tools disabled. Prototype previews run in a sandbox without network access or access to the parent page.

## Checks

`npm test` runs fixture-based integration checks for approval order, stale context, project isolation, restart, cancellation, failed audits and explicit fixes, prototype scope, and request protection. Tests use temporary records and a fake model, not real project approvals. A live Codex reply is a separate connection check and does not demonstrate all agent output quality.

Protocol reference: [Codex App Server](https://learn.chatgpt.com/docs/app-server).

## 3D companions

`src/characters.js` contains the real Three.js mesh models and animation loop. `public/characters.js` is its bundled browser output. One transparent WebGL canvas renders all six portraits using separate viewports. Idle, hover, blink and working poses animate model transforms; the UI's real job state controls working animations. Hidden apps and offscreen rooms stop rendering. Reduced motion disables idle and work loops. The original SVG is retained only as a WebGL fallback.

The bundle uses the existing Three.js/esbuild installation in `C:/Users/91982/AppData/Local/AI101Projects/idea-quest-three-build/node_modules`; no CDN or new runtime service is required. Rebuild the character bundle after changing its source.

Desks and all role props now render as Three.js meshes in each companion's scene, sharing its camera, lights and shadow map. Character body equators are sampled from the original SVG outlines and inflated into closed curved meshes. Vertex colors use the original six palettes and warm/cool gradient colors. This replaces the earlier generic sphere/box bodies. SVG portraits and desks remain as a fallback only.

## Hosting and updates

The UI is hosted on the existing private Vercel project. The local publisher deploys allowlisted source and public asset updates. Sunday cloud collection stores its own catalog and edition; a UI deployment does not reset them. No raw notes, runtime conversations or credentials enter the published bundle.

Shelf starts with 10 picks per category and replaces up to five each week. Pip research still runs on PC Codex. See [Shelf instructions](../design-shelf/README.md).
