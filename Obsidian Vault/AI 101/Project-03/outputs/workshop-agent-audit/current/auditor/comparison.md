# Auditor: controlled comparison

New evidence recorded October 26 to 27. This is not a historical Project 2 run.

The paired turns use the same [input](input.json), model and output schema. Shared Part B instructions and the Workshop adapter stay constant. Only the role text is replaced by the reusable Project 2 procedure excerpt for the baseline. Input hashes match.

- [Baseline output](baseline-run.json)
- [Agent output](agent-run.json)
- [Baseline instructions](baseline-instructions.md)
- [Agent instructions](agent-instructions.md)

## What changed

Both distinguish source review from unrun browser checks. The role covers more review areas. A separate broken-counter input produced a blocking fail.

## Limits

Auditor supports technical evidence in Step 3. It does not replace the human-check step. Fixture decisions authorize only this disposable test context. No real project, class gate or release was approved.
