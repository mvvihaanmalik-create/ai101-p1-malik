# Room 0: encounter pool, revision 2

**v15 supersedes the staging below.** Stair: children, dog, coat. Gallery: butler, trolley, glass handoff, traveller, portrait, rain, mirror, runner. Shared landing: lift. The two children roll a red ball normally; in the changed scene it is a porcelain likeness of a third child. The player can study either at the same distance. [Route decision](decisions/ADR-010-separate-the-ascent.md).

**Current override, November 9 (v11):** Vihaan approved removing the crucifix. Retreat is the defense; contact still resets progress. C2 now knocks beneath a closed cloche, C3 removes one child while the ball returns, and C6 separates the guest from his reflection. This supersedes the historical defense and encounter descriptions below. [Implementation and evidence](build-record/atmosphere-11.md).

**Status:** Vihaan approved the encounter split and twelve-anomaly direction on November 6, 2026: normal and anomalous character variants, with the butler as the first active threat. Numeric encounter frequency remains an initial tuning proposal.

## What counts as wrong

The previous proposal treated any character appearing as an anomaly. This revision lets hotel occupants behave normally too, so players look for impossible behavior or a changed detail. Eerie faces and dim lighting alone do not count as anomalies.

Architecture, landmarks and navigation remain consistent. A character vignette can have a normal or anomalous version; the rest of the passage remains normal. The design does not require all characters to be present at once. The orientation passage introduces the navigation and observation rules without scoring progress.

## Character variants

| ID | Character | Normal version: continue | Anomalous version: turn back | Role |
|---|---|---|---|---|
| C1 | Butler | Stands aside, tips his head and rings a hand-held bell normally. | The bell floats beside his still hand and rings; he begins an unnaturally smooth approach. | Active threat: holy item repels him so the player can retreat. |
| C2 | Room service | Attendant waits beside a trolley with a closed silver cloche. | The cloche floats visibly above the tray. | Observation anomaly; does not pursue. |
| C3 | Children and ball | Children search for their ball; it rolls or bounces normally. | Their red ball stops suspended in midair while they watch it. | Observation anomaly; does not pursue. |
| C4 | Abandoned dog | Dog waits beside a suitcase, its shadow following its movement. | The dog stands while its shadow remains seated. | Observation anomaly; does not attack. |
| C5 | Server and bartender | One hands over a glass at the service alcove. | The released glass moves visibly back up into the server's hand without anyone touching it. | Observation anomaly; does not pursue. |
| C6 | Guest with luggage | Guest holds the handle and waits with the suitcase on the floor. | The suitcase follows the guest at a visible gap from the hand, with no contact. | Observation anomaly; does not pursue. |

The formal costumes and uncanny appearance follow Visual Study 02. Each anomaly needs a clear visual cue visible on the inspection route. Cues remain observable until the player chooses; none depends solely on sound or a single fast animation. C1 signals before approaching. Threat contact behavior and holy-item timing still need a decision.

## Environmental variants

| ID | Normal detail | Anomaly | Response |
|---|---|---|---|
| E1 | Framed portrait looks sideways. | Portrait faces the viewer and a human-shaped shadow falls outside its frame. | Turn back. |
| E2 | Rain runs downward on the window. | Rain runs upward. | Turn back. |
| E3 | Lift doors are closed and marked out of order. | A narrow gap reveals a wall of wallpaper continuing inside the lift. | Turn back. |
| E4 | Corridor mirror shows the hallway. | A second stair flight appears in the reflection, with no counterpart in the space. | Turn back. |
| E5 | Coat hangs naturally on a stand. | Coat hangs horizontally as if someone invisible were pulling it. | Turn back. |
| E6 | Carpet runner lies flat. | A section of carpet visibly rises and falls in a slow breathing cycle. | Turn back. |

These twelve ideas form the initial encounter pool. Mirror and shadow effects may need a different treatment depending on the rendering approach, while preserving the selected visual cues.

## Proposed randomization

- After the unscored orientation, each passage has an equal chance of being normal or anomalous. Random order is independent of the four-step progress count.
- One anomaly variant is active per anomalous passage. A butler threat is itself one anomaly; do not simultaneously add an unrelated environmental puzzle.
- Draw anomaly variants without repetition until the pool has been exhausted. Keep that draw history across progress resets; restarting the game can reset it.
- Normal character variants may appear on normal passages; their presence alone never marks the answer.
- Introduce the holy-item controls before allowing the first butler threat. Do not depend on a random threat to teach the controls.

## Planned checks

- Each character's normal and changed variant leads to the expected continue/turn-back result.
- All anomaly cues are inspectable before a choice threshold, including from the approved camera views.
- A normal butler is distinguishable from the threat version before the approach creates urgency.
- Random selection respects one anomaly per passage and the no-repeat rule while preserving the approved progress/reset rules.

At the planning stage, no tests had been run; see the implementation update below for subsequent checks. The pool and role split are approved; exact staging, assets, animation, threat timing and encounter frequency remain to be implemented and checked.


## Playable implementation, November 8: loop 04

C1, E2 and E6 now have live normal/anomalous variants. Normal butler: stands at the side, bell attached below his hand, no pursuit. C1: levitating bell followed by a 2.5-second warning delay before pursuit. E2: only the middle corridor window's live rain moves upward; other windows continue downward. E6: the central runner rises and falls, with player elevation following the surface. Cues persist until the decision.

The implemented draw probability is 50/50, independent of progress. The three-item shuffled bag does not repeat until exhausted and avoids immediate repeats at the bag boundary. Draw history persists through wrong-choice and contact resets. New game creates a fresh seed. These are initial tuning defaults, not a human-tested difficulty claim.

C2-C6, E1, E3-E5 remain approved concepts, not shipped assets. The initial pool is deliberately limited to the current rigged characters and three readable, testable cues. The ordinary orientation shows all three normal landmarks. See [loop 04 evidence](build-record/anomaly-loop-04.md).

## Current implementation, November 8: encounters 05

This supersedes the three-item v4 status above. All C1-C6 and E1-E6 variants are implemented. Every character vignette has an ordinary version, and every environmental change has a normal landmark. One vignette appears per passage. The twelve-item bag retains the 50/50 draw probability, no-repeat exhaustion and history across progress resets.

C2 has a closed or levitating cloche; C3 a moving or suspended ball; C4 a matching standing or impossible seated shadow; C5 a physical handoff or unaided rising glass; C6 a held or detached following suitcase. E1 switches profile portrait to frontal portrait plus escaped silhouette; E3 opens the lift onto wallpaper; E4 inserts stairs in the mirror; E5 pulls the empty coat horizontal. C1/E2/E6 retain their earlier implementations. E6 uses the ordinary side-standing butler to keep other actors off the breathing surface.

Nine rules tests and 24 browser fixtures passed. A mixed route using E3, ordinary C3, C4 and ordinary C5 reached the suite. Continuing through C2 reset progress to zero. The fixtures select encounters for reproducible checks; this is not a new natural-random playtest or human difficulty assessment. [Implementation, screenshots and limits](build-record/encounters-05.md).
