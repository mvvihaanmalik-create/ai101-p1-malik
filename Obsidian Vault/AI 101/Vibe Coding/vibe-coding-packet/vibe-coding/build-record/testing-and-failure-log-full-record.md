# Testing and failure log

**Status:** Cycle 1 T1-T3 completed November 10, 2026: Vihaan observed live and supplied feedback; Codex operated and recorded at his request. T4 remains unrun. Earlier build-record checks remain developer verification.

**November 10 repair timing amendment:** Vihaan explicitly requested the three T1 repairs before T2. The repaired v14 is separate from frozen v13; original evidence remains unchanged. See [repair pass](tests/repairs-14/README.md). T4 is still unrun; do not present mixed-build runs as one unchanged baseline. The frozen v13 remains available to finish the baseline sequence if required.

**Current test order:** [Original protocol](formal-test-protocol.md) for T1–T3 on v13. At Vihaan's request, run [T4 on fixed v15](test-4-v15.md) with the same inputs/criteria. No v13 T4 recording exists. Save evidence before judging.

## Success criteria from prd.md

1. Normal continuation/anomaly return scores once per passage; wrong choices reset; four correct decisions unlock the suite and complete the chosen ending.
2. Fixed views and E inspections remain readable, preserve movement direction and hide the guest's face; pause/resume and replay work.
3. The butler gives a readable warning, retreat allows escape without a weapon, and contact causes exactly one reset to the landing.

## Session details

| Detail | Cycle 1 | Cycle 2 |
|---|---|---|
| Tester | Vihaan: live observer/feedback; Codex: controls and recording | [To record] |
| Date/time | November 10, 2026: approximately 00:15-00:25 (T1), 16:15-16:17 (T2), 16:21-16:23 (T3), America/New_York | [To record] |
| Build | v13, dpl_GdzBSACzQAqwRTPJHPAiH6wMSqrZ | [To record after repairs] |
| URL | https://room-zero-jrfr14ibh-vihaanmalik.vercel.app/ | [To record] |
| Browser/device/window | Windows desktop, Codex in-app browser; game panel capture 1020 x 854. Exact browser version not collected. | [To record; note differences] |
| Sound and capture method | Sound enabled, music 55%; FFmpeg cropped screen capture, H.264 1280 x 720 at 15 fps, no audio stream. | [To record] |

Baseline runtime and manifest: [formal-baseline-v13](tests/formal-baseline-v13/). Evidence folders: [Cycle 1](tests/formal-cycle-1/) and [Cycle 2](tests/formal-cycle-2/).

## Cycle 1 (Class 16 category, no repairs)

| Test | What I did | Expected | Actual | Evidence | Likely cause |
|---|---|---|---|---|---|
| T1 Main path | Followed T1 in one continuous normal run; 10 scored decisions, 3 wrong continuations; suite ending, pause/resume, W input lock and replay. | Four correct decisions unlock ending; inspections, pause/input lock and replay work. | Functional route completed. Vihaan found unnatural hands/fingers, fake-looking dog and weak wall text. Audio assessment unverified. | [Recording and actual result](tests/formal-cycle-1/T1-result.md), [timeline](tests/formal-cycle-1/T1-timeline.md) | Causes unconfirmed; arm posing/model fidelity/text contrast are candidates for later review. Missed changes also warrant readability review, with operator-method limits. |
| T2 Edge case | C1 approach/retreat earned 1/4; selected C1 again, allowed contact, waited and checked movement. About 8 s operator delay before retreat. | Escape earns one; contact resets once to 0/4; control returns. | Functional checks passed: one contact/reset, stable idle, movement restored. Vihaan requested more detail for players unfamiliar with the genre. | [Actual result and recording](tests/formal-cycle-1/T2-result.md), [timeline](tests/formal-cycle-1/T2-timeline.md) | Guidance may be too terse for newcomers; hypothesis, not a novice-test finding or a completed repair. |
| T3 Unexpected input | W+D for 3 s during service inspection; closed it; W for 3 s while paused; resumed idle; five rapid E taps; closed inspection and walked 2 s. | No hidden movement, stuck key, duplicate decision, crash or trapped inspection. | Functional checks passed. Position stayed fixed through inspection/pause/idle; final walk moved depth 6.86 to 9.06. Broad feedback: cast clutter, more stairs/floors, separated encounters, closer/slower anomaly presentation and stronger horror. | [Actual result, feedback and recording](tests/formal-cycle-1/T3-result.md), [timeline](tests/formal-cycle-1/T3-timeline.md) | No control failure observed. Spatial staging and encounter pacing are design concerns, not established causes of an input defect. |
| T4 Out-of-scope request | Follow T4: F/Space/click combat attempts, then movement/pause. [Actual deviations to record] | No combat; normal butler stays normal; supported controls work. | [Not run] | [Not captured] | [Assess after evidence] |

## Repair decisions between cycles

Vihaan selected all three T1 visual findings for repair on November 10, before T2. [ADR-006](../decisions/ADR-006-bounded-hotel-hand-poses.md): stable anatomical hand poses. [ADR-007](../decisions/ADR-007-textured-dog.md): freely licensed textured dog. [ADR-008](../decisions/ADR-008-readable-hotel-lettering.md): stronger environment lettering. Developer verification is recorded separately; no formal Cycle 2 mark yet.

## T1 findings compared with the v14 repair evidence

Prepared November 10, 2026 from saved evidence. Before: formal T1 on frozen v13, with Vihaan observing and Codex controlling/recording. After: focused developer checks on v14. These sessions used different procedures and capture conditions, so this is a repair comparison, not a completed formal Cycle 2.

