# Room 0: defense and threat contact

**Current status, November 9:** The crucifix was removed in v11 at Vihaan's direction. Retreat is the defense; contact resets progress. Full v12 playthrough is complete. Older item/unfinished-build descriptions below are historical. See [documentation audit](build-record/documentation-audit-13.md).

**Status:** Vihaan approved the tarnished brass crucifix and threat-contact progress reset on November 8, 2026. Numerical values are initial tuning defaults, not tested balance.

## Approved item and action

A small tarnished brass crucifix, matching the hotel's brass palette. Press F to raise it briefly; the butler recoils so the guest can retreat. A restrained warm highlight and a sharp metallic/air sound are proposed feedback. The detailed design and story relevance remain open.

Initial tuning: the gesture lasts 1 second, the butler stays repelled for 3 seconds, and the item recharges after 5 seconds. Raising it does not require precise crosshair aiming; it applies to the visible approaching butler on the current passage within a readable, limited range. Set the range against the actual corridor dimensions. It does not auto-solve the observation puzzle or submit turn back.

## Approved contact consequence

If the butler reaches the guest, briefly interrupt the scene with a sound and dark transition, reset progress to zero, and return to the landing. This uses the existing progress-reset penalty rather than adding a separate health system.

## Fairness requirements for the draft

- Explain F and the cooldown before the first threatening encounter.
- Show the floating bell cue before the butler approaches; do not punish the player for merely seeing the normal butler.
- Return the player to the main view before a threat can approach during a close-up, with time to react.
- Pause suspends the threat and cooldown. Provide both visual and audio feedback for item readiness and successful repulsion.
- Initial staging must allow a readable encounter and retreat; tune distance, approach speed and repulsion duration together.

## Planned checks

F repels the active butler, another use during cooldown does not retrigger, readiness returns at the selected time, and successful repulsion leaves the turn-back choice to the player. Verify a contact causes exactly one reset. At the planning stage, no tests had been run; see the implementation update below for subsequent checks.


## Implementation check, November 8: loop 04

C1 alone pursues. The warning bell is visible before a 2.5-second approach delay; F can repel him during that delay if already in range. Runtime range is 4.2 m; repulsion lasts 3 s and cooldown 5 s. A browser check verified one cast despite repeated F and unchanged movement, pursuit, repulsion and cooldown while paused. A separate contact check started at 1/4, recorded exactly one contact, and returned to the landing at 0/4. The choice remains the player's responsibility: evading him and continuing incorrectly resets progress. See the v4 evidence report. Timing remains subject to human playtesting.

## Encounters 05 update

The full cast is now present, but C1 remains the only pursuing/contact threat. C2-C6 and E1-E6 are observation anomalies. Inspection is refused for the entire C1 passage, including its warning, so close-ups cannot freeze or conceal an advancing threat. Pause remains available. The browser fixture verified C1 stays in the main camera with `detail: null`; the v4 crucifix and contact checks remain the regression baseline.
