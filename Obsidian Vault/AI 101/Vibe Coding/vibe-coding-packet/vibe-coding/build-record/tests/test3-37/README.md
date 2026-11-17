# Test 3 repairs · v37
November 13, 2026

I used my Test 3 feedback to request these changes:

| Concern | Revision |
| --- | --- |
| Graphics crashes | Lower render-buffer limit, 30 fps pacing, fewer watchdog draws and no multisample ending buffer. A graphics-device recovery pauses safely and preserves the room and score, then offers Resume at reduced detail. |
| Music missing | Ogg copies of my supplied recordings support browsers without MP3 playback. Hotel music can retry after an error. |
| Cup grip and porter | Softer wrist alignment, maintained hand separation, lower suitcase handle, no backward-sliding porter gait, restrained breathing and a smaller door gesture. |
| Random suitcase puzzle | My ticket identifies the honeymoon suite. Matching it releases the staff-stair key and reveals yesterday's date, contradicting my first visit. The porter stays clear of the opening door. |
| Mirror likeness | The existing MakeHuman guest has a stronger jaw, chin and nose profile and darker hair, inspired by Cooper. This remains an approximation, not a Kyle MacLachlan scan. |
| Butler bell | Louder synthesized metallic ringing follows the visible handbell sway and repeats while he is present. |
| Weak bar anomaly | An exaggerated smile and sideways head tilt accompany a bottle tipping by itself and pouring an endless red stream. |
| Floating reception bodies | A real counter front, top, lamp and register ground both reception shots; the woman stands at floor height. |
| Rushed arrival | A 53-second opening adds a monochrome driving view, engine falter, slower exit and longer hotel/sign shots. Reception captions last 5.8 and 6.8 seconds. The same time mapping controls the driver, door and foley. |

**Developer evidence:** 31 automated tests pass. The mixed stair/hall route reached four correct decisions, solved the luggage puzzle, reached the suite and finished the ending. A forced WebGL context loss recovered, retained progress and allowed the next door to open. Music loaded in the in-app browser. The opening check reached reception and verified the longer directions. Screenshots and JSON records are in this folder.

The initial route check read stale diagnostics; the check now waits for the expected encounter. A lower trial suitcase handle failed the hand-contact test; the final height passed. These intermediate failures are not game passes.

**Limits:** The original device-loss cause is not proven, and recovery cannot guarantee that the browser or GPU never fails. Character likeness and naturalness still need my judgement in the observed Test 3 rerun. No new formal playtest recording is claimed here. An extra opening puzzle remains an idea.

**Sources:** I reused the existing credited MakeHuman rigs, Microsoft Rocketbox exit take, Eric Chadwick/DGG car and sound recordings. New counter/key geometry and face adjustments use Three.js. Ogg conversion uses FFmpeg. This revision did not use Blender MCP or download new models or music. [Asset credits](../../../sources/assets-and-tools.md) · [Sound credits](../../../sources/sound-credits.md).

These repairs shipped with [v38](../test3-38/README.md), including the subsequent luggage-guest correction. The original v37 staging build was not promoted. See the v38 record for deployment verification and its limits.
