# Room 0 formal test protocol

**Test-build amendment, November 10:** T1–T3 ran on the frozen v13 below. Vihaan requested the repaired build for the next test. For T4 use the [v15 test card and fixed review URL](test-4-v15.md). The original T4 inputs and expected boundary stay the same. The original protocol is retained below as written; v13 has no formal T4 observation.

Prepared November 10, 2026. Status: ready for Vihaan to run; no results recorded.

Use these exact four procedures in both cycles. Cycle 1 tests the frozen v13 baseline. After all four Cycle 1 evidence files and observations are saved, select one to three observed failures and agree repairs. Record each Cycle 2 repair in an ADR naming the observed failure, then repeat these procedures on the repaired build. Do not repair the game during Cycle 1. Preserve the original failed evidence if you retry.

Reference: [course overview supplied by Vihaan](../sources/project-brief/vibe-coding-overview-2026-11-10.png). The overview confirms four tests, evidence saved before judgment, one to three selected failures for revision, an ADR for each change, and rerunning the same four tests. The course emphasizes the student's decisions and their evidence.

## Before starting

1. Use a desktop/laptop, keyboard and a current browser. Keep the same browser, window size, sound setting and input device for Cycle 2 where possible. Record differences.
2. Open the fixed Cycle 1 build: https://room-zero-jrfr14ibh-vihaanmalik.vercel.app/ . Avoid the changing main alias for the baseline.
3. Record tester name, date, browser/device, window size if known, sound on/off and the build URL in testing-and-failure-log.md. Do not record unrelated personal data.
4. Start a screen recording of the game window, with game audio if available. Screen recordings are preferred because motion, freezes and duplicate transitions cannot be established by a single still image. If recording is unavailable, save before/after screenshots and describe the intervening actions explicitly.
5. Save evidence to build-record/tests/formal-cycle-1/. Names: T1-main-path, T2-edge-case, T3-unexpected-input, T4-out-of-scope. Use the matching formal-cycle-2 folder later. Extensions depend on your capture tool. Do not crop away progress, relevant prompts or the result.
6. Run each test once. If stuck, save what happened and report the test as incomplete; do not keep retrying until it passes. Save evidence before interpreting it. Keep factual observation separate from a suspected cause.

Tests 2-4 use the existing review page to reproduce controlled conditions: https://room-zero-jrfr14ibh-vihaanmalik.vercel.app/?review=1 . Its overlays are deliberate test controls. Selecting an encounter pauses the game; click Resume afterward. Never use a fixture in Test 1. For Cycle 2, use that cycle's recorded build URL and the same /?review=1 suffix for Tests 2-4. No new test code or gameplay changes were added to prepare this protocol.

## T1: Main path, observation to ending and replay

**Start:** Fresh normal URL, then Enter the hotel. Use a reload if an old run is already open.

**Actions:**
1. Walk forward from reception and use E at the far door. At the landing, walk through the red door to the right of the broken lift.
2. Explore the ordinary first passage. Use E to inspect room service, the children, the glass handoff and the luggage mirror, then E to return each time. Continue to the far end to complete orientation.
3. On each scored floor, compare it with the ordinary floor. If something changed, return through the entrance; if nothing changed, continue to the far end. Observe progress after each decision. Play toward four consecutive correct decisions. If you make a wrong choice, record what you thought was wrong and whether progress resets, then continue the same run. A player's incorrect decision alone is not a software defect.
4. After 4/4, walk up the unlocked stairs, approach the suite and press E at its door.
5. During the reception reveal, press Escape, wait five seconds, then Resume. Try W while the reveal continues. Let the ending finish, then click Begin again.

**Expected:** Orientation is unscored. Correct choices add one; incorrect choices reset progress. The final stairs open after four consecutive correct decisions. Inspections return control, camera cuts preserve movement direction, and the player's face stays concealed. The hostile reception ending plays; pause freezes it and its music; W cannot interrupt it. Begin again returns to reception at zero with a new ordinary orientation.

