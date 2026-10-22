# Project 3 packet

Every file you need for Project 3 is in this folder, in the order you use them. The full brief is on the course site: [Project 3, Extend and Encode](https://ai-101-v4.vercel.app/projects/project-3).

## Import it

1. Unzip the packet.
2. Drag the `project-03` folder into your Obsidian vault, next to your `project-02` folder.
3. Open this file in Obsidian.

## Your files

| Class | File | What you do |
|---|---|---|
| 9 | `audit-note.md` | Stress-test your Project 2 workflow. Fix one thing. Write what you learned. |
| 10 | `intent-statement.md` | Say what you are building and why, before you build. |
| 10 | `workflow-agent.md` | Part A. Write the agent file. Save a copy in your Project 2 folder as `agents/[role].md`. |
| 10 | `run-comparison.md` | Compare your Project 2 run to your agent run. Save both in `outputs/`. |
| 11 | `vault-agent/AGENTS.md` | Part B. Name the agent's identity, permissions, and limits. |
| 11 | `vault-agent/voice-profile.md` | Five lines, written from scratch. |
| 11 | `vault-agent/hard-rules.md` | Five rules in your own words. One is a teaching rule. |
| 11 | `vault-agent/skills/skill-name/SKILL.md` | Encode your Project 2 workflow. Include one complex step. |
| 11 | `testing-log.md` | Log the caught-violation demo and the fresh-input test. |
| 9 to 12 | `ai-use-log.md` | Log every prompt, output, and decision. |
| 12 | `defense-notes.md` | Plan your live defense. |
| 12 | `disclosure.md` | State what AI contributed and what you decided. |
| Extra agent | `design-shelf-agent.md` | Pip: a project-aware visual design library with specific searches and manual refreshes. |

## Part A: both roles

- **Technologist:** [role](workflow-agent.md), [original and agent comparison](run-comparison.md). This is the required full workflow-agent example.
- **Pip:** [role](../Project%202/agents/Pip.md), [new controlled comparison](outputs/pip/run-comparison.md). This extra role handles design sources within Step 2. Its baseline is new, not a historical Project 2 run.
- [Start file](../Project%202/00-start-here.md) calls both roles. Vihaan still chooses the design, route, and test.

The saved Part A runs are evidence for review. Part B tests and the separate workflow audit are linked below.

## Part B: current work

The [testing log](testing-log.md) now contains actual caught-violation and fresh-input exchanges, including the failed first teaching stop and reruns. [Results and remaining fixes](outputs/part-b/results.md) distinguish completed turns from held rules. The root-vault loader and skill copy are installed. The rules now use Vihaan's requested style and preserve technical context during teaching; AI wording assistance is disclosed. Revision 2 keeps the example checks unknown and defers implementation claims. Shorter replies, a direct Claudian menu check after restart, and Vihaan's defense of the test decisions remain open.

## Audit and defense

The [workflow audit](audit-note.md) now includes a new same-input before/fix/after pair. Only the Project 2 start file changed; the original step and historical outputs were preserved. It was completed October 22 after the agent builds, so it is labelled as a late audit. [Defense notes](defense-notes.md) use the saved evidence and Vihaan's reflection about slowing down instead of rushing.

Replace every `[bracketed placeholder]` with your own words. Delete the italic guidance lines before you submit.

## Submit

Keep these file names while you work. When you submit, rename each file to `AI101_P3_[Last]_[First]_[Artifact].ext`. Rename inside Obsidian so your links update. Push the folder to the GitHub repository you share with the instructor. If GitHub is not available to you, ask for the approved equivalent channel.

## Privacy

Use only material you have permission to share. Do not put grades, finances, health information, or anyone else's personal information in this folder.
