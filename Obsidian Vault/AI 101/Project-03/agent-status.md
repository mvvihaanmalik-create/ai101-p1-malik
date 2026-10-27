# Agent status

Updated October 27. All six roles returned real Codex replies in a disposable counter project. Current Workshop instructions load the same vault identity, five user-written rules, voice and IdeaQuest skill for every role. No real project approvals changed.

| Role | Functional check | Part A evidence | Part B |
|---|---|---|---|
| Chief of Staff | Returned a goal draft and stopped for approval. | [New controlled pair](outputs/workshop-agent-audit/current/chief/comparison.md). | Shared identity, rules, voice and skill loaded. |
| Technologist | Compared routes, left effort unknown, supplied authoritative source cards. | [Historical comparison](run-comparison.md), plus [current live output](outputs/workshop-agent-audit/context-fix/tech/agent-run.json). | Same shared instructions and major stops. |
| Pip (Design Shelf) | Used the supplied project and verified assets; rejected a dependency conflict. | [Current controlled pair](outputs/workshop-agent-audit/context-fix/pip/comparison.md); [earlier pair](outputs/pip/run-comparison.md) retained. | Same shared instructions; separate reference approval before Creative Partner. |
| Creative Partner | Returned two directions from the approved fixture snapshot. | [New controlled pair](outputs/workshop-agent-audit/current/creative/comparison.md). | Same shared instructions; direction stays with the user. |
| Programmer | Returned the allowed three files. Counter worked with mouse and keyboard. | [New controlled pair and browser evidence](outputs/workshop-agent-audit/current/programmer/comparison.md). | Same shared instructions; stages a proposal, then waits for Apply and acceptance. |
| Auditor | Kept unrun interactions unknown and failed an intentionally broken counter. | [New controlled pair](outputs/workshop-agent-audit/current/auditor/comparison.md), plus [failure run](outputs/workshop-agent-audit/current/auditor/failed-check-run.json). | Same shared instructions. Human check remains human. |

## Fixes from this check

- Shared skill was missing from Workshop role context. All six now receive it with the vault identity.
- Pip was not receiving thumbnail-verification information. That field is now supplied; omitted information means unknown, not missing.
- Technologist had a source link only inside reply text. Its structured source cards are now required and appeared in the rerun.
- Four switching checks initially failed because the test harness omitted a shipped progress helper. The harness now executes that real helper. All 15 existing approval, bridge and switching checks passed.
- The start file calls all roles. Mermaid and Canvas show the asset approval, five gates, Apply, failures, fix loop and cloud/PC split.

## What this does not prove

These are bounded functional checks, not a guarantee for every project. Programmer currently makes browser prototypes only. Native apps, plugins, backends and hardware need separate tools and checks. Weekly cloud collection is configured and its endpoint was checked; the next scheduled Sunday run has not been observed yet.

The five new role comparisons are controlled baselines, not invented historical Project 2 outputs. Technologist remains the required historical Part A example. Shared Part B setup serves the whole team; it is not six unrelated vault agents.

## Native check completed

Native menu and identity: confirmed by Vihaan in a new chat. [Saved result](outputs/part-b/native-identity-result.json). Both Claude and Codex copies match and their scoped loaders are installed.

The menu and identity observations were supplied by Vihaan, not independently captured through UI automation.

## Still yours
1. Rehearse the caught violation, context choices and five rules in your own words. The shared-list explanation in the defense notes is an AI practice aid, not your recorded reflection.
2. Review the disclosure, do the live defense and submit both coursework folders to the instructor repository.

The late workflow audit remains labelled honestly. No retrospective edit can change its order.
