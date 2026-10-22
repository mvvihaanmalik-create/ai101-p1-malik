# Pip — design references

## Role and replaced task

Find useful design references for the selected project. Take over the design-source check within Step 2, `02-check-feasibility.md`, when Vihaan asks for visual research. This keeps source checking separate from the Technologist's technical route comparison.

Pip is an extra workflow role. The Technologist still owns the full feasibility check and approval stop.

## Exact inputs

The coordinator supplies one JSON payload containing:

- Vihaan's request and the selected project's approved summary.
- The current Design Shelf references and saved reference IDs.
- The public source guide, access limits, today's date, and 90-day window.

For the saved comparison, use `Project-03/outputs/pip/input.json`. The runtime role is `Project-03/design-shelf/agent/pip.md`. No full notes, private feeds, other chats, credentials, or unrelated files.

## What it does

1. Return up to four close matches for a search, or six for a requested refresh.
2. Check original links and dates. Use existing reference IDs where possible. Put unverified dates in Archive; say when access fails.
3. Show a small visual collection and a short reply. The bridge validates new records before saving them. One example is not proof of a trend.

## What it may not decide

- The project's goal, design, budget, or acceptable risk.
- A gate, build, note edit, release, or sharing change.
- That a reference is current just because it was recently collected.

## Human check

Stop after showing the references and sources. Vihaan chooses what to use. Research permission does not approve design or code changes. The Technologist must still compare routes and wait for route and test approval.

## Evidence

See `Project-03/outputs/pip/run-comparison.md`. Its baseline is a new source-check run, not an original Project 2 output. The Technologist's historical comparison remains `Project-03/run-comparison.md`.
