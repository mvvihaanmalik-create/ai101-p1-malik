# What I learned from testing
I watched and gave feedback while Codex played and recorded. Tests 1–3 used v13; the completed Test 4 used v16.

| Test | What happened | What I noticed or wanted | What changed |
| --- | --- | --- | --- |
| [1 · Reach the suite](tests/formal-cycle-1/T1-result.md) | The suite, ending, pause and replay worked. | The hands looked unnatural, the dog looked fake and the wall text needed more weight. | v14 repaired the poses, replaced the dog and strengthened the lettering. |
| [2 · Escape the butler](tests/formal-cycle-1/T2-result.md) | Retreat earned one point. Contact reset it once. | I wanted a clearer explanation for someone new to this kind of game. | v15 added the register and clearer retreat/reset messages. |
| [3 · Unexpected inputs](tests/formal-cycle-1/T3-result.md) | Inspection, pause and rapid E inputs worked. | I wanted fewer people in each scene, multiple floors, longer halls and closer, slower horror. | v15 distributed encounters and added close-ups and the porcelain plaything. |
| [4 · Try to attack](tests/formal-cycle-1/T4-result.md) | The ordinary butler stayed calm; movement and pause worked. | I wanted a short character animation to explain more of the story. | v17 added the welcome and porter’s case recognition. |

## Cycle 2

| Formal slot | What happened | Comparison |
| --- | --- | --- |
| [1 · Reach the suite](tests/formal-cycle-2/T1-result.md) | Recorded my main-path and ending feedback. The hand overlap persisted. I requested faster walking, clearer clues and a shorter finale. | Inconclusive across the whole route |
| [2 · Escape the butler](tests/formal-cycle-2/T2-result.md) | Recorded a character and ending review. The original retreat, contact and reset procedure was not repeated. | Inconclusive |
| [3 · Unexpected inputs](tests/formal-cycle-2/T3-result.md) | Two graphics failures interrupted the attempt. I noted grip, porter, puzzle, mirror, bell and desk issues. No usable recording was saved. | Inconclusive, rerun pending |
| [4 · Try to attack](tests/formal-cycle-2/T4-proposal.md) | I proposed empty-hotel exploration. Codex built and checked it. The original out-of-scope input test is still due. | Pending |

## Developer verification

- **Opening and graphics.** Checked the full car-to-reception sequence, pause and skip. Fixed arm motion, grip and first-use rendering stalls. [v40 check](file:///C:/Users/91982/Videos/Hotel%20of%20Horror%20Archive/build-record/tests/opening-40/README.md)
- **Exploration.** Walked four storeys and back outside. Confirmed movement returned after a simulated graphics reset. [Route and limits](../hotel-exploration-plan.md)
- **Final story.** Checked 200 shuffled routes and all twelve inspection views. The full demo reached the suite, reveal and credits. [v43 evidence](tests/visual-43/README.md) · [Recording checkpoints](walkthrough-tv-master/walkthrough-checkpoints.json)

The developer checks verify the build. The formal [rerun plan](tests/formal-cycle-2/README.md) records the unfinished player tests.
