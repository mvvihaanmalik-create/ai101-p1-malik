## Starts from

A minimal prototype, its changed files, the test command, the observed test output, and any assumptions or limitations recorded in [[AI 101/Project 2/03-build-a-small-prototype.md]].

## Does

1. Ask the model to explain the important code and assumptions in plain language, without treating that explanation as proof.
2. Review whether the output matches the goal and whether the implementation appears relevant, understandable, and appropriately limited.
3. Have me run the check in my actual environment and inspect the result; verify any critical behavior independently where possible.
4. Test speed, check for lag and glitches, check and ensure responsiveness across platforms in the build if required.
5. Surface errors, privacy or security concerns, compatibility gaps, and anything not tested.
6. Record what I accept, reject, or need to investigate before further changes.

## Good looks like

I understand what the prototype does and does not do; the key behavior has been checked on the intended setup; evidence and remaining uncertainty are visible; and I can make an informed go/no-go decision. I am informed about further scope and improvements, and a genuine audit of where I stand at the moment with the build.

## Check

I personally confirm the observed behavior and decide whether it meets the success criteria. If the check fails or I cannot explain/reproduce the result, do not expand the prototype: capture the exact issue and return to feasibility or revise the code.

## Current human review — accepted for the workflow dry run

**Reviewed artifact:** The workflow intake dry run in [[AI 101/Project 2/outputs/03-build-a-small-prototype.md]].

**What was checked:** The actual conversation surfaced the missing project idea, target OS/device, and time/token budget rather than inventing a code project or asserting that one would work. The user accepted the dry run as Step 3's limited result, then revised this check to include speed/lag, responsiveness across platforms when applicable, and a more complete scope/build-status audit.

**Limits still visible:** This confirms only the workflow's missing-input gate in conversation. There is no actual code prototype, project-specific technical evidence, or test on a target device, so project feasibility remains unverified.

**Review:** The dry run is understandable and repeatable, and its narrow pass/fail boundary is explicit. The added performance and cross-platform checks are appropriate for a real software build, but are not applicable to this no-code workflow dry run. A real project/environment check remains necessary before the workflow can support a go/no-go coding decision.

**Status:** The user said “made the fixes. now on to the next one,” accepting the revised review and directing continuation. Step 4 is accepted for the workflow document and dry run only; no real project's code, performance, or cross-platform behavior has been verified.
