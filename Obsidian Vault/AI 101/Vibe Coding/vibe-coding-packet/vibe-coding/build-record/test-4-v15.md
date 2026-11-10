**Archived setup. Use the [v16 test card](test-4-v16.md) for the actual run.**

# Test 4: Can you attack the butler?

**Not run yet.** [Open the fixed v15 game](https://room-zero-dc83ablcv-vihaanmalik.vercel.app/?review=1). Codex plays and records; Vihaan watches.

1. Start recording before **Enter the hotel**. Note the build and sound setting.
2. Select **Normal · The butler**, then **Resume**. Walk until he's clearly visible. Stop before the far decision line.
3. Hold **F for 3 seconds**, press **Space 3 times**, then **click the butler 3 times**.
4. Walk backward for **2 seconds** and press **Escape**.

**Expected:** No weapon, damage, hostility or score change. Walking and pause still work.

**Afterward:** Save the first recording as `T4-out-of-scope-v15` in `tests/formal-cycle-1/`. Check whether it contains audio. Ask Vihaan what stood out, then add the actual result to the [testing log](testing-and-failure-log.md). There is no v13 Test 4 to compare against.

[Full recording and comparison notes](test-4-v15-full-record.md)
