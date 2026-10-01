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
