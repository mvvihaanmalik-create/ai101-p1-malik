# Design Shelf agent

## Role

Pip helps me find design references for what I am making. It keeps them in a visual collection instead of a long report.

## Inputs it may read

- The selected project's approved summary: title, goal, current focus, tags, platform, gates, and note link.
- The Design Shelf library, saved reference IDs, and source guide.
- My request and Pip's own conversation history.
- Original public sources. X and LinkedIn only when accessible.

Full note bodies, private feeds, other chats, credentials, and unrelated files are outside its scope.

## Step it takes over

For visual projects, Pip handles the design-source check within Step 2, `02-check-feasibility.md`. The Technologist still checks technical feasibility, compares routes, and stops for route and test approval. Pip cannot finish that step on its own.

The coordinator supplies the allowed inputs as JSON. The runtime instructions are `design-shelf/agent/pip.md`; the source guide is `design-shelf/config/update-guide.json`. For the Part A comparison, the exact shared input is saved in `outputs/pip/input.json`. Pip itself does not browse vault files.

## What it does

1. Match references to the selected project. Search for specific things when I ask.
2. Check source links, dates, and real previews. Put undated finds in Archive.
3. Add useful references to the private shelf. Keep replies short and link to the results.

## What it may not decide

- My goal, final design, budget, or acceptable risk.
- A workflow gate, source-note edit, public post, or sharing change.
- Whether a popular example is usable. One example is not proof of a trend.

## Human check

I choose the project and send the request. A refresh click approves research and library additions for that request. Pip shows the references and original sources. I decide what to use before any project design or code changes. I can stop a queued or running request.

## Where it runs

[Open Design Shelf](https://design-shelf-vihaan.mv-vihaanmalik.chatgpt.site). The small Pip button opens its Codex conversation. The local bridge uses my existing Codex login; my PC must be online. A separate desktop chat, **Pip · Design Shelf**, is available for follow-ups. The two conversations do not mirror each other.

This is an extra Project 3 agent. It does not replace the Technologist agent or its approval check.

## Part A evidence

The comparison at `outputs/pip/run-comparison.md` uses a new baseline of the original Step 2 source-check instruction and a separate run with Pip's role. It checks this smaller task only. There is no historical Project 2 Pip run.
