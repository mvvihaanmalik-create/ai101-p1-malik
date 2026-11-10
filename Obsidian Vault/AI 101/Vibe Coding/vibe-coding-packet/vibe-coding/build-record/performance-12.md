# Mirror performance and full run 12

November 9, 2026. Vihaan requested mirror performance checks, fixes for lag, a full playthrough, continued polish and vault/live updates.

## Changes

The reflection target is 384 x 384 instead of 512 x 512, with multisampling disabled. Reflection refreshes are bounded at 30 Hz nearby and 10 Hz when the fixed camera is more than eight metres away. Camera/projection changes and a new passage invalidate the cached image immediately. Unchanged paused frames reuse the reflection. The render hook caches depth-only mesh references and reuses its background color instead of traversing the scene and allocating a color every refresh.

Rain lines and dust points were visible in the mirror without their baked window/background, producing bright fragments over the reflected guest. These plate-dependent overlays are now excluded from the reflection pass and restored afterward. Actual character geometry is still reflected. The benchmark explicitly forces fresh reflection rendering on every measured frame, so caching cannot manufacture a low result.

## Measurements and limits

Evidence in tests/performance-12. All GPU-completed measurements use 60 samples at a 1536 x 864 drawing buffer. Baseline v11: close-up median 6.0 ms / p95 7.5 ms; corridor 7.2 / 9.8. Initial v12: close-up 3.4 / 6.6; corridor 7.1 / 10.2. A later all-cast normal close-up fixture measured 9.7 / 16.4, so these short samples do not establish a reliable percentage improvement. The final changed close-up after normal gameplay culling measured .9 / 2.0 but is a smaller workload and must not be compared directly to the all-cast fixture. Steady-state normal view result is saved separately.

The concrete savings are fewer reflection refreshes, a smaller target, no reflection MSAA and no per-refresh scene traversal. Main-loop samples during the continuous run generally showed 16.7 ms frame intervals; the embedded browser also recorded scheduling stalls. GPU render time is not whole-game frame time, and this is not a guarantee of 60 fps on other hardware.

## Complete input-driven playthrough

Seed 3434217128. After benchmark fixtures, reloaded and started a fresh run. No room/encounter fixtures or teleports were used during this run. Played reception, landing, ordinary orientation with room-service/children/mirror inspections, then E2 rain return, C2 knocking-cloche return, C5 glass return and ordinary continuation. Progress reached four, opening final stairs and the suite. Zero contacts. Camera cuts, lateral movement, backward travel and inspection return worked. The same input basis was retained across shots.

Opened the suite with E. The hostile reception ending reached its 26-second held conclusion. Paused at 12.77 seconds during the skeleton reveal; a later sample remained at 12.77 with music paused. Resume completed the ending while W was held without moving the player out of it. Begin again returned to reception, ordinary orientation, zero progress/contacts and zero locomotion phase. See full-run.json, pause.json and replay.json.

The full run preceded the final removal of reflected rain/dust. Targeted mirror checks cover that visual-only change. This is agent-driven developer verification, not a human coursework test. Subjective listening and user acceptance remain separate.

## Checks and source

22 tests and syntax checks pass. No new assets or dependencies. Prior source preserved in sources/archive/atmosphere-11. Four-choice rules, threat balance and ending story are unchanged.

Steady-state normal mirror: 1.9 ms median / 2.9 ms p95 with forced fresh reflection renders, after gameplay culling (a smaller workload than the all-cast fixture).

Deployment dpl_BLTutBxY669H3pZK2HUwTWSsYXpm is READY at https://room-zero-ashy.vercel.app/. Anonymous downloads of main.js, character-encounters.js and benchmark.js match local SHA-256 hashes. Public access retained.
