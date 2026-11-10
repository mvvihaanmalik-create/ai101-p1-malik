# Cycle 1, Test 3: unexpected input and open feedback

**Date:** November 10, 2026, approximately 16:21-16:23 America/New_York.
**Roles:** Vihaan watched and supplied broad feedback; Codex operated the game and recorder at his request.
**Build:** Frozen v13, https://room-zero-jrfr14ibh-vihaanmalik.vercel.app/?review=1 . The prescribed Restart orientation fixture was used, followed by normal walking/E controls. No game code, assets or deployment changed during the test.
**Capture:** Continuous 116.266-second H.264 video, 1280 x 720, 15 fps, silent; source desktop crop x880/y174, 1020 x 854, aspect preserved. Windows desktop and Codex in-app browser; exact browser version not collected. Sound enabled, music 55%. Review overlays remained visible.

## Evidence

[Recording](T3-unexpected-input.mp4), retained T3-unexpected-input-original.mkv, [events](T3-events.json), [timeline](T3-timeline.md), T3-recording-metadata.json and T3-video-probe.json. Screenshots and visible review-data checkpoints use the T3- prefix. The capture probe is setup evidence, not a gameplay retry. Decoded frames at 00:50 and 01:30 verify the recording contains the test and final walking result. Evidence was saved before this interpretation.

## Results

| Procedure | Actual result |
|---|---|
| Restart orientation, enter corridor and approach trolley | Reached ordinary corridor, depth 6.86, x -0.32. Orientation true, progress 0, no history entries. |
| E inspection; W+D together for three seconds | Service detail stayed open. Position remained x -0.32/depth 6.86; movement velocities zero. Progress remained 0 and history empty. |
| E closes inspection | Returned to main view, detail null, same position. |
| Escape; W for three seconds, released while paused | Mode remained paused, position unchanged. Visible review clock stayed at 32.30 during the held input. |
| Resume; no input for at least two seconds | Still x -0.32/depth 6.86 with zero movement. Approximately 13.7 seconds elapsed before the saved checkpoint because of tool overhead, including the explicit two-second wait. No stuck movement. |
| Five rapid E taps | Five presses completed in approximately 0.1 seconds. Ended in the service detail, expected after an odd number of toggles. Same position, progress 0, empty history; no crash or trapped inspection. |
| E once to close; W for two seconds | Detail null and depth increased from 6.86 to 9.06. Orientation stayed unscored; no game errors in saved checkpoints. |

**Functional conclusion:** All specified control checks passed in this attempt. No duplicate scoring, hidden movement, stuck key, crash or trapped inspection was observed. This does not establish all possible input combinations or complete Cycle 2.

## Open-ended feedback requested by Vihaan

Before T3, Vihaan asked for feedback to be more open-ended and broader in scope. The prompt invited overall impressions of attraction, weakness, confusion, mood, and unrestricted changes/additions. The functional test steps remained unchanged. This expands the observation discussion; it does not make T3 a full story, audio or multi-floor usability test.

**His feedback, lightly organized without adding judgments:**

- The presentation feels cluttered, with too many people together in one room. He wants more separated encounters.
- The journey should involve climbing stairs across multiple floors toward his room.
- Divide anomalies between staircase shots and longer hallway shots, including halls taken to reach another staircase.
- Add more variety and horror, frame anomalies more closely and give them more time.
- One proposed horror variant: the children use another child's head as their ball.

**Original response:**

> It could be more fragmented, i dont like how ther's a lot of lcutter and so many people in one room, moroever i want the game to be so that you lcimb sytairs to your room, mutiple floors. So anomalies need to be divided, some for stairs shots and then if u wanna change staircase and take the hall towards it then the longer hallway shots. More variety, and more horror. such as the anomaly kids could have another kids head as the ball instead. just zooming in more on anomalies and igicng them more time.

**Design implication:** The current baseline concentrates a recurring cast in one reused observation corridor. Vihaan is asking for a more segmented ascent with stair/hall encounter variety and slower, closer presentations. These are requested revision directions, not implemented features or proven solutions. The head-as-ball variant is a concept to stage and review; it was not shown or tested. The current plan/PRD still describe the built scope and must be revised if a new route is adopted.

## Limits and next step

The video has no audio stream and 15 fps capture does not establish game frame rate. Review overlays affect the viewing experience. The broader feedback was supplied while watching v13; it is not acceptance/rejection of every v14 repair. The no-input wait exceeded the specified minimum; no step was substituted or retried. Cycle 1 T1-T3 are complete. T4 and all formal Cycle 2 tests remain unrun.
