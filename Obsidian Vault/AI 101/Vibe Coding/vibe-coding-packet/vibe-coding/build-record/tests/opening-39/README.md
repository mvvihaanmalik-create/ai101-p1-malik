# Opening · v39
November 14, 2026

I chose **00:45–01:44 of Hotel California**, including the arrival and the receptionist showing me the way. This replaces my earlier idea of ending the music at the breakdown.

The supplied Clip 2 lasts 63.9935 seconds and matches the full recording from about 00:40.02. Codex compared the waveforms, then trimmed 4.98 seconds from its beginning to make the requested 59-second edit. [Audio evidence](audio-source.json).

| Time in the edit | What happens |
| --- | --- |
| 0–13 s | Empty highway, a view of me driving, then the road ahead. The music sounds like a car radio. |
| 13–18 s | Early bonnet smoke and the scratched HOTEL sign, marked 0.1 mile. |
| 18–24 s | Distant red hotel windows, faltering engine and the stop. |
| 24–33 s | Heavier steam, the full car-exit motion and the first steps toward the hotel. |
| 33–44.5 s | The woman waits in the doorway, moves aside, a bell rings and I enter. Cuts imply the middle of the roughly 161-metre walk. |
| 44.5–52.7 s | Reception explains that only the honeymoon suite is available. Her candle lights and she gestures toward the stairs. |
| 52.7–59 s | A brief view down the empty passage, then a return to reception and player control. |

The audio clock controls the pictures and subtitles. Pausing holds both; skipping stops the opening cue. Hotel jazz stays paused until check-in ends. The characters have written dialogue and gestures, with no spoken voices.

**Verification:** The 59-second sequence, pause/resume, early smoke, distant hotel, subtitles and return to hotel audio passed in a local browser. Visual review caught an outdoor material depth problem and an over-raised guiding arm; both were revised. The final sequence was recorded with actual game audio and subtitles. These are developer checks, not a completed formal Test 3 or Test 4.

**Sources:** My supplied Eagles recording; the existing credited car, Rocketbox exit take and MakeHuman characters; domasx2 engine and Kenney/looneybits effects. Codex authored the candle, sign, camera cuts and sound filtering in Three.js/Web Audio. FFmpeg made the audio edit; local faster-whisper provided draft timing, with recognition errors corrected. No new external model or Blender MCP call was used. [Sound credits](../../../sources/sound-credits.md) · [Asset credits](../../../sources/assets-and-tools.md).

**Preview:** [Download the opening with game sound and subtitles](opening-v39.mp4). This is a 1080p export of the browser capture, not a claim of native 30 fps performance. Capture averaged about 19 frames per second.

**Release:** v39 is [live](https://room-zero-ashy.vercel.app/). All 33 automated tests and the syntax checks passed. The final browser run checked the complete opening, pause/resume, the first playable door, restart and skipping, with no JavaScript errors. Seven hosted modules/credits matched the tested local files before promotion. The public alias now points to `dpl_6sTCNbnPtUmrpiyfNn7oDwpRcv7Y`. [Fixed review build](https://room-zero-8klr6y82k-vihaanmalik.vercel.app/?review=1).
