# Room 0: observation loop and playthrough 09

November 9, 2026. Vihaan said the Twin Peaks atmosphere works, but the gameplay does not feel enough like Exit 8. He requested a full playthrough, fixes to walking/camera transitions/encounters, restrained Hokum influence and ongoing vault updates.

## Implemented changes

- The first ordinary passage previously showed only the butler. Later ordinary passages randomly swapped in different guests. That undermined learning a stable baseline. All six character encounters now retain fixed positions through ordinary and anomalous passes; a draw changes one encounter or environmental detail. The existing twelve-anomaly shuffled bag and four-correct-decision target remain.
- A return previously required E at the corridor door, then walking across a separate landing threshold. Returning now scores when crossing the corridor entrance itself. The landing return remains available for the lift anomaly.
- Every correct forward decision previously sent the player up the stairs before another identical landing. Correct decisions now repeat the landing and corridor directly. The fourth success opens the final stair route. This makes comparison the central activity.
- Camera-relative forward movement drifted sideways and into walls. Walking now uses consistent hall directions across fixed shots. Forward pace reduced from 1.22 to 1.12 m/s; the v8 authored forward/back/side clips and acceleration/braking remain. Camera cuts get a short 140 ms dissolve between registered shots, disabled for reduced motion. Plate and geometry are never interpolated independently.
- Entrance and inspection priorities are corrected. The red landing door and final stairs support walking through; suite entry remains a deliberate E interaction. Removed a generic warning that revealed the butler anomaly before observation. The bell cue now occurs closer to the butler, before pursuit.
- Headless Blender produced matching inspection plates for the fixed cast. Luggage was reframed after the first angle obscured its hand/case separation; the glass and rim are more visible. The final suite has original dried rush bindings, red thread, old wax candles and a salt threshold, plus a low knocking cue. These are invented hotel props, not claims of authentic ritual practice or copies of film assets.

## Reference check

[PLAYISM's official Exit 8 description](https://playism.com/en/game/the-exit-8/) identifies the observation/turn-back rule and repeated liminal passage as its core. [Hokum's official synopsis](https://www.hokummovie.com/synopsis/) describes a remote inn and stories of a witch haunting its honeymoon suite. Room 0 keeps its already approved story and final reception reveal; the new dressing draws on the broader folk-horror atmosphere.

## Verification

Evidence: [playthrough-09 files](tests/playthrough-09/). These are agent-driven engineering checks, not human coursework testing or Vihaan's visual approval.

- A continuous browser run with seed 2680764159 completed reception, ordinary orientation, randomized floors, four consecutive correct decisions, stairs, suite, the entire hostile ending and Begin again. No encounter fixture or room teleport was used until after this run. The scored sequence included an intentional ordinary-floor wrong return, a correct C2 return, an intentional wrong C4 continuation that reset an earned point, then correct E2 return, ordinary continuation, C3 return and E5 return to unlock the suite. See full-random-run.json.
- Forward movement through camera boundaries retained x=-0.32 without the previous sideways drift. Retreat selected WalkBack; side movement selected the side clips. Inspection stops movement. The guest retains the existing procedural clips, not motion capture. Stairs still use a collision slope rather than individual foot IK.
- Targeted C1 checks confirmed one crucifix cast and retreat escaped without contact, earning a correct return. A separate no-defense approach registered contact and reset an earned point to zero. See butler-repel.json, butler-escape.json and butler-contact.json.
- Ending movement/defense input is locked out. Pause froze the ending and music; resume completed the 26-second reveal. Begin again returned to ordinary orientation with zero progress and locomotion phase. See full-run-ending.png and replay.json.
- Follow-up fixtures checked E1 portrait, E3 lift, E4 mirror, E6 carpet, C5 glass and C6 luggage. Normal and changed luggage framing was checked after the final camera render. The final suite decoration is captured in suite-threshold-final.png. The continuous run preceded these final framing, glass and prompt refinements; targeted checks cover the changed views.
- All 22 rule, timeline, music and movement tests pass. Syntax and asset checks pass: 20 matched gameplay cameras, 33 normal/variant plates, six locations, eleven inspections, plus two ending shots. Browser console error capture is empty.
- A populated corridor render check recorded median 7.2 ms and p95 18.6 ms over 60 GPU-completed frames, 773,784 triangles and 253 draw calls at a 1460 x 821 drawing buffer. This measures completed rendering, not a promise of whole-game 60 fps on other hardware. See render-benchmark.json.

## Source and regeneration

No new external assets or dependencies were downloaded. Existing character, font and music licences remain unchanged. The v8 source snapshot is retained in sources/archive/ui-gait-08. New editable environment source: build/assets/hotel-v9.blend; runtime camera contract: hotel-v9.json. The detailed guest stays guest-v8.glb.

From build/, run local Blender headlessly with tools/build_playthrough_v9.py, then tools/refine_luggage_view_v9.py and tools/refine_suite_binding_v9.py. The refinements reproduce the final luggage framing and rush figure. They use the retained v5 foundation and OptiX on this workstation. The runtime package excludes these scripts, Blender files and vault notes.

## Deployment

Published to [the existing private Room 0 URL](https://room-zero-ashy.vercel.app/). Deployment dpl_8Wxt6VJ1H5qZ5exUQXoAR6gEBiTB is READY under VihaanM/room-zero. The runtime package contains 83 files, approximately 35.15 MB, excluding vault notes, source Blender files and tools. Authenticated remote SHA-256 checks match index.html, main.js, style.css, passage-loop.js, character-encounters.js, guest-locomotion.js, hotel-v9.json, the final luggage plate and final suite plate. Evidence: tests/playthrough-09/hosted-hashes.json.

The Vercel connector confirms authentication remains enabled for all deployment URLs. An unsigned request returns HTTP 302 to authentication. Human feel, audio listening and formal coursework test cycles remain pending.

### Public access update

After this deployment, Vihaan explicitly requested removal of sign-in. Vercel Authentication was disabled for Room 0 on November 9. The stable game URL is now publicly accessible; the earlier protected-deployment verification above is historical.
