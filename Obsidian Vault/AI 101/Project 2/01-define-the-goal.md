## Starts from

An idea or problem in my own words, including any examples or inspiration I already have. Unknowns are allowed; do not treat guesses as requirements.

## Does

1. Restate the problem and intended user in plain language.
2. List the main behavior, inputs, outputs, and must-have constraints.
3. Separate must-haves from nice-to-haves and out-of-scope ideas.
4. Mark assumptions and unanswered questions; ask me to resolve decisions that materially affect scope.
5. Turn success into observable criteria that can later be tested.

## Good looks like

The goal is short and specific; success can be recognized; scope is bounded; platform, audience, and known constraints are recorded; and uncertain details are labeled rather than silently invented.

## Check

I confirm that the restated goal, priorities, and success criteria match what I want. If they do not, revise this step before assessing feasibility.

## Earlier workflow-design run — approved

**Goal:** Create a repeatable LLM-assisted workflow that helps a non-technical person decide whether and how to begin a coding project before spending substantial time or tokens. It should clarify requirements, reveal tool and operating-system constraints, compare realistic routes, and require a small human-verified test before expanding a prototype.

**Audience:** Me, when I have an idea but am not yet sure what technical requirements, tools, or implementation route it needs.

**Inputs:** An initial idea and desired outcome; examples or inspiration; the intended operating system and environment; available tools, permissions, time, and token or money budget. The specific project idea and some environment/budget details are not yet known.

**Must-have:** Expose assumptions and unknowns; check feasibility before a larger build; compare at least one realistic alternative; propose a small test for the biggest risk; distinguish verified facts from estimates; leave go/no-go decisions to me.

**Nice-to-have:** A reusable checklist and evidence links that can be revisited as tools or platform requirements change.

**Out of scope:** Guaranteeing a project will succeed; choosing or deploying a solution without my approval; building a particular application now, since no specific application idea has been selected for this workflow exercise.

**Success criteria:** Given a future project idea, the workflow should produce a bounded goal, identify platform/tool/resource assumptions and uncertainties, compare routes, name a smallest feasibility test, and wait for my review of that test before substantial prototyping.

**Open details for a future test run:** A concrete project idea, operating system/device, and acceptable time/token budget. These details do not prevent defining this workflow, but will matter when using it on a real project.

**Status:** This earlier workflow-design goal was approved and saved in [[AI 101/Project 2/outputs/01-define-the-goal.md]]. The new app idea below is a separate run of this workflow.

## New run: image-palette website preview — Step 1 draft (2026-10-08)

**Goal:** Make a small web app where I choose one image, see a short palette of its main colors, and try those colors on a simple website preview before committing to a design direction.

**Audience:** Me as a non-technical designer testing color directions; other users or public sharing are not yet requirements.

**Inputs and outputs:** Input is one image selected from my device. Output is a few visible color swatches plus a simple page preview whose colors I can change. The number of swatches and exactly how I assign them are still decisions to make.

**Must-have for the first version:** Select an image; extract and display its main colors; apply those colors to at least the preview's background, text, and accent/button roles; visibly update the preview when a choice changes. Keep the prototype small enough to test before adding more features.

**Possible later features, not assumed for the first version:** Copy color codes, save/export palettes, accessibility or contrast guidance, more page layouts, accounts, or sharing.

**Observable success:** With a test image, the app displays a compact palette that I recognize as representing important colors in that image. I can try those colors on the preview and see the background, text, and accent/button areas change. Unsupported inputs or failures should be visible rather than silently producing a misleading palette.

**Open decisions:** (1) Should colors be placed on the preview automatically, chosen manually for each role, or both? (2) Is this only for use in my own browser, or should it be shareable online? (3) What device/OS/browser must it run on, and what time or cost limit should guide the “easiest way” choice? No image format, extraction method, programming framework, or hosting platform is chosen yet.

**Status:** Draft for my review. Stop after Step 1; do not compare tools or start building until I confirm or correct this scope.
