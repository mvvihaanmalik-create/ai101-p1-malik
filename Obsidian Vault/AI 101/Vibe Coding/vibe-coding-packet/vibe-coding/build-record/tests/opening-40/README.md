# Opening repairs and exploration · v40
November 14, 2026

I sent two screenshots because the receptionist's arms crossed through her body and her movement looked wrong. I also pointed out that Explore mode was missing.

**What changed:** Codex corrected the arm targets, kept the wrists neutral and measured the candle grip with closed fingers. She carries the candle in her left hand and gestures toward the east door with her right. Her doorway walk now turns, takes one complete stride, stops and looks back. Softer face lighting, antialiasing, softer shadows and bevelled wooden doors improve the close shots.

**Explore the hotel** is a separate title-screen option. I can walk from the broken car through the empty hotel, climb or descend four storeys, inspect ordinary details and return outside. The music is quieter and muffled. There are no people, anomalies, decisions or resets. [Layout and limits](../../../hotel-exploration-plan.md).

**Checks:** All 35 automated checks passed. Across 1,621 sampled poses, the arms stay on their own sides, the candle keeps contact and the largest joint change is 1.43 degrees per 60 Hz step. The browser walkthrough covered the full opening, pause, skip, first door, empty ground-floor rooms, all four storeys, descending, returning outside and switching back to the story. A forced graphics loss recovered with exploration controls intact.

The first recording exposed long first-use rendering stalls. Codex moved car, performer and candle-light preparation into loading. In the final recording, all ten timed checkpoints arrived within 0.31 seconds of their requested capture time, with no JavaScript errors or graphics resets. The empty-reception rendering check measured a 0.8 ms median and 1.2 ms p95 at 1264 × 711 in this local browser; this is not a performance claim for other computers.

**Preview:** [Opening with game sound and subtitles](opening-v40.mp4). The 1080p export comes from a browser capture averaging 19.3 frames per second. `recording-clean` is the final take, captured without simultaneous still screenshots. Earlier attempt metadata and stills are retained; their redundant raw frame folders were removed.

**Release:** [v40 is live](https://room-zero-ashy.vercel.app/). Eight hosted files matched the tested local files before promotion. The public alias points to `dpl_EKNjER9xxJU1QhHrrtGcvgBqTs9W`. [Fixed review build](https://room-zero-52mwjjtu8-vihaanmalik.vercel.app/?review=1).

**Sources:** Existing MakeHuman receptionist and walking clips, existing hotel sets and music. Codex authored the pose correction, candle grip, door detail, lighting and exploration routes in Three.js. No new downloaded model or Blender MCP call was used. [Asset credits](../../../sources/assets-and-tools.md) · [Sound credits](../../../sources/sound-credits.md).

These are developer checks. Formal Cycle 2 Tests 3 and 4 remain incomplete.
