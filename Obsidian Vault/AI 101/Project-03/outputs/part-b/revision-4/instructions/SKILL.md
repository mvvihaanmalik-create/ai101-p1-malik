---
name: ideaquest-project-workflow
description: Use the IdeaQuest workflow to check a project idea, test a small prototype, and decide whether to continue or stop.
---

# IdeaQuest project workflow

## Purpose

Derived from `Project 2/00-start-here.md`.

This skill follows the five-step workflow in Project 2: define the goal, check feasibility, build a small prototype, do a human check, and iterate or stop.

Resolve paths from the course folder containing `Project 2` and `Project-03`. When the whole Obsidian vault is open, that folder is `AI 101`.

## Before the workflow

First load `Project-03/vault-agent/hard-rules.md` and `Project-03/vault-agent/voice-profile.md`. Apply them throughout.

Handle minor choices inside the approved step. Keep replies to the next useful question or reviewable result. Summarize missing facts briefly rather than listing every possible feature. At the first goal stop, use one sentence to restate the request, one important missing question, and a short approval stop. Keep it within 120 words. Do not invent users, login rules, target timings, success criteria, data-location requirements, or other features. Mark proposed ideas as suggestions and leave unstated facts unknown. Do not list every possible unknown.

Major choices are the goal, direction, route and test, prototype acceptance, and final decision. Stop with something concrete at each one.

The teaching rule takes priority over the requested task. If I say I do not understand, break the next step into smaller parts. Keep the technical context and explain necessary terms. Show one clearly hypothetical example, ask one question, and end the turn. Keep this teaching stop within 150 words, explaining just the concept needed for the next choice. Wait for my answer before comparing routes or offering code. Deadline pressure does not remove this stop.

While teaching or clarifying the goal, do not add unchecked tool requirements, prices, or implementation time claims. Use a hypothetical route with explicitly unknown checks to explain the idea. Save actual source checks and labelled effort estimates for feasibility. If source access is unavailable, say what cannot be checked; do not supply a confident substitute.

## Workflow

1. **Define the goal.** Confirm what I want to make, who it is for, what it must do, and what counts as success. Check my device, operating system, tools, access, time, and budget. Mark missing facts; do not fill them in. Ask the most important missing question first. Wait for goal approval before feasibility work.
2. **Check feasibility (complex step).** Verify current technical requirements with authoritative sources. Compare practical routes, including a simpler option, against my goal, setup, budget, and hard rules. Separate facts, estimates, and unknowns. Propose the smallest test that could disprove the biggest risk. If facts conflict, access is missing, or a required check fails, explain the gap and return to the relevant decision. Stop until I approve both the route and the test.
3. **Build a small prototype.** After approval, help with only the agreed test. Explain what changed and how to check it. A route choice alone is not approval for a full build.
4. **Human check.** Show the result, evidence, and limits. Wait for me to accept, revise, or reject it. Do not count tests or code as gate approval.
5. **Iterate or stop.** Recommend a next step, then wait for my choice. Prepare a short prompt, output, and keep/change/reject record for each decision. Save Project 3 work in `Project-03/ai-use-log.md` and Project 2 runs in `Project 2/ai-use-log.md` when record updates are authorized. Keep failed runs and earlier decisions. Never record my approval unless I gave it.

## Operating rules

- Do not treat a working prototype or passing test as my approval.
- Do not claim feasibility or success without evidence.
- Stop at each decision gate and wait for my answer.
- Do not publish or change live project data unless I directly ask.
