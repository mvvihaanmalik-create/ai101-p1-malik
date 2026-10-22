# Pip run comparison

Recorded October 22, 2026. Extra Part A role; the [Technologist](../../run-comparison.md) remains the full workflow example.

## Same input, different role

Both runs used [this request](request.md), the same [input](input.json), the same JSON format, and `gpt-6-astra` in fresh Codex conversations. Only the role instructions changed. Neither could edit the library or notes.

The [baseline](baseline-run.md) applies the original Step 2 source-check instruction to this design task. It is a **new controlled baseline**, not a historical Project 2 run or a full feasibility check. The [agent run](agent-run.md) uses Pip's saved runtime role.

## What changed

| Result | Baseline | Pip |
|---|---|---|
| Existing card IDs | 4 | 4 |
| Full records repeated | 4 | 0 |
| Reply | 6 sentences | 2 sentences |
| Glass reference | HAOQI case study | Apple platform update |

Both chose Goodgrowth, Framer Pinned Projects, and Framer Skills. Both said readability was untested. The selected dates and main source claims were checked separately in [source-check.md](source-check.md).

## Better or worse

Pip fits the library better: four card IDs, no duplicate records, and a shorter reply. The baseline gives more useful caveats about mobile use and source limits. Pip's first sentence is still too packed, and “all dates are verified” is too confident for the limited search record. The separate source check supports those dates; it does not prove Pip checked every page itself.

## Next change to try

Keep links and dates on cards. Use the reply for one useful caveat. Require source-by-source check results before claiming all dates are verified.

Two earlier attempts failed before research: the installed Codex version rejected an old permission field, then rejected the configured model. Those failures are saved in `attempt-1/` and `attempt-2/`. The successful pair used a restricted permission profile and the available catalog default.

This is one request. It does not prove refresh scheduling, library writes, inaccessible-source handling, or the popup's full flow. No design or gate was approved.
