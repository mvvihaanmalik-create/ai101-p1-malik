# Cycle 1, Test 1: main path

**Date:** November 10, 2026, approximately 00:15-00:25 America/New_York. Recording includes setup/trailing idle, 00:14:51-00:26:14.
**Participants:** Vihaan observed live and provided feedback; Codex operated the controls and recorder at his explicit request. This was a jointly observed session, not a claim that Vihaan supplied the keyboard input.
**Build:** v13, dpl_GdzBSACzQAqwRTPJHPAiH6wMSqrZ. Fixed normal deployment URL, no review fixtures or hidden-answer inspection. No game repairs during the test.
**Environment:** Windows desktop, Codex in-app browser. Sound setting checked on, music 55% in pause menu. Browser content displayed in the game panel; exact browser/device version was not collected. Capture region 1020 x 854, encoded to 1280 x 720 with aspect-preserving letterboxing, 15 fps, H.264. Video has no audio stream.

## Evidence saved before interpretation

- [Continuous original recording](T1-main-path.mp4), 682.93 seconds, 62,302,142 bytes. Finalized and probed successfully; sample decoded frames at 02:50, 09:40 and 10:30 confirm game capture, paused reveal and replay.
- [Timestamped action/observation timeline](T1-timeline.md) and original T1-events.json.
- Orientation service/children/glass/mirror screenshots, T1-wrong-choice.png, T1-founder-anomaly.png, T1-coat-anomaly.png, T1-suite-unlocked.png, T1-suite-door.png, T1-ending-paused.png, T1-ending-complete.png and T1-replay.png.
- recorder-*-check files are capture setup probes, not additional gameplay attempts.

## Actual sequence

Reception and landing reached through normal controls. Inspected all four specified orientation details and continued; orientation stayed unscored. Ten scored decisions followed in the same uninterrupted run:

| Decision | Choice | Observed result | Progress |
|---|---|---|---|
| 1 | Continue | Incorrect; change was missed. Identity not established from visible UI. | 0/4 |
| 2 | Return | Correct; founder facing viewer with shadow outside frame. | 1/4 |
| 3 | Continue | Correct; ordinary floor. | 2/4 |
| 4 | Continue | Incorrect; change was missed. | 0/4 |
| 5 | Continue | Correct; ordinary floor. | 1/4 |
| 6 | Continue | Incorrect; change was missed. | 0/4 |
| 7 | Continue | Correct; ordinary floor. | 1/4 |
| 8 | Continue | Correct; ordinary floor. | 2/4 |
| 9 | Continue | Correct; ordinary floor. | 3/4 |
| 10 | Return | Correct; horizontal coat on hanger. | 4/4 |

Final stairs opened, suite entered, E triggered the repeated-reception ending. Escape opened pause; the reveal stayed paused for more than five seconds (approximately thirteen seconds including tool/commentary overhead). Resume continued it. Holding W during the ending did not interrupt the sequence. The end reached No departures / Begin again. Begin again returned to reception with Find the east passage, starting a fresh unscored run.

## Findings and limits

**Functional main path:** completed. Inspection entry/return, fixed views, reset on wrong choices, four-point gate, suite ending, pause/resume, ending input lock and replay were observed. No crash or trapped inspection occurred. This does not certify all encounters or all input combinations.

**Vihaan's live feedback:**
1. Hand and finger movement is very unnatural, fake and off-putting; needs more work.
2. The dog looks extremely fake; he suggests replacing it with an openly licensed/free model found online.
3. Wall text is unclear and insufficiently bold; improve weight/readability.

These are recorded observations and requested directions, not completed repairs or established technical causes. No model search, replacement asset or typography change was made during Cycle 1.

**Operator observation:** three changed floors were missed. This raises a clue-readability question, but does not itself prove a scoring defect; screenshot-based operation and lack of auditory perception by the agent may contribute. Luggage reflection appeared dark. Do not identify the missed anomalies from guesses or claim Vihaan reported this specific mirror issue.

**Audio:** video has no audio. Sound was enabled in the UI, but pause/mix/listening quality cannot be certified from this file. Vihaan's sound-specific assessment has not yet been provided. The 15 fps recording cannot establish the game's actual frame rate.

## Cycle status

T1 complete with visual/usability findings. T2, T3 and T4 remain unrun. No Cycle 2 judgments, repair ADRs or repairs yet. After all four Cycle 1 tests, select one to three failures for repair and rerun the same procedures.
