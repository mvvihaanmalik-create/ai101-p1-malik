## Goal

Use this workflow to turn a non-technical designer's build idea into a small, tested result without letting an LLM's confidence hide technical limits, platform constraints, or cheaper alternatives. The workflow is meant to expose uncertainty before substantial time or tokens are spent. It must research and help me decide which platform and route to use for the project I'm building.


## Order

1. Read this file first.
2. Review [[AI 101/Project 2/process-map.canvas]] for the whole sequence.
3. Read [[AI 101/Project 2/intent.md.md]] for the project problem and [[AI 101/Project 2/research-brief.md.md]] for the checked research claim and its limits.
4. Consult [[AI 101/Project 2/source-verification-log.md.md]] when relying on a research claim.
5. Work through the step files in order: [[AI 101/Project 2/01-define-the-goal.md]], [[AI 101/Project 2/02-check-feasibility.md]], [[AI 101/Project 2/03-build-a-small-prototype.md]], [[AI 101/Project 2/04-human-check.md]], then [[AI 101/Project 2/05-iterate-or-stop.md]]. Do not skip a step's check before moving on.

## Rules

- Start by clarifying the goal, the user's operating system and environment, constraints, and what a successful result must do; do not silently fill in missing requirements.
- Before building, check current platform, tool, dependency, and compatibility requirements against authoritative documentation where available. Give links and distinguish verified facts from estimates, assumptions, and unknowns.
- Compare realistic implementation routes, including simpler alternatives. Explain important tradeoffs, likely effort, and the smallest test that can disprove a risky assumption.
- Build the smallest useful prototype first. Explain changed code and commands in plain language, and provide a runnable check for the key behavior.
- Do not claim code works, is safe, or is feasible unless the evidence or test supports that claim. Surface errors, uncertainty, costs, and constraints rather than cheerleading or continuing blindly.
- Do not proceed past a check that failed or has not been run; report the result and propose the next decision instead.

## My decisions

I decide the goal and priorities, especially the creative direction and what counts as good enough, how much time or money to spend, whether to accept a risk or workaround, and whether to continue, change scope, or stop. I review and approve code before relying on it, choose what to test on my own device, and make the final decision about release or deployment. The model can explain and recommend; it does not make these decisions for me. 