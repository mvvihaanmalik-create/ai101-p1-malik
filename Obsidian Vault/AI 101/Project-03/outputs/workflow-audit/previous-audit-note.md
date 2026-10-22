
# audit-note.md

## The workflow I audited

I audited my five-gate Project 2 workflow Goal, Route, Prototype, Human check, Decide using **idea.quest**, a published 3D project workshop. The workflow helps me turn a project idea into a tested build without treating a working prototype or an AI claim as my final approval. The completed run ended at **5/5 gates approved**; that means this bounded pass is complete, not that the app is flawless.

## The stress test

The harder case in the recorded Project 2 run was the publishing boundary. The public workshop initially showed a read-only snapshot that required manual republishing. I rejected that boundary because I wanted to direct edits from Obsidian Claudian or ChatGPT desktop and see validated changes on the public site. This tested whether the Human check would stop the workflow and return to feasibility rather than accept a working site as sufficient. I narrowed the first test to **status only**, not website design/code or public visitor editing.

## What happened

| Gate | Recorded decision | Result |
| --- | --- | --- |
| 01 Goal | I provisionally accepted the cozy potion-room goal with Bob, project jars, and preserved records. | Approved |
| 02 Route | I chose Three.js while the earlier 2D site stayed live during the build. | Approved |
| 03 Prototype | I explicitly accepted the published workshop as the Step 3 prototype on October 13. | Approved |
| 04 Human check | I reported phone tapping/dragging working, rejected manual republishing, chose validated status-only automation, approved the live display, and confirmed the post-login update. | Approved for this bounded route |
| 05 Decide | We stopped. | Stop this pass |

The important failure signal was my **“no”** to the read-only/manual-republish boundary. That meant a published, interactive workshop had not yet met my control requirement. The workflow returned to feasibility instead of marking Step 4 complete. [[AI 101/Project 2/outputs/idea-quest/04-human-check.md|Human-check record]]

An October 20 status check found a separate **label conflict, not a gate-count conflict**: the Project 2 registry recorded idea.quest as `complete` with **5/5** approvals, while the public collection showed `active`/“Building” with the same **5/5** approvals. The public phase had been taken from an older workshop note. Vihaan approved correcting the live label to follow the registry; this did not reopen or approve a workflow gate. [[AI 101/Project 2/progress-arcade/projects.json|Project registry]] · [[AI 101/Project 2/Workshop Projects/idea-quest.md|Workshop note]]

## The fix

The bounded change was to keep visitors read-only but automatically publish **validated project-status summaries** after local edits. [[AI 101/Project 2/02-check-feasibility.md|Step 2]] records the return to feasibility and route choice; [[AI 101/Project 2/idea-quest-three-spike/status-auto-publish.mjs|the publisher]] watches the Project 2 registry and marked project notes, validates an allowlisted summary, runs tests, checks the staged build, promotes it, and verifies the live status hash. Website design/code changes are outside this route. A user-level Windows Startup shortcut starts the monitor after login. This was an implementation and workflow-boundary change, not a claim that the public site gained editing access.

For that later label conflict, the bounded implementation change makes the registry's phase authoritative for existing workflow projects while leaving new projects' phases note-owned. A regression test checks both paths. This is a live status-data correction, **not** the Project 3 assignment's separate line-numbered workflow wording fix; that **fix → rerun** evidence remains to be produced. [[AI 101/Project 2/idea-quest-three-spike/vault-store.mjs|Merge rule]] · [[AI 101/Project 2/idea-quest-three-spike/tests/vault-store.test.mjs|Regression test]]

## What the fix changed

One tested next-step status edit reached the live [idea.quest workshop](https://idea-quest-ai101.vercel.app/) without changing the pinned visual assets. The launcher started one watcher in the local check, and I later reported that the post-login update appeared. The latest recorded usability pass reported **24 automated tests** passing and desktop plus 390px emulated-phone walkthroughs. After the Step 4 tracker change, **four tracker tests** passed. The publisher log recorded a validated deployment and live status-hash verification on October 15; it also recorded a temporary-stage cleanup `EPERM` warning **after** live verification. [[AI 101/Project 2/idea-quest-three-spike/README.md|Publisher details]] · [[AI 101/Project 2/idea-quest-three-spike/usability-audit-2026-10-15.md|Usability evidence]]

For the October 20 label correction, **26 workshop tests and four tracker tests passed**. The status-only publisher verified its staged package, promoted it, and verified the live status hash. The [live public summary](https://idea-quest-ai101.vercel.app/projects.json) then matched the registry: idea.quest `complete` **5/5**, Gaze `active` **2/5**, Image Palette Studio `revisiting` **5/5**; Project 1 remains unscored **0/0**. Pinned visual assets were not changed by this status-only publication. A temporary-stage cleanup `EPERM` warning appeared **after** live verification; it remains a cleanup issue, not a failed publication. No gate counts or approvals were changed.

These checks do not establish long-term unattended reliability, physical-phone frame rate, broad browser/device behavior, full-length focus sessions, hardware sound quality, or a full security review. The monitor still needs this Windows computer and the Vercel CLI session. A separate Project 3 rerun has **not** happened yet.

## What I learned about my workflow

**Human check is the step that needs the most judgment.** A working and published prototype was not enough: I had to reject the manual-publishing boundary and choose a smaller status-only route. An agent may surface evidence, limits, and alternatives, but it must not decide that I accept a boundary or advance the gate for me. I chose to stop this pass after that bounded route worked; any new feature should reopen feasibility, prototype, and human check rather than silently extend the finished run. [[AI 101/Project 2/ai-use-log.md|Project 2 AI use log]]

## Handoff limits

The public site is read-only for visitors. Status automation does not publish website design/code changes. If a future status edit does not appear, compare the project journal with the local source and inspect `%LOCALAPPDATA%/AI101Projects/idea-quest-status-publisher/publisher.log`. The course repository was pushed after the original October 15 audit, but that does not replace a disclosure review before submission.
