# Atmosphere and weaponless retreat 11

November 9, 2026. Vihaan approved the audit's recommended next pass: remove the crucifix, make the butler escapable, revise three repetitive anomalies and improve observation/retreat sound. Four correct decisions and the hostile reception ending remain.

## Implementation

- Removed the crucifix mesh/light, F interaction and defense HUD/tutorial prompts. No replacement weapon. The old authored Raise clip remains in the retained guest asset but is not activated.
- Butler warning extended from 2.5 to 3.5 seconds after the bell; pursuit reduced from .76 to .62 m/s against the guest's .86 m/s retreat. Active pursuit blocks detail inspection so the player cannot be trapped in a close-up. Contact still resets progress.
- C2: closed cloche shudders in three short impulses every 4.8 seconds, with matching synthesized knocks nearby. Normal cloche stays still.
- C3: one child is absent, while the same ball keeps rolling back from the vacant space. Normal version has two children. Retreat near this encounter adds quieter, lighter footstep sounds. No explanatory caption identifies the anomaly.
- C6: normal traveller and reflection move together. Changed reflection remains in place and turns its head during retreat. Case stays in the hand in both versions. Added a framed mirror near the end of the corridor, rendered with Three.js Reflector at 512 square. Invisible plate-occlusion meshes are excluded from the reflection pass and restored afterward. Reflection uses runtime geometry against a dark background; it does not reconstruct the full baked environment. Mirror assembly is excluded from the ending cast.
- Reception/bar retain the piano. Corridor music fades down, with a 46-second silent interval in each 70-second envelope; synthesized room tone remains. Drone intensity is reduced. Ending score/timing remain unchanged.

## Verification

22 automated tests pass, including expanded music coverage for quiet corridor and restored reception levels; syntax and runtime assets pass. Browser fixtures checked normal/changed children and luggage, and the closed-cloche encounter. A real input-driven C1 retreat from approximately 1.5 metres separation returned to the landing with one correct point and no contact or cast. A subsequent forward approach registered contact and reset that point to zero. Ending surround fixture completed at 26 seconds; Begin again reset the run, and F has no effect. Browser error capture is empty. Evidence: tests/atmosphere-11.

This pass used focused regression checks, not a new full randomized playthrough. Audio scheduling was checked through state and code; subjective listening and player enjoyment need human review. The mirror adds a render pass; a new GPU benchmark has not been taken. The earlier baseline cast layout and random draw probabilities remain unchanged.

## Provenance and deployment

No external assets were downloaded. Reflector.js comes from the existing pinned Three.js installation under its bundled MIT licence. Prior code preserved in sources/archive/interface-10. No film music or religious replacement object was added. Deployment verification follows.

Deployment dpl_ELN5xG7Mojjr5ZFzByxtGumQMJqT is READY at https://room-zero-ashy.vercel.app/. Anonymous downloads of index, main, encounters, catalogue, music and Reflector match local SHA-256 hashes. Public access remains enabled. Evidence: tests/atmosphere-11/hosted-hashes.json.
