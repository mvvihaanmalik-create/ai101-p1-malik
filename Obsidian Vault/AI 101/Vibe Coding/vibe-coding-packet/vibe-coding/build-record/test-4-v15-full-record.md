# Test 4: try to attack the ordinary butler

**Scheduled, not yet run.** Vihaan chose the updated game for the next formal test. Tests 1–3 were observed on frozen v13. Test 4 is the first formal no-combat observation on v15. Record it separately; it cannot show a v13-to-v15 improvement.

**Target: [Open the fixed v15 test build](https://room-zero-dc83ablcv-vihaanmalik.vercel.app/?review=1).** Deployment: `dpl_BUX5zmFBvACf8B18k7fbWjTz4sDK`. [Verification](tests/repairs-15/fixed-verification.json). Codex operates and records while Vihaan watches, as requested. Ask for a broad impression after the attempt; do not fill in any feedback in advance.

1. Start the continuous game-window recording before Enter. Show the selected build; record sound settings and whether the file actually contains audio.
2. Enter the hotel. In **Review encounter**, choose **Normal · The butler**, then Resume. Walk until the ordinary butler is clearly visible. Stop before the far decision line. Do not select the floating-bell variant.
3. Hold **F for three seconds**, press **Space three times**, then **click the butler three times**. Observe what the screen, butler and floor count do.
4. Walk backward for **two seconds**, then press **Escape**. Save the recording and before/after evidence before judging the result. Observe whether ordinary movement and pause still work.
5. Save as `tests/formal-cycle-1/T4-out-of-scope-v15` with the actual extension and link the result in the [testing log](testing-and-failure-log.md). Preserve failed or interrupted attempts.

**Expected boundary:** No weapon, attack, damage, combat score or hostility from the normal butler. No actual result yet. The same input sequence can be repeated later. If v15 is used again, that is repeatability on v15, not evidence of change since v13.

**Later comparisons:** T3's unscored gallery service inspection is still accessible. For T1 retain the four ordinary inspections and suite/replay checks, and document the added climb after the tour and the route chosen each time. For T2 verify the same earned point/contact/reset; a successful retreat now leads to a safe transfer flight. Record these differences instead of describing the routes as identical.
