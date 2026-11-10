# prd.md: Room 0

**Current override, November 9 (v11):** Vihaan approved removing the crucifix. Retreat is the defense; contact still resets progress. C2 now knocks beneath a closed cloche, C3 removes one child while the ball returns, and C6 separates the guest from his reflection. This supersedes the historical defense and encounter descriptions below. [Implementation and evidence](build-record/atmosphere-11.md).

## Current build update: November 9, v9

Vihaan requested a stronger Exit 8 observation loop while retaining the Twin Peaks aesthetic, plus restrained Hokum influence and a full polish playthrough. The implemented ordinary floor now keeps the whole cast in fixed places. Random draws change one cue; turning back scores at the corridor entrance, and four correct decisions open the final stairs. Movement directions remain consistent through camera cuts. Suite bindings, candles, salt and a knocking cue add folk horror. [Implementation and full playthrough evidence](build-record/playthrough-09.md). This current update supersedes older implementation-status paragraphs below; it does not claim Vihaan has reviewed the new build or completed coursework testing.

*Working draft for the selected concept. Details marked proposed or in brackets need Vihaan's decisions before the build.*

See [room-zero-gameplay-proposal.md](room-zero-gameplay-proposal.md) for the approved gameplay loop and planned checks. Specific presentation and implementation details remain open.

The approved [encounter pool](room-zero-encounter-pool-v2.md) gives the characters normal and anomalous variants, includes twelve anomaly ideas and uses the butler as the first active threat. room-zero-encounters.md retains the earlier cast draft.

See [room-zero-route-and-controls.md](room-zero-route-and-controls.md) for the approved floor section, changing camera shots, desktop controls, and planned route checks.

**Build status, November 8 (ending 06):** All twelve anomaly IDs and their ordinary versions, eight inspection views, four-decision loop and the hostile reception ending are implemented. Opening the unlocked suite triggers the repeated greeting, blur/darkening, exposed glowing skeleton and surrounding cast. Pause, terminal hold and explicit replay were checked. The letter/fixed story clues, human acceptance and coursework testing remain pending. See [current evidence](build-record/ending-06.md).

**Goal:** Reach and open the haunted honeymoon suite while avoiding anomalies along the way. The lift is broken; the approved route uses the landing, corridor and short stair flight, with a hallway fallback if stairs prove too difficult.

**Story and chosen ending:** The guest arrives to close a late relative's hotel. Opening the honeymoon suite returns the guest to reception. The butler repeats his original greeting; the view blurs and darkens, his flesh becomes invisible and his skull and bones glow. Looking behind reveals the other anomaly figures surrounding the player and approaching, glowing in the dark. The game ends on this reveal. See [room-zero-story-draft.md](room-zero-story-draft.md); the repeated greeting and shot/sound timing are implemented in build 06; human pacing review remains.

**User:** Vihaan described wanting an exciting game with surreal art and a feeling of thrill while playing it. [Name one real person and what they want.]

**Features:**
1. The player can walk through the landing, corridor and short stair route using WASD/arrows, inspect with E, raise the holy item with F, and pause with Escape.
2. The player can inspect randomized normal or anomalous passages and turn back when an anomaly appears. The initial pool has twelve variants; ordinary character appearances do not themselves count as anomalies. See room-zero-encounter-pool-v2.md.
3. The player can raise a tarnished brass crucifix to briefly repel the approaching butler; the item has a cooldown. Contact with the butler resets progress to zero and returns the guest to the landing. See room-zero-defense-draft.md for initial tuning values.

**What happens:** With the lift broken, the guest travels toward the haunted honeymoon suite. Continue on a normal passage or turn back when an anomaly appears to gain one step; a wrong choice resets progress to zero. Four correct steps lead to the suite. A holy item briefly repels approaching threats so the player can retreat. The perspective changes depending on the view: sometimes the guest is visible, sometimes not. The guest's face remains hidden; visible clothing includes a shirt, tie, and blazer. [Define framing, view changes, controls, threat behavior, and ending.]

**Look and feel:** Follow the approved [Visual Study 02](sources/moodboards/room-zero-visual-study-02.md): aging hotel, walnut paneling, oxblood carpet, faded olive wallpaper, brass details, amber lamps against cold slate-blue window light, atmospheric shafts and deep readable shadows. Characters are uncanny and formally dressed. The references include Hokum and Twin Peaks, with changing views inspired by the first Resident Evil. The guest's face stays hidden; clothing includes a shirt, tie, and blazer. [Define camera framing and sound.]

**Out of scope:** [Decide.]

**Technical route:** Approved November 8: a hybrid of Blender-rendered hotel views and real-time Three.js characters, with shared camera transforms. The first authorized prototype covers the corridor, walking guest and approaching butler. See [ADR-005](decisions/ADR-005-hybrid-rendering.md). The full game and visual acceptance remain separate from this proof.

**Done when:**
1. Continuing on normal passages and turning back on anomalies adds progress; an incorrect choice resets it; four correct steps lead to the suite. Opening the suite triggers the chosen reception ending, which concludes the game.
2. The landing, corridor and stair-approach views switch at defined boundaries, detail views open and close with E, and the guest's face remains hidden. Holding a movement direction through a cut preserves movement direction until release. [Check exact shot placement in the prototype.]
3. The crucifix briefly repels the approaching butler, allowing retreat, and cannot be used continuously because it has a cooldown. Contact with the butler causes one progress reset and returns the guest to the landing. [Tune duration and threat behavior.]
