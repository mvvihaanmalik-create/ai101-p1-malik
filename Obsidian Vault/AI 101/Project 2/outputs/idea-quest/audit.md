# idea.quest · Project 2 workflow audit

**Date:** October 15, 2026
**Scope:** The completed five-gate run for the published 3D idea.quest workshop and its later status-only automatic publisher. This is a workflow/evidence audit, not a full security audit or a claim that every device and feature was tested.

## Outcome

| Gate | Decision evidence | Result |
| --- | --- | --- |
| 01 Goal | Vihaan provisionally accepted the cozy, mysterious potion-room goal with Bob, project jars, and preserved records. | Approved |
| 02 Route | Vihaan chose the Three.js route while the earlier 2D site stayed live during the build. | Approved |
| 03 Prototype | Vihaan explicitly accepted the published workshop as the Step 3 prototype on October 13. | Approved |
| 04 Human check | Vihaan reported phone tapping/dragging working, rejected manual republishing, chose validated status-only automation, approved the live display, and confirmed the post-login update. | Approved for this bounded route |
| 05 Decide | Vihaan said “okay lets finish here.” | Stop this pass |

**Final workflow status: 5/5 gates approved.** This means the selected *workflow pass* is complete, not that the application is flawless or further work is prohibited.

## What this run established

- The public workshop is available at [idea.quest](https://idea-quest-ai101.vercel.app/). Its visitors see a published project collection; they cannot edit Vault files through the site.
- The local status publisher watches the Project 2 registry and marked project notes, validates an allowlisted public summary, runs the relevant tests, verifies a staged build, promotes it, and checks the live status hash. A tested status edit reached the live site without changing the pinned visual assets. [[AI 101/Project 2/idea-quest-three-spike/README.md|Publisher details]]
- A user-level Windows Startup shortcut now invokes an idempotent launcher. The launcher started one watcher in our check. Vihaan later reported that the post-login update appeared; this is his observation, not an independently instrumented login test.
- The latest recorded usability pass reported 24 automated tests passing and browser walkthroughs for desktop and a 390px emulated phone layout. [[AI 101/Project 2/idea-quest-three-spike/usability-audit-2026-10-15.md|Usability evidence]]
- After the Step 4 tracker change, four tracker tests passed. The publisher log also recorded a validated deployment and live status-hash verification on October 15. The log recorded a temporary-stage cleanup `EPERM` warning **after** live verification; this is a cleanup issue, not evidence that the publication failed.

## Decision trail and ownership

The important redirection was Vihaan's rejection of a public read-only snapshot that required manual republishing. He wanted to direct edits from Obsidian Claudian or ChatGPT desktop. Rather than expose the Vault or add public write access, the selected first scope was **status only**, automatically published after validation. Vihaan supplied the goal, rejected the inadequate boundary, selected the publication scope, checked the result, and chose to stop. AI-assisted work implemented and tested the bounded monitor and documented its limitations. [[AI 101/Project 2/ai-use-log.md|AI use log]] · [[AI 101/Project 2/outputs/idea-quest/04-human-check.md|Human check]]

## Limits and handoff

1. The monitor needs this Windows computer running and the Vercel CLI account/session available. Future status edits may fail to publish; compare the project journal with the local source and inspect `%LOCALAPPDATA%/AI101Projects/idea-quest-status-publisher/publisher.log` if needed.
2. Website design/code changes are **not** covered by status automation. Public visitor editing is not available.
3. Physical-phone frame rate, broad browser/device behavior, full-length focus sessions, hardware sound quality, long-term unattended reliability, and a full security review are not established by this run.
4. This audit describes local Vault artifacts and observed publication. It does **not** assert that this new audit, current log, or every latest file has been pushed to the instructor's GitHub repository. Review the scoped course repository and disclosure before submission.

**Stop boundary:** No further features are approved by this audit. A new requirement reopens the relevant feasibility, prototype, and human-check gates instead of silently extending the completed pass.
