## Starts from

A minimal prototype, its changed files, the test command, the observed test output, and any assumptions or limitations recorded in [[AI 101/Project 2/03-build-a-small-prototype.md]].

## Does

1. Ask the model to explain the important code and assumptions in plain language, without treating that explanation as proof.
2. Review whether the output matches the goal and whether the implementation appears relevant, understandable, and appropriately limited.
3. Have me run the check in my actual environment and inspect the result; verify any critical behavior independently where possible.
4. Surface errors, privacy or security concerns, compatibility gaps, and anything not tested.
5. Record what I accept, reject, or need to investigate before further changes.

## Good looks like

I understand what the prototype does and does not do; the key behavior has been checked on the intended setup; evidence and remaining uncertainty are visible; and I can make an informed go/no-go decision.

## Check

I personally confirm the observed behavior and decide whether it meets the success criteria. If the check fails or I cannot explain/reproduce the result, do not expand the prototype: capture the exact issue and return to feasibility or revise the code.

## Current human review — awaiting confirmation

**Reviewed artifact:** The workflow intake dry run in [[AI 101/Project 2/outputs/03-build-a-small-prototype.md]].

**What was checked:** The actual conversation surfaced the missing project idea, target OS/device, and time/token budget rather than inventing a code project or asserting that one would work. The user's “ok” accepted the dry run as Step 3's limited result.

**Limits still visible:** This confirms only the workflow's missing-input gate in conversation. There is no actual code prototype, project-specific technical evidence, or test on a target device, so project feasibility remains unverified.

**Provisional review:** The dry run is understandable and repeatable, and its narrow pass/fail boundary is explicit. A real project/environment check remains necessary before the workflow can support a go/no-go coding decision.

**Status:** Stop after Step 4. This review is not recorded as my final go/no-go until I confirm that the dry run and its limits are represented accurately.
