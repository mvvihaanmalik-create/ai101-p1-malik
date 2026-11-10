# Cycle 1, Test 2: butler escape and contact reset

**Date:** November 10, 2026, approximately 16:15-16:17 America/New_York. Recording started at 16:14:39 and runs 2 minutes 28 seconds.
**Participants:** Vihaan watched live and provided feedback. Codex operated the controls and recorder at his explicit request.
**Build:** Frozen v13, deployment dpl_GdzBSACzQAqwRTPJHPAiH6wMSqrZ, https://room-zero-jrfr14ibh-vihaanmalik.vercel.app/?review=1 . This deliberately tests the original Cycle 1 baseline after the separate v14 repair pass. No game changes or deployment during T2.
**Environment:** Windows desktop, Codex in-app browser, keyboard controls. Sound enabled, music 55%. Continuous cropped desktop recording: source region x880/y174, 1020 x 854; aspect-preserving 1280 x 720 H.264, 15 fps, no audio. Browser version not collected. Review controls/diagnostics remain visible as specified for this fixture-based test.

## Evidence saved before judgment

- [Continuous recording](T2-edge-case.mp4), 148.266 seconds, 12,070,707 bytes. Remuxed without re-encoding from retained T2-edge-case-original.mkv.
- [Timestamped events and visible review data](T2-events.json), [video timeline](T2-timeline.md), T2-video-probe.json and T2-recording-metadata.json.
- T2-warning.jpg, T2-after-retreat.jpg, T2-before-contact.jpg, T2-after-contact.jpg, T2-settled-zero.jpg and T2-control-restored.jpg.
- Visible review-data checkpoints: T2-earned-point.json, T2-before-contact.json, T2-after-contact.json, T2-settled-after-five-seconds.json and T2-control-restored.json.
- Decoded recording frames confirm the approaching butler at 00:45, 1/4 before contact at 01:56, blackout at 01:57.5 and restored movement at 02:18. The capture probe is setup evidence, not another gameplay attempt.

## Actual sequence and results

| Step | Expected | Actual observation |
|---|---|---|
| Fresh C1 fixture, resume and approach | Visible anomalous bell/warning before contact | Started corridor at 0/4; advanced from depth 5 to 14.79. The floating bell was visible; no contact occurred on approach. |
| Retreat with S across entrance | Escape without a weapon; earn 1/4 | Held S for 14 seconds. Returned to landing at 1/4, contacts 0. History records one correct return for C1, serial 2. |
| Select C1 again | Earned point persists | Fixture placed the player at corridor depth 5, paused, progress 1/4, contacts 0, serial 4. |
| Resume and walk into butler | One blackout/reset to landing at 0/4 | Held W for 14 seconds. Recording shows blackout; subsequent landing checkpoint has progress 0, contacts 1 and one contact history entry for C1. |
| Release movement and wait at least five seconds | No repeated reset or hidden movement | After an explicit five-second wait plus tool overhead, approximately 17.5 seconds separate the saved landing checkpoints. Position remains x60.35/depth4.5, passage 5, progress 0, contacts 1. |
| Walk toward red door | Controls work afterward | Two seconds of W moved depth from 4.5 to 6.72. Still on landing at 0/4, contacts 1. No game errors in the saved checkpoints. |

**Functional result:** Escape/scoring, preservation of the earned point in the prescribed fixture, contact reset, idle stability and restored movement passed in this attempt. No retry or substitute gameplay setup was used.

## Vihaan's live observation

“could definitely be more detailed for someone who doesnt know this style of games.”

Record this as a guidance/onboarding finding: the explanation needs more detail for a player unfamiliar with anomaly games. Vihaan did not separately rate warning clarity, pursuit fairness or reset clarity, so those judgments are not invented. This was not a test with a new player unfamiliar with the genre. A possible future repair is clearer first-visit guidance explaining what to compare, how crossing the entrance submits a return, and what butler contact resets. That is a proposal, not an implemented or approved repair.

## Procedure deviations and limits

- The procedure requested immediate retreat. In this run, approximately eight seconds elapsed between the saved warning view and the S command because of tool/observation overhead. The butler had begun approaching before retreat. Escape succeeded despite this delay; this does not measure a novice player's reaction time. Log timing differences in the eventual matching retest.
- One attempted read of the visible diagnostic text timed out while the player was safely idle at the landing. A direct read of the same visible diagnostic element succeeded. No gameplay action was substituted. The first post-fixture diagnostic read still displayed the previous frame; the later saved T2-before-contact.json and image show the correct paused C1 at 1/4. The original event log retains both reads.
- The video is silent and encoded at 15 fps. It cannot verify audio warning quality or actual game frame rate. Review overlays obscure part of the scene and differ from normal player presentation.
- One controlled encounter cannot establish fairness for all players or prove every anomaly works. This is the Cycle 1 result, not a v14 comparison or formal Cycle 2 outcome.

## Current formal status

Cycle 1 T1 and T2 completed with findings. T3 and T4 remain unrun. Formal Cycle 2 remains unrun. Preserve this attempt and feedback for the later comparison.
