# Room 0: gameplay proposal

**Current override, November 9 (v11):** Vihaan approved removing the crucifix. Retreat is the defense; contact still resets progress. C2 now knocks beneath a closed cloche, C3 removes one child while the ball returns, and C6 separates the guest from his reflection. This supersedes the historical defense and encounter descriptions below. [Implementation and evidence](build-record/atmosphere-11.md).

## Current build update: November 9, v9

Vihaan requested a stronger Exit 8 observation loop while retaining the Twin Peaks aesthetic, plus restrained Hokum influence and a full polish playthrough. The implemented ordinary floor now keeps the whole cast in fixed places. Random draws change one cue; turning back scores at the corridor entrance, and four correct decisions open the final stairs. Movement directions remain consistent through camera cuts. Suite bindings, candles, salt and a knocking cue add folk horror. [Implementation and full playthrough evidence](build-record/playthrough-09.md). This current update supersedes older implementation-status paragraphs below; it does not claim Vihaan has reviewed the new build or completed coursework testing.

**Status:** Vihaan approved the gameplay loop on November 5, 2026. The exact controls, anomaly pool, cooldown duration, visual details, route feasibility, and story ending remain open.

## A complete run

The lift is broken. The guest approaches the honeymoon suite via a repeating hotel landing and stairway. Each passage is either normal or contains one anomaly. The player examines it, then chooses to continue upward or turn back.

- If the passage is normal, continuing earns one step toward the suite; turning back loses the current run's progress.
- If an anomaly is present, turning back earns one step; continuing loses the current run's progress.
- Reach four correct steps, then enter the honeymoon suite for a short ending. The suite's reveal and story are not yet written.
- A wrong choice returns the progress counter to zero, keeping the player in the game.

## Anomalies and defense

Encounters are selected in a randomized order from a pool, with normal passages mixed in. Possible examples: rain falling upward outside a landing window; a portrait looking in a new direction; a hallway sign changing; a figure appearing at the end of the landing. Exact number and behavior remain open.

Vihaan also suggested possible encounters: a weird, scary butler approaching the player, inspired by the butler in Twin Peaks; creepy room service; children playing and looking for their ball; an abandoned dog; a server and bartender; and a person with luggage. These are ideas for the pool; which are anomalies or approaching threats, and how each behaves, remains open.

See [room-zero-encounters.md](room-zero-encounters.md) for a proposed normal baseline and a suggested classification, cue, and response for each character. These additions are awaiting Vihaan's review.

Most anomalies are observation puzzles: notice the difference and turn back. Occasionally a visible threat approaches. Hold up a holy item to repel it briefly and gain time to turn back. The item has a short cooldown; its duration is open. Stabbing and shooting were earlier alternatives, not selected for this loop.

## Presentation and route

Proposed route: reuse one landing and a short staircase, changing views at predefined points. If stairs prove too difficult, reuse a corridor instead. The guest's face stays hidden; selected views show the shirt, tie, and blazer. Exact visual treatment, controls, and camera changes need Vihaan's decision.

## Checks to refine after remaining decisions

1. A normal passage and an anomaly passage each respond correctly to continue and turn-back choices.
2. A player can repel an approaching threat using the chosen defense and then turn back; its cooldown behaves as specified.
3. Four correct steps lead to the suite and its ending; an incorrect choice has the selected consequence.

These are planned acceptance checks, not a record of tests already run. Randomization should also be checked so both normal and anomalous passages can occur, and the effects should be checked across the agreed camera views.
