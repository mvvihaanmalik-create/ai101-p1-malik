
# T1 repair pass, build v14

November 10, 2026. Vihaan explicitly requested the three observed T1 fixes before proceeding to T2. This changes the planned repair timing; it does not retroactively complete Cycle 1 or constitute instructor approval of a different course sequence.

The original T1 video, result, locked four-test protocol, runtime ZIP and fixed v13 deployment remain unchanged. v14 work is separate repair verification. T2-T4 have not been run. For a full before/after comparison, remaining baseline tests can still use frozen v13 and the same four procedures can then run on v14. If a test instead runs on v14 first, label its build and missing baseline honestly.

Selected findings: unnatural hotel hands/fingers, fake dog, weak wall text. Decisions: ADR-006, ADR-007 and ADR-008. No additional gameplay scope is introduced. Implementation and developer verification are complete; visual acceptance and formal Cycle 2 remain pending.

## Live build

Production v14: https://room-zero-ashy.vercel.app/

Fixed v14 deployment: https://room-zero-b0a3c3w9d-vihaanmalik.vercel.app/ , deployment `dpl_9GTyWEQWNnv8Mb6HsJP5YsiFSiAP`. Public requests returned HTTP 200 and matched staged SHA256 hashes for main.js, hand-pose.js, character-encounters.js, hotel-v14.json, dog-v14.glb and the credits page. See hosted-verification.json and runtime-manifest.json. Only runtime files were deployed; vault notes, recordings, original downloads and Blender sources were excluded.

## Implemented and checked

- Hand posing: reset procedural arm corrections to the authored pose every frame; calibrate bend axes from the actual hand bones; orient palms around the glass; ease differentiated finger closure and release. A modest adjustment to server scale, receiver position and counter height makes the glass trajectory reachable. The seven-second cycle sweep samples every half second: maximum server target error 0 m, receiver error 0.002 m. These are sampled pose errors, not a claim of perfect continuous contact or human realism.
- Dog: replace live primitive dog with the textured, rigged CC BY 4.0 German Shepherd. Its seated shadow is posed from that rig using world-space control directions; normal shadow uses the same skinned head pose as the visible dog. Dog pose study verifies the distinct silhouettes. Ending integration was visually checked.
- Lettering: rerender 33 hotel plates with stronger serif letters and restrained contrast, improve live labels. All 20 camera transforms, six room definitions, inspection mapping and variant keys remain identical to v13. The prior plates are retained.
- Checks: 25 automated tests pass, including one-minute fixed-grip tests at 30/60/120 fps; JavaScript syntax passes; assets, rigs and all 33 referenced plates load. Browser review showed no game errors in the checked scenes. Close-up, hotel dog, ending cast and source render evidence are in this folder.
- Timing observation: the v14 bar review settled around 2.3 ms CPU render time; ending observation around 2 ms. These are isolated UI-reported samples, not a frame-rate guarantee or formal performance benchmark. GPU-heavy offline rendering during development made earlier live timings unsuitable for comparison.

## Limits and next test

No fresh full formal playthrough was claimed. T2-T4 and formal Cycle 2 comparisons are unrun. The first dog-shadow export was corrected after the neutral render revealed a crouch rather than a seated silhouette. A handoff reach sweep exposed unreachable targets; actor/counter staging was corrected before deployment. Vihaan's subjective acceptance of the new motion/readability remains pending. Test 2 is next; record whether it uses the preserved v13 baseline or repaired v14.

Hosted browser confirmation: opened the public v14 without sign-in, entered the hotel, inspected the ordinary dog, then left the normal public start page open. `hosted-dog-v14.png` records the deployed result. The live review diagnostics reported v14 and no game errors. The formal Test 1 recording and findings were not edited.