| Finding from Vihaan in T1 | What changed in v14 | Saved evidence after repair | Supported conclusion | Still to establish |
|---|---|---|---|---|
| Hand/finger movement looked unnatural, fake and off-putting. | Restore authored poses before procedural corrections, bend fingers toward the palm, orient wrists around the glass and ease grip/release. Adjust server/receiver/counter staging so the handoff stays within reach. | [Grip close-up](tests/repairs-14/glass-grip-closeup.png), [anomalous grip](tests/repairs-14/glass-anomaly-closeup.png), [reach measurements](tests/repairs-14/handoff-reach-sweep.json), [automated results](tests/repairs-14/tests.txt), [ADR-006](../decisions/ADR-006-bounded-hotel-hand-poses.md). | The fixed-grip regression remains stable for one simulated minute at 30/60/120 fps. The sampled ordinary handoff has maximum server target error 0 m and receiver error 0.002 m. These establish mechanical stability and sampled reach, not perceived realism. | Vihaan's assessment of the motion during the matching main-path retest. No equivalent numerical v13 measurement exists, so no percentage improvement is claimed. |
| The dog looked extremely fake; use a free reusable model. | Replace the primitive sculpture with a textured, rigged German Shepherd by 3dskillup.art under CC BY 4.0. Preserve standing/mismatched-shadow behavior and ending integration. | [Pose study](tests/repairs-14/dog-pose-study.png), [live dog](tests/repairs-14/hosted-dog-v14.png), [ending cast](tests/repairs-14/ending-cast-v14.png), [asset checks](tests/repairs-14/asset-check.txt), [ADR-007](../decisions/ADR-007-textured-dog.md). | Replacement and integration are evidenced; the model has textured anatomy and a weighted rig. It is credited third-party artwork. | Whether the dog feels convincing in play, whether its changed shadow is readable, and Vihaan's acceptance of the replacement. |
| Wall text was unclear and too light. | Rerender the same 33 hotel plates using heavier serif lettering, adjusted size/spacing and stronger contrast; increase live prop-label resolution and weight. | [Lettering settings](tests/repairs-14/signage.json), [render log](tests/repairs-14/signage-render-resume.log), [repair report](tests/repairs-14/README.md), [ADR-008](../decisions/ADR-008-readable-hotel-lettering.md). | The heavier lettering is implemented across the hotel plates and deployed. This demonstrates the change, rather than a measured reading-performance improvement. | Readability at the same window size and viewing distance during the matching retest, with Vihaan's feedback. |

### Other T1 results and comparison limits

- The v13 main path reached the suite, completed the reception ending, paused/resumed, resisted movement during the ending and restarted successfully. The attempt included ten scored choices and three incorrect continuations. Those mistakes are recorded player/operator outcomes, not proof of a scoring bug.
- The v14 repair pass has 25 passing automated checks and targeted visual checks. It has not repeated the full formal T1 procedure. The suite-to-replay result therefore cannot yet be marked unchanged or improved between cycles.
- T1's recording has no audio stream and was encoded at 15 fps. Neither sound quality nor a before/after frame-rate improvement can be established from that recording. Isolated v14 timing samples do not resolve this.
- No new player opinions, test scores, friend participation or formal retest outcomes have been inferred. The friends named in the plan are intended players, not recorded testers.

## Broader feedback from T3

At Vihaan's request, feedback was opened beyond the control checks. He found the cast too crowded and requested more separated encounters, an ascent over multiple floors, anomalies divided between staircase and longer hallway shots, more variety/horror, closer framing and more time with anomalies. He proposed children using another child's head as the ball. See the original response and organized findings in [T3-result.md](tests/formal-cycle-1/T3-result.md).

Vihaan subsequently requested execution before T4. v15 implements a numbered ascent, two routes, separated encounters and close-up timing; see [repair evidence](tests/repairs-15/README.md), [guidance decision](../decisions/ADR-009-night-register.md) and [staging decision](../decisions/ADR-010-separate-the-ascent.md). These are implemented changes. Human judgments about clarity, crowding and horror remain open.

## Cycle 2 (Class 18 category, same tests)

| Test | Cycle 1 | Cycle 2 | Mark | Evidence and ADR |
|---|---|---|---|---|
| T1 Main path | Completed; route/ending/replay observed, with three visual findings | [November 12 playtest and revisions through v35](tests/formal-cycle-2/T1-result.md). Hands still overlapped in the bar. | Inconclusive overall | [T1 baseline result](tests/formal-cycle-1/T1-result.md); [v14 repair evidence](tests/repairs-14/README.md); ADR-006/007/008 |
| T2 | Retreat earned 1/4 and contact reset the score once. | I reviewed character movement and the reception ending through v36. | Inconclusive for retreat/reset. | [Cycle 1](tests/formal-cycle-1/T2-result.md) · [Cycle 2 findings and recordings](tests/formal-cycle-2/T2-result.md) |
| T3 Unexpected input | Control checks passed; broad spatial/pacing/horror feedback recorded. | [Not run] | Pending matching retest | [T3 baseline and open feedback](tests/formal-cycle-1/T3-result.md); [v15 staging repair](../decisions/ADR-010-separate-the-ascent.md); no formal retest |
| T4 Out-of-scope request | Pending on v15; no frozen-v13 observation | [Not run] | No v13 before/after pair | [v15 test card](test-4-v15.md) |

Use improved, unchanged, worse or inconclusive after comparing actual evidence. Record changes in random encounters or testing conditions that limit the comparison.

## What the two cycles proved

The two formal cycles are not complete. T1–T3 have reproducible v13 evidence. T4 will be the first formal observation of the no-combat boundary on v15. Developer checks do not establish improved enjoyment, eeriness or beginner comprehension. Keep both build identities and route differences visible in any comparison.
