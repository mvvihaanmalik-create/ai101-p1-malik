# Run comparison — idea.quest feasibility

This is the Technologist comparison. Pip has a separate [source-check comparison](outputs/pip/run-comparison.md), recorded October 22. Pip supports one part of Step 2; it does not replace this full feasibility example.

## The two runs

| | Project 2 run | Technologist rerun |
|---|---|---|
| Saved output | `outputs/p2-run.md` | `outputs/agent-run-claudian.md` |
| Input | `Project 2/outputs/idea-quest/01-define-the-goal.md` | Same goal file |
| Step | `Project 2/02-check-feasibility.md` | `Project 2/agents/Technologist.md` |

## What changed

Both runs recommended a layered 2.5D first prototype and compared it with Canvas and Three.js. The Project 2 run included local app and environment evidence. The agent stayed within its allowed files and found a mismatch: the goal describes idea.quest as 0/5, while the approved goal gate makes it 1/5. It also proposed starting with one real data-linked jar.

The effort estimates differed: the original estimated 3–6 hours for a simple Route A spike; the agent estimated 1–3 developer days for an unpolished functional slice. Neither estimate was measured, and the scopes may differ.

## Better or worse

The original run gave more project-specific route advice because it included app evidence. The agent did a better job of flagging the 0/5 versus 1/5 mismatch and keeping its recommendation separate from my later Route C decision. Both outputs name the same major routes and keep the approval gate with me. Neither proves phone performance or completes the proposed prototype test.

## What I would change next

Allow the agent to read a short, current app data-flow note when a task needs implementation context. Keep the goal file as the shared input, and require the agent to flag conflicts instead of silently choosing a value.
