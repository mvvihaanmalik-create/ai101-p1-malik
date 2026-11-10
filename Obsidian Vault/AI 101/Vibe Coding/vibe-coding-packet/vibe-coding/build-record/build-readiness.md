# Room 0: before the first build

**Current status, November 9:** The crucifix was removed in v11 at Vihaan's direction. Retreat is the defense; contact resets progress. Full v12 playthrough is complete. Older item/unfinished-build descriptions below are historical. See [documentation audit](documentation-audit-13.md).

Reviewed November 5 and updated through November 8, 2026 against the packet and current planning documents.

## Recorded decisions

- Room 0 is the selected game; reaching the haunted honeymoon suite is the goal.
- The lift is broken. Stairs are preferred; halls are an allowed feasibility fallback.
- Continue through normal passages and turn back from anomalies. Four correct decisions reach the suite; a wrong choice resets progress.
- Randomized encounters include normal passages and anomalies. A holy item briefly repels an approaching threat and has a cooldown.
- Changing views are inspired by the first Resident Evil; the guest's face stays hidden and clothing includes a shirt, tie, and blazer.
- Visual Study 02 is the approved visual direction.
- On November 6, Vihaan approved the landing/corridor/stairs route, three fixed views and object close-ups, and desktop WASD/arrows, E, F and Escape controls.

## Decisions to finish the build brief

1. **Route and player control:** Approved November 6 in room-zero-route-and-controls.md. Exact dimensions, camera placement and movement feel will be checked during prototyping.
2. **Encounters and fairness:** Vihaan approved the normal/anomalous character split, twelve-anomaly direction and butler as the first active threat on November 6. See room-zero-encounter-pool-v2.md. Exact staging and numerical encounter frequency need tuning.
3. **Defense and contact:** Vihaan approved the brass crucifix and contact causing a progress reset on November 8; see room-zero-defense-draft.md. Gesture, repulsion and cooldown durations have initial tuning defaults for prototyping.
4. **Story and finish:** Vihaan liked the family-hotel setup and chose the hostile reception ending on November 8; see room-zero-story-draft.md and ADR-004. The repeated greeting and reception reveal are implemented in build 06. Integrate the letter/fixed progress clues and review the pacing with a human player.
5. **Build approach:** Approved November 8: pre-rendered Blender hotel views with real-time Three.js characters, matching cameras and occlusion. Vihaan authorized the first corridor/guest/butler visual prototype. See ADR-005-hybrid-rendering.md. The browser build uses local HTTP, not file:// loading.

Minor tuning inside the chosen approach can be handled during implementation. The first local corridor/guest/butler visual proof was built on November 8; see [visual-prototype-01.md](visual-prototype-01.md) and [the technical approach](../room-zero-technical-approach.md). This is not the completed game, formal test cycles or Vihaan's visual acceptance.

## Coursework documents to complete

**Current ending 06 update, November 8:** The hostile reception reveal is implemented: repeated greeting, blur/darkness, glowing butler skeleton, surrounding C2-C6 cast, terminal image and replay. Thirteen rule/timeline tests, asset checks and browser ending/pause/restart checks passed. The letter and fixed progress clues, human visual/audio review and formal coursework tests remain pending. [V6 evidence](ending-06.md).

**Historical encounters 05 update, November 8:** All twelve approved anomalies and ordinary versions are implemented; eight detail shots bring the total to 17 cameras. Browser checks cover all pairs, normal/return scoring, four-choice suite access and wrong-choice reset. The hostile reception ending, Vihaan's visual acceptance and human coursework test cycles remain pending. [V5 evidence](encounters-05.md).

**Historical loop 04 update, November 8:** Vihaan requested the next build after v3. Unscored orientation, randomized C1/E2/E6, turn-back/continue threshold scoring, four correct decisions, wrong/contact resets and suite access are now implemented and checked. The remaining nine encounters and hostile reception reveal are pending. See [v4 evidence](anomaly-loop-04.md). This supersedes v3's unbuilt-loop status below and does not complete human coursework testing.

**Prototype 03 update, November 8:** Performance scheduling and rendering cost were addressed, walking was tied to travel distance, the butler and noir palette were refined, and six connected hotel locations now have nine closer shots. The route is traversable to the suite threshold; the randomized anomaly game and final reveal are still unbuilt. See [v3 evidence](visual-prototype-03.md). These are agent engineering checks, not formal coursework test cycles or final visual acceptance.

**Art pass 02 update, November 8:** Vihaan rejected the blocky first characters and requested detailed rigged replacements and better lighting. The current local build now uses adapted CC0 MakeHuman characters and revised hotel plates. See [art pass 02](visual-prototype-02.md) and [asset sources](../sources/room-zero-character-assets.md). The new visual result still awaits his review. This does not complete formal coursework test cycles.

- plan.md: one named real user, a boundary, and a rejected idea with Vihaan's reason. Reduce the plan to its required five lines; keep earlier ideas in their separate notes.
- prd.md: resolve the chosen route, controls, encounter and finish details; finalize three observable Done when checks and the out-of-scope list.
- ADRs: camera, aesthetic and gameplay records exist; record the chosen build approach when decided.
- sources/source-index.md: record the source and permission for actual assets used. The moodboard's generation is logged.

Later coursework tasks include the build, four Cycle 1 tests with screenshots before judging, evidence-based changes and the same tests in Cycle 2, README, disclosure, reflection and defense. These are not completed by choosing the visual direction.
