---
name: ux-trend-scout
description: Open or refresh Design Shelf, a visual design reference library matched to the current project.
---

# Design Shelf

## Open the collection

1. Read `Project-03/vault-agent/hard-rules.md` and `voice-profile.md`.
2. Use the named project or the current project note. Ask only if it is unclear.
3. Open [Design Shelf](https://design-shelf-vihaan.mv-vihaanmalik.chatgpt.site). Add `?project=` with the exact project ID when known. The site requires the owner's ChatGPT login.
4. Let the library show the references. Reply with the link and at most one short sentence.

## Refresh when asked

- Read the current library, project summary, and `/api/update-guide`. Use the connected Site tools or an authorized Site service connection. If neither is available, say so; do not claim an update.
- Find original UI, UX, interaction, and motion examples from the last 90 days. Match the project's type, platform, and current focus. Include useful variety across Plugins, Games, Websites, Apps & tools, AI agents, and Creative.
- Use real source links, original dates, and actual publisher previews. Label case-study dates. Put undated finds in Archive. Deduplicate by canonical source URL and preserve saved references.
- LinkedIn and X are optional public sources. Do not claim private feed access or call a single example a trend.
- Write through `upsert_design_references` or the authorized `/api/references` endpoint, then read back. On failure, keep the last good collection and state the blocker briefly.
- Return the collection link and the number added. Do not write a long research brief unless asked.

## Notes and limits

Selected project titles, goals, current focus, tags, platforms, gate counts, and note links may sync to this owner-private Site. That destination and scope were approved. Full note bodies, logs, credentials, and unknown properties stay local. Never put project summaries in the source repository or build. Never change gates, source notes, or sharing through this skill.

References refresh on the 1st and 15th at 9 am America/New_York. The local note bridge runs while Windows and the network are available. A manual refresh rereads saved data; it does not start a web search.

## Pip popup

Use the small Pip button for a specific search or choose **Find fresh references** for new web research. The popup uses its own Codex conversation through the local PC bridge. The header opens the separate desktop follow-up chat; the histories are separate. The agent definition is `Project-03/design-shelf-agent.md`.

