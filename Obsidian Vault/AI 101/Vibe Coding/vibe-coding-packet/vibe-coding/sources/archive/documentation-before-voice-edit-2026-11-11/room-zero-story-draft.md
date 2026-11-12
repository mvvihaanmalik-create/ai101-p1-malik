# Room 0: story and ending

**Status:** Vihaan liked the setup and chose the hostile reception ending on November 8, 2026. The setup below is retained. Build 06 implements the repeated greeting and the hostile ending with fixed shots, effects, sound cues and timing. The letter and fixed progress clues still need integration. The earlier peaceful checkout ending has been replaced.

## Premise and motivation

You arrive to carry out a late relative's final request: close the family hotel. It has been shut for years, but the lights are on and the staff are still working. A letter in your room says: "One room remains occupied. I could never bring myself to knock."

That room is the honeymoon suite. Its occupant must check out before the hotel can close. You have the key and the old caretaker's tarnished brass crucifix. The lift is broken.

## What is happening

The hotel is preserving the last night it was full. Its people are trapped in unfinished actions: room service never delivered, a ball never found, a drink never served, luggage never taken home. Ordinary scenes are the hotel's successful imitations of life; anomalies are moments when those repetitions fail. The butler is trying to keep the night running. Its origin stays partly unexplained.

This explains the repeating route and resets as part of the fiction. It does not change the approved normal/anomaly scoring rule.

## Five story beats

1. **Arrival:** Establish the reception and the butler's greeting, followed by the letter, key, crucifix and broken-lift notice. The first ordinary landing teaches the space and controls. The honeymoon suite is the destination from the start. The opening and ending share the exact greeting: "We have been expecting you."
2. **First progress:** After the first correct passage, a service message reads: "The guests are still settling in." Environmental sound suggests people beyond closed doors.
3. **Recognition:** After further correct progress, a framed register or short note reveals the same departure date beside every guest. A later message reads: "We cannot close while someone is still waiting." These clues appear at fixed progress milestones, independently of random encounters.
4. **Suite threshold:** Four correct decisions lead to the honeymoon suite. The player finally opens its door, but crossing the threshold brings the player back to reception.
5. **Recognition and reveal:** The butler repeats the same greeting from the opening. The view becomes blurry and the room grows dark. His flesh becomes invisible; the skull and bones are visible, glowing in the darkness. The view turns behind the player to reveal the anomaly figures surrounding them and walking closer, all glowing in the dark. The game ends here.

## Ending image

The honeymoon-suite door opens onto reception again. The familiar greeting initially suggests a reset, but the image blurs and darkens into the hostile reveal. The butler's glowing skeleton is exposed through the absence of visible flesh. Looking behind reveals the other anomaly figures closing in from around the player, glowing in the darkness.

End on their approach. This is the game's conclusion, distinct from an ordinary progress reset. Do not replace it with the earlier phone-call ending, a peaceful departure, or a return to gameplay. Exact end-screen timing remains a production detail.

## Scope of this proposal

- One ending, reached through the existing four-step loop and opening the suite door.
- Short readable text and sounds can carry dialogue; recorded voice acting is optional, not required by this draft.
- The ending needs a reception setting that matches the opening. The opening reception is playable; the final reveal is a concluding sequence rather than another level.
- Show the same fixed story clues at progress milestones so randomized anomalies do not hide required narrative information.
- No player face reveal. The ending needs the reception, the glowing butler and anomaly figures, and a look-behind view. Build 06 uses fixed cinematic shots, hides the guest in the reverse view, blocks walking/F, and retains Escape pause. The final image remains until the player explicitly restarts.

## Remaining story work

Integrate the letter and fixed progress clues, then review the implemented ending's pacing and sound with a human player. The explanation of the hotel stays a working interpretation; the chosen ending exposes the trap without an explanatory speech.

## Implemented ending 06

The suite door starts a 26-second concluding sequence. 0-1.6 s: black threshold; 1.6-6.2 s: familiar reception and verbatim greeting; 6.2-10.5 s: closer view, blur and darkening, flesh fades; 10.5-13.8 s: exposed skull/ribs; 13.8-14.5 s: dark reverse cut; 14.5-24 s: seven figures from C2-C6 close around the viewpoint; 24-26 s: the approach settles into the final image. The end reads "No departures." with **Begin again**. It does not award/reset score or automatically return to play.

The butler skeleton is original stylized bone geometry weighted to the retained CC0-derived rig. The surrounding humans and dog retain their encounter identities and props, with pale edge glow and visible facial texture. The reverse view uses the same reception geometry with a closed entrance and red curtains. No player face is shown. [Build evidence and limits](build-record/ending-06.md).
