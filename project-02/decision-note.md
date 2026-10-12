# Decision note

## The gap

I wanted a workflow that checks tools, alternatives, operating-system limits, and feasibility before I spend hours or tokens on an AI-assisted coding idea. The first run built that workflow, but I only tested it on my broad problem from `intent.md`, not on a specific project. It showed that the workflow notices missing inputs (the idea, the operating system, the budget) and stops. It did not show that the workflow can judge whether a real project is feasible.

My explanation is that step 3 ran on my general problem instead of a concrete idea. That is my reading of the gap, not something I tested.

## My fix

I ran the same five steps again on one concrete idea: a web app that pulls a palette out of an image and recolors a website preview with it (Image Palette Studio). I would build it on Windows and it had to open on a phone. My time and token budget stayed unknown, and I said so instead of guessing.

- **Step 2** compared three routes against MDN, GitHub, Cloudflare, and W3C documentation before any code existed, and named the smallest test that could disprove the plan.
- **Step 3** built only that test.
- **Step 4** is where I rejected the generic visual design and approved one bounded revision.
- **Step 5** is where I stopped, with the untested parts written down.

Both runs are in `outputs/`: `run-1-first-run-generic-dry-run` and `run-2-revised-run-image-palette`.

## Why

After the first run I decided more edits to the generic workflow were not worth it until the steps had been tried on a real project. Inventing a sample project would have added the assumptions the workflow is supposed to expose. A real idea let the feasibility step and my own review step do real work: the route was chosen before building, and my objection to the design changed what got built.

## What is still open

- The image palette idea turned out to be feasible, so this run did not show the workflow talking me out of a bad idea. That needs a riskier idea.
- The phone result is my own report. The tests were simulated-pixel checks, not a full browser, accessibility, or privacy test.
- I started two more runs afterward (an Obsidian image-grading plugin and the idea.quest tracker redesign). They only got through steps 1 and 2, so they sit in `outputs/extra-partial-runs/` and are not part of the comparison.
