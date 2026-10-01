## Starts from

The approved route and passed feasibility check in [[AI 101/Project 2/02-check-feasibility.md]], along with the goal and success criteria from Step 1.

## Does

1. Propose the smallest end-to-end slice that tests the core behavior.
2. Name the files, tools, and commands involved before making changes; explain unfamiliar terms in plain language.
3. Implement only what is needed for this test, keeping optional features out.
4. State assumptions and give a specific command or action to exercise the behavior.
5. Run the proposed check when possible and report the actual output, including failures; never describe an unrun test as passed.

## Good looks like

The prototype is small, directly tied to an approved success criterion, and has a repeatable test with a reported result. I can tell what changed and what the prototype has not yet proven.

## Check

Run the minimal test and compare its observed result with the chosen success criterion. If it fails, record the exact error and return to feasibility or revise the prototype; if it passes, send it to the human review in [[AI 101/Project 2/04-human-check.md]].

## Current workflow dry run — draft for human review

**Prototype slice:** A preflight intake gate for the workflow, asking for the concrete idea and desired behavior, success criteria, target OS/device, available tools or permissions, time/token budget, and the riskiest technical assumption. The model should stop and label missing inputs instead of claiming project feasibility.

**Test input:** The broad problem in the intent note (ideas and added features are prototyped before tool, OS, resource, and time constraints are known), followed by “proceed” without a concrete coding idea or target-environment details.

**Expected behavior:** The workflow should recognize that the document-based planning method can proceed, but must not claim that an unspecified coding project is feasible; it should surface the missing details before implementation.

**Observed result:** The feasibility check identified the missing concrete project, target OS/device, and budget; it distinguished workflow-document feasibility from project-specific feasibility. No code was generated or tested.

**Test result and limits:** Pass for the narrow intake/gating behavior in this conversational dry run. This is not a code prototype and does not verify any real project's toolchain, OS compatibility, schedule, or technical feasibility; those require a specific project and environment.

**Status:** I accepted this limited dry run as Step 3's result (“ok”). Its output is saved in [[AI 101/Project 2/outputs/03-build-a-small-prototype.md]]. It is a workflow test, not a code prototype or a real-project feasibility result.
