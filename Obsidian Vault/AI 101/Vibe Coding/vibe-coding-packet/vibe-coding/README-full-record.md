# Room 0

**Option:** Browser game. **Current build:** Room 0 v15, November 10, 2026. [Stair and gallery revision](build-record/tests/repairs-15/README.md) · [Next formal test](build-record/test-4-v15.md).

**Hosted November 9:** [Play Room 0 on Vercel](https://room-zero-ashy.vercel.app/). Public access enabled at Vihaan's request on November 9; no sign-in is required. [Current deployment and verification](build-record/playthrough-09.md). Build 07 adds freely licensed noir piano for the hotel and a darker ending cue. [Music credits and verification](build-record/music-07.md). These are independent Kevin MacLeod tracks, not Twin Peaks recordings.

Build 13 corrects hotel-character reaching hands, elbow constraints, wrist/palm contact and gesture timing. The player walk is unchanged. [Arm pass](build-record/arms-13.md) · [Documentation still needed](build-record/documentation-audit-13.md).

Build 12 reduces redundant mirror rendering, cleans reflected particles and completes a full randomized route through ending/replay. [Measurements and playthrough](build-record/performance-12.md).

Build 11 removes the crucifix, makes retreat the defense, revises room service/children/luggage anomalies and adds quieter musical intervals. [Changes and verification](build-record/atmosphere-11.md).

Interface pass 10 removes decorative HUD clutter and the external credits footer, revises menu selections and audio controls, and simplifies pause copy. [Record](build-record/interface-10.md).

Build 09 keeps a stable ordinary cast on every floor, scores turning back at the corridor entrance, reserves stairs for the fourth success, steadies walking across camera cuts and adds folk-horror suite dressing. [Full playthrough and verification](build-record/playthrough-09.md).

Build 08 replaces small UI copy with clearer typography, larger survival-horror menu controls, and simplified prompts. Guest locomotion now uses authored forward, retreat and side-step clips, acceleration/deceleration, and distance-matched footfall timing. [Changes and verification](build-record/ui-gait-08.md).

After an ordinary tour, inspect the lift landing and choose the east stair or west gallery. A changed detail means walk back past the entrance; an ordinary visit means cross the far end or top step. Four correct decisions reach the suite. A mistake or contact with the butler sends you back to ground.

All twelve approved anomalies now have ordinary counterparts. The nine additions cover room service, children, dog, glass handoff, luggage, portrait, lift, mirror and coat. Eleven matched inspection shots let you examine their details with E. The gameplay uses 20 fixed cameras across six locations. Two new reception shots complete the hostile ending: the greeting repeats, the butler loses his flesh and exposes glowing bones, and the surrounding cast closes in. See [v6 implementation and evidence](build-record/ending-06.md) and [the encounter catalogue pass](build-record/encounters-05.md).

## Run locally

Requires Node.js and a current desktop browser with WebGL 2 and a keyboard. The required Three.js runtime is included under `build/vendor/`; no installation or internet connection is needed to play the existing build.

Open a terminal in `build/` and run:

```powershell
node tools/serve.mjs
```

Open **http://127.0.0.1:4170**. Keep the terminal running. `build/index.html` is the entry point, but double-clicking it through `file://` will not load the GLB assets correctly. The local preview server binds only to this computer. The separately hosted Vercel build is publicly accessible.

If the port is already in use by this preview, use the existing address. To choose another port in PowerShell: `$env:PORT='4171'`, then run the server. Stop the server with Ctrl+C.

## Controls

| Input | Action |
|---|---|
| WASD or arrow keys | Walk; backing away keeps the guest's face hidden |
| E | Inspect nearby details, close inspection, open doors or read a notice |
| Escape | Pause or resume |
| Pause menu | Restart at reception, mute hotel sound or adjust music volume |

Sound starts after clicking **Enter the hotel**. E near reception's entry visits the night bar. The reception door leads to the lift landing; its east-passage door is to the right of the broken lift. Walk across the far corridor brass line to submit **continue**. To submit **turn back**, walk back across the corridor entrance; the landing return line also works for the lift anomaly. Turning around alone does not score. Release movement after a transition before walking again.

The first passage is ordinary and unscored. Each scored decision repeats the landing and corridor; only the fourth correct decision opens the final stairs to the suite. E at the unlocked suite starts the 26-second ending. Escape pauses/resumes the reveal. It concludes on the approaching cast; only **Begin again** starts another run. Walking and F do not interrupt the ending. Movement directions stay consistent through fixed-camera cuts; a short dissolve softens the cut. Retreat when the anomalous butler approaches. There is no weapon; F is unused. Normal butlers never pursue.

## Verification

Build 09 passes 22 tests, syntax/asset checks, a continuous randomized route through the ending/replay, threat escape/contact checks and targeted clue fixtures. See the v9 record above.

From `build/`, run `npm test` for rules and randomization, `npm run check` for syntax, and `node tools/check-assets.mjs` with the local server running. V6 passes thirteen rule/timeline tests, the suite-door ending trigger, pause/input isolation, terminal hold and clean replay. Its renderer and assets were checked separately. V5 passed nine rule tests, all runtime asset checks, 24 normal/anomalous fixture checks, inspection pause/return, a mixed four-choice browser route to the suite, and a wrong-choice reset. The earlier v4 evidence retains the natural randomized run, crucifix and contact regression checks. These are engineering checks, not coursework human testing.

## Source and regeneration

Current environment source is `hotel-v9.blend` with `hotel-v9.json` and 33 normal/variant plates. Run `build_playthrough_v9.py`, `refine_luggage_view_v9.py`, then `refine_suite_binding_v9.py` in local headless Blender from `build/`. The v9 record documents the retained foundation.

V6 adds `build/assets/ending-skeleton-v6.blend`, `ending-reception-v6.blend`, `butler-skeleton-v6.glb`, `ending-v6.json` and two reception plates. Run Blender with `tools/build_ending_v6.py` after the v5 foundation to regenerate them; `refine_ending_skeleton_v6.py` and `refine_ending_room_v6.py` rebuild either part separately. `src/ending-timeline.js` owns the finite sequence and `src/reception-ending.js` owns its scene and glow/blur rendering. No new dependency or online asset was added.

Retained v5 sources are `build/assets/hotel-v5.blend`, `child-v5.blend`, `staff-v5.blend` and `encounter-props-v5.blend`, alongside retained `characters-v3.blend`. The historical v5 runtime loaded `hotel-v5.json`, 28 normal/variant plates, five weighted human GLBs and the original prop GLB. For v5 regeneration, retain the documented v3 foundation, then run Blender with `tools/build_child_v5.py`, `tools/build_staff_v5.py`, `tools/build_props_v5.py` and `tools/build_encounter_plates_v5.py` in that order. These reuse the retained official CC0 archive; no new package download is required on this workspace. See the v5 report for inspection mapping and limitations.

The following paragraph records the preserved v3 foundation. Its sources are `build/assets/hotel-v3.blend` and `characters-v3.blend`. The browser uses `hotel-v3.json`, nine `*-v3.webp` plates, both `*-v3.glb` characters, `hotel-occlusion-v3.glb` and the original corridor `occlusion.glb`. Earlier assets remain preserved.

From `build/`, regenerate v3 with Blender's `--background --python` command and these scripts in order: `tools/build_characters_v3.py`, `tools/build_hotel_v3.py`, `tools/refine_hotel_v3.py`. The character factory reuses the documented v2 MakeHuman dependencies. `tools/check_gait_v3.py` measures stance-ankle drift; `node tools/check-assets.mjs` validates all current assets, 17 gameplay views plus two ending views, 30 plates, six locations and rigged clips. The optional `?review` URL exposes location/encounter fixtures and an explicit completed-frame measurement button; these are absent in normal play.

The following instructions describe the preserved v2/v1 sources:

The v2 editable sources are `build/assets/characters-v2.blend` and `build/assets/hotel-lighting-v2.blend`. The browser uses `arrival-v2.png`, `passage-v2.png`, `guest-v2.glb`, `butler-v2.glb`, the original `occlusion.glb` and `scene-v2.json` camera data. The original `room-zero.blend` and v1 assets are preserved. Full details: [technical approach](room-zero-technical-approach.md) and [character source/licenses](sources/room-zero-character-assets.md).

For art pass 02, after preparing the MakeHuman dependencies described in the character source note, run these from `build/`:

```powershell
python tools/extract_character_assets.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/build_characters_v2.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/lighting_v2.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/render_character_study_v2.py
```

The following older commands recreate the original v1 foundation only:

To regenerate the artwork using the installed Blender 4.3 and Python with Pillow, run these from `build/` in order:

```powershell
python tools/make_textures.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/build_scene.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/refine_lighting.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background --python tools/refine_characters.py
& 'C:/Program Files/Blender Foundation/Blender 4.3/blender.exe' --background assets/room-zero.blend --python-expr 'import bpy; bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)'
```

The lighting refinement currently expects an NVIDIA GPU supporting OptiX. For another machine, change the render-device setup or use CPU rendering. Regeneration overwrites generated assets; copy the scene first if you have edited it by hand. The first build script recreates the scene rather than modifying an existing scene.

To refresh the pinned runtime: `npm ci`, then `node tools/vendor.mjs`. `node --check src/main.js` checks JavaScript syntax; `node tools/check-assets.mjs` checks the running local server's assets and camera definitions.

## Known limits and scope

The new characters use adapted CC0 MakeHuman assets with detailed human topology, textured faces, fitted clothing and weighted 53-bone rigs. They have authored Idle, Walk and Raise clips. The butler has a silver receding hairline, gaunter face, ivory gloves, brass buttons and a sustained head tilt. Window lighting was corrected and new plates rendered; a live floor shadow supplements the soft contact shadows. See [historical v3 evidence and limits](build-record/visual-prototype-03.md). Facial performance, cloth simulation and final foot planting remain unfinished. The moodboard is still a target, not a claim of achieved parity.

The stairs are now traversable and E handles doors and brief notices. Object close-ups, all twelve anomaly variants, four-step scoring and the hostile reception ending are implemented. The letter and fixed progress story clues still need integration. Stair traversal currently uses a smooth collision slope over the rendered treads; individual stair-foot placement needs a dedicated pass. Mobile/touch play is not implemented. Audio listening quality needs human review.

Formal T1, T2 and T3 were recorded on v13. T4 is scheduled on v15; the final student reflection and formal comparisons are still open.
