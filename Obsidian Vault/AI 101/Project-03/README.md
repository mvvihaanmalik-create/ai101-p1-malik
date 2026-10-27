# Project 3: Extend and Encode

[Course brief](https://ai-101-v4.vercel.app/projects/project-3) · [Live Workshop](https://ideaquest-workshop.vercel.app/) · [Final check](final-check.md)

## The assignment

- **Part A:** [Technologist](workflow-agent.md) replaces the feasibility step. [Pip](design-shelf-agent.md) handles asset research. Each has a role, inputs, limits, and a human stop.
- **Part B:** [Vault agent](vault-agent/AGENTS.md), [voice](vault-agent/voice-profile.md), [five rules](vault-agent/hard-rules.md), and the [IdeaQuest skill](vault-agent/skills/ideaquest-project-workflow/SKILL.md).
- **Workshop:** the interface connecting the roles. It is the wider systems-design work, accepted by the professor according to Vihaan.

An agent owns a role and its boundaries. A skill is a reusable procedure the agent can run. The interface helps use both.

## Evidence

| Record | What it shows |
|---|---|
| [Audit](audit-note.md) | Stress test, fix, same-input rerun. Completed after the agents; late timing is disclosed. |
| [Technologist comparison](run-comparison.md) | Historical Project 2 output against the scoped agent run. Both copies also sit in Project 2/outputs. |
| [Pip comparison](outputs/pip/run-comparison.md) | A new controlled source-check pair from October 22. It predates the current asset pipeline. |
| [Testing log](testing-log.md) | Full failed replies, fixes, reruns, instruction snapshots and limits. |
| [Intent](intent-statement.md) | Purpose, scope and the later Pip confirmation. |
| [AI-use log](ai-use-log.md) | Prompts, outputs, decisions, corrections and gaps in the older record. |
| [Disclosure](disclosure.md) | What AI made and what Vihaan supplied. |
| [Defense notes](defense-notes.md) | Short practice notes and file links. |

## Current app

Workshop, idea.quest and Shelf share project selection inside one app. Agents run on the PC. Shelf's public asset collection refreshes in the cloud on Sundays, with 10 starting picks per category and up to five replacements each week. Saving an asset is separate from approving its Creative Partner handoff.

[App instructions](workshop/README.md) · [Pip instructions](design-shelf/README.md) · [Workflow diagram](../Project%202/diagram.md)

[All six agents: status and evidence](agent-status.md)

Both Claude and Codex have matching runnable skill copies and scoped loaders. [Native setup record](outputs/part-b/native-setup-check.md). Vihaan has confirmed the menu and identity reply in a new chat.

## Before submission

Check the remaining items in [final-check.md](final-check.md). Use the named copies in `submission-draft/` after those items are complete. Runtime files such as AGENTS.md and SKILL.md keep their required names. Do not rename the working vault files or upload private runtime folders.

The live defense and instructor-repository submission have not happened yet.
