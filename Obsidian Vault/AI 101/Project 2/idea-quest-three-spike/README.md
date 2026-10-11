# idea.quest · isolated Three.js feasibility study

**Status:** Local, read-only Step 3 prototype for review. It does not replace or redeploy the [current public idea.quest](https://idea-quest-ai101.mv-vihaanmalik.chatgpt.site) or its [Vercel snapshot](https://idea-quest-ai101.vercel.app). No Step 3 gate has been approved.

This is deliberately a small real-3D test: one wooden table, an original low-poly black cat witch, candles, and three selectable 3D jars. The cat and bottles are geometry, not the earlier concept image pasted onto a plane. Selecting a jar moves it forward and shows an HTML project record. The procedural art is a feasibility scaffold, **not** a finished Yo-kai-inspired illustration or final visual sign-off.

## Run on this Windows computer

The checked-in `app.js` already bundles Three.js; no runtime CDN or npm install is needed.

1. Open PowerShell and run:

       node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-three-spike\server.mjs'

2. Open <http://127.0.0.1:4188/>. Keep PowerShell running; press Ctrl+C to stop.

The server binds only to 127.0.0.1 and exposes only this prototype's three web assets and a **GET-only** `/api/projects` endpoint. It reads the existing `../progress-arcade/projects.json` on every request. It cannot approve, revise, or delete anything. The page refreshes the registry every five seconds while visible. The fourth Project 1 artifact stays in the registry but is intentionally not a jar in this three-project slice. There is no phone-accessible network link for this side build yet.

**Current data note:** After Step 1 and Step 2 approval, idea.quest itself is **2/5**; Gaze is **2/5**; Image Palette Studio is **5/5** for its original accepted run. The normal local page therefore honestly shows **2/5, 2/5, 5/5**, not a fabricated 0/5 jar. To see the requested three *different* prototype levels, open the clearly labelled **[demo-level view](http://127.0.0.1:4188/?demo=1)**: it shows a simulated empty idea.quest jar beside real 2/5 and 5/5 jars, entirely in memory. It never changes the vault record. A temporary test fixture also verifies 3/5 without altering the real registry.

## Try the narrow interaction

- Click or tap a 3D jar, or use its labelled button under the scene. The chosen jar moves closer and the correct project detail panel opens.
- Press Escape or use **Return to table** to close it. Selection alone never changes gate status.
- Try a narrow browser window and system reduced-motion preference. Native buttons remain the keyboard/touch path if 3D picking is difficult or WebGL is unavailable.

## Files and repeatable checks

- `src/main.js`: 3D room, geometry, picking, animation, and DOM details.
- `src/progress.js`: pure approved-count/level calculation.
- `server.mjs`: loopback-only read-only server.
- `index.html`, `styles.css`: accessible text, controls, and narrow layout.
- `app.js`: pinned Three.js 0.186.1 browser bundle; `THREE-LICENSE.txt` is included for its MIT license.
- `tests/spike.test.mjs`: registry/level and read-only-server checks.

Run `npm test --prefix 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-three-spike'`. To rebuild `app.js`, run the absolute `build.ps1`; it installs pinned Three.js/esbuild packages under local AppData, **outside this synced vault**, then bundles the source. It does not touch the public tracker.

This test does not establish real-phone GPU performance, polished art fidelity, production accessibility, or that the public Site can host a 3D replacement. Those require later checks and an explicit release decision.
