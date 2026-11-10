# Hotel character arms 13

November 9, 2026. Vihaan reported unnatural arm motion and clarified that he meant the hotel characters, not the player's walk.

Corrected the server/bartender hand assignment to reach from the near side, and the luggage guest to carry with the near hand. Replaced the fixed world-space elbow bend with a body-relative anatomical pole and bounded two-bone reach. Elbows retain flexion rather than locking at full extension. Targets ease over time; wrists preserve their pre-reach orientation instead of inheriting elbow twists. Fingers curl during object handling. Object attachment now uses the palm rather than the wrist joint. The luggage guest paces more slowly and blends toward idle at each reversal. The anomalous glass receiver lowers their hand between events instead of holding an open raised palm continuously.

The player's runtime mesh and clips remain guest-v8.glb. A preliminary guest animation study was generated before Vihaan clarified the affected characters; guest-v13.glb/guest-locomotion-v13.blend and its script are unreferenced and excluded from deployment.

24 tests pass, including two arm-solver checks for bone length, reach bounds, degenerate targets and elbow side. Syntax checks pass. Browser reviewed normal/anomalous glass handling, normal luggage and the ending cast. Screenshots and test logs are in tests/arms-13. This is a procedural animation improvement, not mocap or a claim of final human acceptance. No new external assets or dependencies.

Documentation audit: documentation-audit-13.md. Current plan and PRD have been condensed, old versions archived, and stale defense/readiness status corrected. Personal answers and formal coursework evidence remain explicitly unfilled.

Deployment dpl_GdzBSACzQAqwRTPJHPAiH6wMSqrZ is READY at https://room-zero-ashy.vercel.app/. Anonymous downloads of arm-kinematics.js, character-encounters.js and main.js match local SHA-256 hashes. Public access retained.
