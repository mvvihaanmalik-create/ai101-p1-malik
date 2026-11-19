# Sound credits

**Explore mode, v40:** I reuse my supplied *Dance of the Dream Man* recording at a lower volume, with stronger low-pass filtering. The car-to-hotel walk and empty rooms use the existing footsteps and room tone. No new recording was sourced for this mode.

I kept the characters silent. The desk bell marks my return to reception. I reuse its synthesized tones for the butler’s handbell. Fabric brushes past on either side as the guests close in. The room tone falls away while the song carries into the final close-up. The impact combines a recorded metal-pot strike with two short synthesized notes.

**v37:** I added Ogg playback copies of my supplied hotel and ending recordings for browser compatibility; the original MP3 sources remain retained. FFmpeg made these conversions. I made the synthesized handbell louder and tied it to the visible sway. The longer highway opening uses original low synthesized engine pulses before the existing domasx2 stopping sound. No new external sound library was used.

| What I used | Creator and original | How it sounds in the game |
| --- | --- | --- |
| Hotel jazz | Angelo Badalamenti, “Dance of the Dream Man (Instrumental),” from [Music from Twin Peaks](https://store.rhino.com/products/music-from-twin-peaks-lp) | I supplied the stereo MP3 and confirmed it was cleared for use in the game. It plays most clearly in the Night Bar. |
| Highway opening · v39 | Eagles, *Hotel California*. Written by Don Felder, Don Henley and Glenn Frey. | I supplied Clip 2 and chose original time 00:45–01:44. Codex matched it to the retained full recording, trimmed it to 59 seconds and made Ogg/MP3 playback copies with FFmpeg. Radio filtering and a quiet delay open into a wider score as I approach the hotel. Subtitles, candle, directions and shots follow the same clock. |
| Suite approach and ending | Eagles, *Hotel California*. Written by Don Felder, Don Henley and Glenn Frey. | I supplied the recording. I start the recording at 3:54.55. The final verse follows the fixed shots, then the guitar outro plays through the title and credits. I end the edit at 5:45.55 and fade the last ten seconds under my thanks to David Lynch and Professor Nathan Madrid. |
| Motor | domasx2, [Racing car engine sound loops](https://opengameart.org/content/racing-car-engine-sound-loops) | I used the low engine loop. Its pitch falls as the car stops. |
| Car door | looneybits, [CarDoorSFX](https://opengameart.org/content/cardoorsfx) | Separate opening and closing recordings follow the door animation. |
| Shoes and hotel door | Kenney Vleugels, [50 RPG sound effects](https://opengameart.org/content/50-rpg-sound-effects) | Three footfalls, a metal latch and a hinge creak. The room changes their tone and reflections. |
| Small objects and final impact | Kenney Vleugels, same RPG pack | I used `metalPot2` for the cloche and final hit, `metalClick` for glass and clasps, `handleSmallLeather2` for the cases and `cloth2` for sleeves and the approaching guests. |

The earlier ending used Kevin MacLeod’s *Long Note Four* under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The recordings by Kenney, looneybits and domasx2 use [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The Badalamenti master is a separate supplied recording. Its file is unchanged; the game handles filtering, looping and volume. Codex built the desk bell, room hum, filtered air, reflections and low impact notes in Web Audio under my direction. Music edit record (local archive) · [Original effects and licences](audio-23/) · [In-game credits](../build/music-credits.html)
