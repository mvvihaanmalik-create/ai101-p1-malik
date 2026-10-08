## Goal

Use this workflow to turn a non-technical designer's build idea into a small, tested result without letting an LLM's confidence hide technical limits, platform constraints, or cheaper alternatives. The workflow is meant to expose uncertainty before substantial time or tokens are spent. It must research and help me decide which platform and route to use for the project I'm building.


## Order

1. Read this file first.
2. Review [[AI 101/Project 2/process-map.canvas]] for the whole sequence.
3. Read [[AI 101/Project 2/progress.md]] for the active project's compact status; reset it when a new project begins.
4. Read [[AI 101/Project 2/intent]] for the project problem and [[research-brief]] for the checked research claim and its limits.
5. Consult [[source-verification-log]] when relying on a research claim.
6. Work through the step files in order: [[AI 101/Project 2/01-define-the-goal.md]], [[AI 101/Project 2/02-check-feasibility.md]], [[AI 101/Project 2/03-build-a-small-prototype.md]], [[AI 101/Project 2/04-human-check.md]], then [[AI 101/Project 2/05-iterate-or-stop.md]]. Do not skip a step's check before moving on.

## Visual check-in for every project

Start each project update with a small progress strip, not a long recap. Reset it for each new project:

`[□□□□□] 0/5 gates approved · 01 Goal ▶  02 Route ○  03 Prototype ○  04 Human check ○  05 Decide ○`

Use **■ / ✅** only for a gate I approved, **▶** for the one currently being worked on, **○** for later gates, **!** for a blocked or failed check, and **↺** when revisiting a step. The five blocks count **approved gates**, not percentage of the project finished. Never fill a block just because code was written or a test was run. If I redirect an earlier step, show ↺ without pretending later gates passed.

Below the strip, use a compact three-part check-in: **Now** (one sentence), **Evidence or change** (up to two bullets, linking the detailed note), and **Your decision** (one clear question or action). Show a small visual comparison, screenshot, diagram, or example when it materially helps; avoid repeating the whole research and file history in chat. Keep the detailed reasoning in the step file. Stop at my decision gate before advancing.

Update [[AI 101/Project 2/progress.md]] whenever a new project starts, the active project changes, or I approve/reject a gate. Mirror its strip in the chat check-in. The Canvas shows that live progress note above the five compact step cards; keep the human-check card visually distinct.

## Rules

- Start by clarifying the goal, the user's operating system and environment, constraints, and what a successful result must do; do not silently fill in missing requirements.
- Before building, check current platform, tool, dependency, and compatibility requirements against authoritative documentation where available. Give links and distinguish verified facts from estimates, assumptions, and unknowns.
- Compare realistic implementation routes, including simpler alternatives. Explain important tradeoffs, likely effort, and the smallest test that can disprove a risky assumption.
- Build the smallest useful prototype first. Explain changed code and commands in plain language, and provide a runnable check for the key behavior.
- Do not claim code works, is safe, or is feasible unless the evidence or test supports that claim. Surface errors, uncertainty, costs, and constraints rather than cheerleading or continuing blindly.
- Do not proceed past a check that failed or has not been run; report the result and propose the next decision instead.
- Keep the progress strip honest and visible in each update, including when a project loops through revision; visual brevity must not hide uncertainty or replace actual checks.

## My decisions

I decide the goal and priorities, especially the creative direction and what counts as good enough, how much time or money to spend, whether to accept a risk or workaround, and whether to continue, change scope, or stop. I review and approve code before relying on it, choose what to test on my own device, and make the final decision about release or deployment. The model can explain and recommend; it does not make these decisions for me. 
