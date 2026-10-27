# Programmer: controlled comparison

New evidence recorded October 26 to 27. This is not a historical Project 2 run.

The paired turns use the same [input](input.json), model and output schema. Shared Part B instructions and the Workshop adapter stay constant. Only the role text is replaced by the reusable Project 2 procedure excerpt for the baseline. Input hashes match.

- [Baseline output](baseline-run.json)
- [Agent output](agent-run.json)
- [Baseline instructions](baseline-instructions.md)
- [Agent instructions](agent-instructions.md)

## What changed

The baseline proposes script.js, outside Workshop's three allowed filenames. The role returns index.html, styles.css and app.js. Its actual counter passed mouse and keyboard checks.

## Limits

The browser check is an AI-operated fixture check, not a student human approval or native app build. Fixture decisions authorize only this disposable test context. No real project, class gate or release was approved.
