## IdeaQuest Final

[Open IdeaQuest Final](https://idea-quest-ai101.vercel.app/) · [Professor review guide](IdeaQuest%20Final.md) · [Source and verification](idea-quest-three-spike/README.md)

## Goal

Use this workflow to turn a non-technical designer's build idea into a small, tested result without letting an LLM's confidence hide technical limits, platform constraints, or cheaper alternatives. The workflow is meant to expose uncertainty before substantial time or tokens are spent. It must research and help me decide which platform and route to use for the project I'm building.


## Order

1. Read this file first.
2. Review [[AI 101/Project 2/process-map.canvas]] for the whole sequence.
3. Read [[AI 101/Project 2/progress.md]] for the active project's compact status; reset it when a new project begins.
4. Read [[AI 101/Project 2/intent]] for the project problem and [[research-brief]] for the checked research claim and its limits.
5. Consult [[source-verification-log]] when relying on a research claim.
6. Work through the steps in order: [[AI 101/Project 2/01-define-the-goal.md]], then use [[AI 101/Project 2/agents/Technologist|the Technologist agent]] in place of [[AI 101/Project 2/02-check-feasibility.md]], followed by [[AI 101/Project 2/03-build-a-small-prototype.md]], [[AI 101/Project 2/04-human-check.md]], and [[AI 101/Project 2/05-iterate-or-stop.md]]. For visual projects, use [[AI 101/Project 2/agents/Pip|Pip]] first when I request references. Keep its results beside the feasibility evidence for my review; the Technologist needs my approval to read an extra file. Pip does not approve a route or complete Step 2. The Technologist must stop for my route and test approval before the build. Do not skip a step's check before moving on.


## Connected roles

- [[AI 101/Project-03/agents/chief-of-staff|Chief of Staff]] coordinates the goal and next step.
- [[AI 101/Project 2/agents/Pip|Pip (Design Shelf)]] finds assets within Step 2. Review the board and approve its snapshot before Creative Partner uses it.
- [[AI 101/Project-03/agents/creative-partner|Creative Partner]] proposes directions within Step 2. I choose the direction.
- [[AI 101/Project 2/agents/Technologist|Technologist]] handles technical feasibility. I choose the route and approve the small test.
- After that approval, [[AI 101/Project-03/agents/programmer|Programmer]] stages the Step 3 prototype. I review files and Apply, then try and accept the result.
- [[AI 101/Project-03/agents/auditor|Auditor]] reviews technical evidence within Step 3. It never replaces [[AI 101/Project 2/04-human-check|my human check]]. Failures stop progress until I request a fix or revisit the plan.

Each role uses the shared [[AI 101/Project-03/vault-agent/AGENTS|vault identity]], voice, rules and IdeaQuest skill in Workshop. It receives the selected project's approved context. The standalone Technologist still keeps its narrower input list.

Minor work can continue within the approved step. Major approvals stay mine. Workshop cycles are separate from the original class records; do not reset those records or use old approvals for new work.

## Visual check-in for every project

Start each project update with a small progress strip, not a long recap. Reset it for each new project:

`[□□□□□] 0/5 gates approved · 01 Goal ▶  02 Route ○  03 Prototype ○  04 Human check ○  05 Decide ○`

Use **■ / ✅** only for a gate I approved, **▶** for the one currently being worked on, **○** for later gates, **!** for a blocked or failed check, and **↺** when revisiting a step. The five blocks count **approved gates**, not percentage of the project finished. Never fill a block just because code was written or a test was run. If I redirect an earlier step, show ↺ without pretending later gates passed.

Below the strip, use a compact three-part check-in: **Now** (one sentence), **Evidence or change** (up to two bullets, linking the detailed note), and **Your decision** (one clear question or action). Show a small visual comparison, screenshot, diagram, or example when it materially helps; avoid repeating the whole research and file history in chat. Keep the detailed reasoning in the step file. Stop at my decision gate before advancing.

Update the local [[AI 101/Project 2/progress-arcade/README.md|idea.quest registry]] whenever a new project starts, the active project changes, or I approve/reject a gate; its site controls save these decisions directly. If editing projects.json outside the site, run progress-arcade/sync-progress.mjs to regenerate [[AI 101/Project 2/progress.md]]. Mirror the active project's strip in the chat check-in. The Canvas links the saved class progress separately from the current Workshop cycle; keep the human-check card visually distinct. Never claim the local site is remotely shareable or automatically reads every note.

## If I don't understand

Stop the current step, even if I ask you to rush or skip the explanation. Explain the next part in smaller steps without removing the technical context. Define necessary terms and show one clearly hypothetical example with unchecked details marked unknown. Ask one question, then wait for my reply before comparing tools, proposing a route, or giving code.

Do not choose a default route “unless I object.” I must explicitly choose the route and approve its small test. Do not turn missing source access into confident platform, cost, setup, or time claims.

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