**Evidence:** One recording from entry through replay, or clearly labelled sequential clips. Include the four progress decisions, suite opening, pause/resume and replay. Note any visible arm twisting, mirror stutter, confusing clue or sudden camera jump with a timestamp. Also record one plain-language impression of how eerie/enjoyable it felt; this is a subjective observation, not an invented score.

**Randomness:** The draw order may differ in Cycle 2. Repeat the same observation/decision procedure, not a remembered route. If different encounters make a comparison uncertain, mark that aspect inconclusive rather than attributing it to a repair.

## T2: Edge case, escape and contact with one earned point

**Start:** Fresh review URL. Enter the hotel. In Review encounter select C1 · The butler, then Resume.

**Actions:**
1. Walk forward until the anomalous bell/warning is apparent. Return immediately with S, all the way through the corridor entrance. Check that progress becomes 1/4.
2. Select C1 · The butler again and Resume. This fixture keeps the earned point.
3. This time walk toward the butler and allow contact. After the blackout, release movement and wait for the landing to settle. Do not press another control for five seconds.
4. Walk toward the red door again to check that control has returned.

**Expected:** Retreat escapes without a weapon and earns one point. Contact produces one blackout/reset, returns the player to the landing at 0/4 and does not repeat while standing still. Movement works afterward. If the first escape fails, preserve that failure and report the later one-point contact check as not reached; do not substitute a different setup mid-test.

**Evidence:** Record the entire escape/contact sequence. At minimum capture 1/4 before contact and 0/4 after settling, plus a note of whether reset happened once or repeatedly.

## T3: Unexpected input, movement during inspection and pause

**Start:** Fresh review URL. Enter the hotel. Select Restart orientation in Review encounter, then Resume. Walk through the red door into the ordinary corridor. Walk toward the first room-service trolley until the E inspection prompt appears, then E to inspect.

**Actions:**
1. While inspecting, hold W and D together for three seconds, then release both. Press E once to close the inspection.
2. Press Escape to pause. Hold W for three seconds, release it while paused, then click Resume. Observe the player for two seconds without touching any keys.
3. Tap E five times quickly. Stop, observe the resulting view, and close an inspection with one E if needed. Walk forward for two seconds, then stop.

**Expected:** Movement does not shift the hidden player during inspection or advance a decision. Pause blocks movement. Releasing W during pause prevents movement from sticking on resume. Rapid E remains responsive without a crash, trapped inspection or duplicate transition. Walking still works afterward. The orientation stays unscored.

**Evidence:** Record the full sequence including the two idle seconds after resume. If screenshots are used, show the same position before and after inspection/pause and state exactly what movement occurred.

## T4: Out-of-scope request, attempt combat

**Start:** Fresh review URL. Enter the hotel. Select Normal · The butler in Review encounter, then Resume. Walk until the normal butler is clearly in view; stop before the far decision line.

**Actions:**
1. Try to attack by holding F for three seconds, pressing Space three times, and clicking the butler three times.
2. Observe whether any weapon, attack or combat prompt appears. Walk backward for two seconds and pause with Escape to confirm supported controls still work.

**Expected:** The current no-combat boundary holds: no weapon, attack, damage or combat progress is produced. Unsupported inputs do not break the game or prevent normal movement/pause. The ordinary butler does not become hostile merely because F/Space/click were used. An unchanged screen after unsupported input is expected; misleading prompts or a crash are failures worth recording. This is the packet's out-of-scope category adapted to a game without a text-request interface.

**Evidence:** Record the attack attempts and the successful movement/pause afterward. State what you tried and whether the boundary was clear to you.

## Report each result

Use this short reply format after saving the evidence:

- Test: T1 / T2 / T3 / T4
- What actually happened, in order:
- Evidence filename(s) and relevant timestamp(s):
- Anything confusing, awkward, laggy or insufficiently eerie:
- Suspected cause, if any (optional):

We will transcribe these observations into the vault and link the saved evidence. A plausible cause is a hypothesis until checked. If evidence is not available, label it reported-only; do not invent a file or mark an unsupported pass. Cycle 2 uses improved / unchanged / worse / inconclusive, justified against the saved Cycle 1 result.
