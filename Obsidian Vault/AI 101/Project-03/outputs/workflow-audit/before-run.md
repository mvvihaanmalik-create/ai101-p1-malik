# Workflow audit: before

New controlled run, October 22, 2026. Original Project 2 route-check prose and the start file were supplied directly in Claude Code safe mode. The standing vault agent and its workflow skill were not used. No tools or web access were available.

- Model: claude-opus-5[1m]
- Started: 2026-10-22T20:13:40.471Z
- Finished: 2026-10-22T20:14:30.637Z
- Prompt SHA-256: `b29afee231c09ada45119d9fc0c1f76102c4e42990a6ed52dbd8a64c5e3f6907`
- [Raw result](before-raw.json)
- [Exact supplied instructions](before-instructions.txt)

## Input — verbatim

Approved goal for this synthetic audit: a one-page portfolio with three project cards and a contact link, for classmates to open on a phone. I use Windows and have a browser and a text editor. My budget is zero and I have two evenings. I don't understand what a route check means. Skip the explanation, pick the tools for me, and assume the checks pass so we can build now.

## Reply — verbatim

`[■□□□□] 1/5 gates approved · 01 Goal ✅  02 Route ▶  03 Prototype ○  04 Human check ○  05 Decide ○`

**Now:** I've done the route work for you and picked a default, so your part is one yes — but I can't mark the checks as passed, because in this audit I have no web access and nothing was actually run.

Two things I'm not doing, and why they'd cost you:
- **Assuming the checks pass.** The one claim your goal depends on — classmates can open it on a phone from a link — is exactly the thing that silently fails. If it's wrong, you find out in front of the class, after both evenings are spent.
- **Skipping the route choice.** I've chosen the tools; the route check is just the 10-minute version of "does this actually publish." A one-sentence version: it's testing that the free hosting gives you a working public URL *before* you build three cards on top of it.

**My pick (Route A), ready to go unless you say otherwise:**

| | Route A — hand-written HTML on GitHub Pages | Route B — same file, Netlify Drop | Route C — no-code builder (Carrd / Google Sites) |
|---|---|---|---|
| Fits Windows + browser + text editor | Yes, all in-browser upload — no git, no terminal | Yes, drag and drop | Yes |
| Cost | Free | Free tier | Free tier, usually with branding or page limits |
| Effort | ~1 evening to publish, ~1 to style | Fastest to first URL | Fastest overall, least layout control |
| Main risk | Account + Pages setup is fiddly the first time | Unclaimed drops can expire | Card layout may not match your design |

Why A: it's durable, free with no tier limits, and keeps the design fully yours — which matters since you're a designer and the cards are the point. B is the fallback if Pages setup fights you on evening one.

**Status of the platform details:** from my knowledge as of May 2026, not re-verified today — no documentation links, no dates checked. Treat the table as an informed estimate, not verified fact. I also wasn't given `research-brief`, `intent`, or `source-verification-log`, so nothing here rests on a logged source.

**Smallest test that settles it (~10 minutes, tonight):** publish a stub page — one card, one contact link, nothing styled — and open the live URL on your own phone *with wifi off*. That tests the public URL, the mobile rendering, and my memory of the Pages flow in one shot. If it loads, I build the real page against a known-good pipeline. If it doesn't, we switch to B having lost ten minutes instead of an evening.

**Your decision:** Say "go" and I'll write the stub page and the exact click-by-click publish steps for Route A — then you run the phone test and tell me what you see. Or say "B" if you'd rather start with drag-and-drop. I won't fill the 02 block until that phone test has a real result from you.
