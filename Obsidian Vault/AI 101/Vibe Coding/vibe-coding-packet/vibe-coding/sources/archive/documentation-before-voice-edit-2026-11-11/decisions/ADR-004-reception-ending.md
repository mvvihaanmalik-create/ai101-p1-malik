# ADR-004: Return to reception

**Status:** Chosen by Vihaan on November 8, 2026.

**Context:** Room 0 needs an unsettling, hostile ending after the player reaches the honeymoon suite. The earlier peaceful checkout ending did not fit Vihaan's intended tone.

**Decision:** Opening the suite returns the player to reception. The butler repeats his original greeting; the view blurs and the room darkens. The butler's flesh becomes invisible and his skull and bones glow. Looking behind reveals glowing anomaly figures surrounding the player and walking toward them. The game ends there.

**Consequence:** The opening reception and greeting must be established clearly so the return is recognizable. The finale requires a matching reception composition, the skeletal glow effect and the surrounding figures. It is a concluding reveal, distinct from a normal progress reset. Dialogue, camera/control treatment, sound and timing remain production details.

## Implementation, November 8: ending 06

The chosen ending runs from the unlocked suite door. The opening and ending share "We have been expecting you." A 26-second sequence returns to reception, exposes the glowing skeleton, reverses to the closing C2-C6 cast and holds the final image. Escape pauses; walking and defense are blocked; only explicit replay starts over. The reception and props remain recognizable. [Developer checks](../build-record/ending-06.md) do not substitute for human pacing and visual acceptance.
