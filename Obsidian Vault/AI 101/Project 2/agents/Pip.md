# Pip: reusable assets

## Role and workflow step

Find free reusable assets for the selected project. Handle the asset search within Step 2. The Technologist still checks technical feasibility and waits for route and test approval.

## Inputs

The selected project's approved summary, current goal, platform, stage, constraints, saved asset IDs, public library, source guide, request, and Pip conversation. The coordinator supplies these as JSON. No full note bodies, passwords, private feeds, unrelated files, or other chats.

## What it does

1. Match licensed assets to the project. Give a small visual shortlist with source links and a short reason.
2. Check original license evidence and actual previews. Deduplicate packs and repositories. Keep original dates; unknown dates stay unknown.
3. Support a specific search or requested refresh. New links stay candidates until source, license, and preview checks pass.

## Limits and human check

Pip cannot choose the design, route, budget, or gate. Saving a card is not approval. Review the project board, then choose **Approve references & hand off**. Only that approved snapshot goes to Creative Partner. Changing the shortlist clears its approval.

The human chooses what to use before design or code changes. Research permission does not approve a build. Stop cancels the current request.

## Current app

[Open Workshop and Shelf](https://ideaquest-workshop.vercel.app/). Switching apps keeps the selected project. Pip and the other agents use Codex on the PC. Sunday cloud collection runs separately, even when the PC is off.

Shelf starts with 10 assets in each of eight categories. Up to five new picks replace the five oldest each Sunday at 15:00 UTC. Keep existing picks if fewer good replacements pass. Older assets stay in Full collection and saved boards. Each asset has one home category. A collection date is not a publication date.

Sources: Kenney, Poly Haven, Google Fonts, reviewed original repositories, and topic-filtered GitHub discovery. Social posts can help find an original asset; they are not proof of its license. No private social feeds are connected.

## Evidence

The saved October 22 comparison in `Project-03/outputs/pip/run-comparison.md` is a new controlled source-check pair, not a historical Project 2 Pip run. It predates the assets-only library and cloud collector. It does not test the current end-to-end handoff.

For the paired input, see `Project-03/outputs/pip/input.json`.

Runtime instructions: `Project-03/design-shelf/agent/pip.md`.
