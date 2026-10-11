# idea.quest chat + project status · feasibility only

Checked 2026-10-11. This is a side exploration, not an approved new route or a built feature. The Three.js potion room remains at **2/5 approved gates**; Step 3 visual review is paused. The current public idea.quest site stays live and unchanged.

## What exists now

- The public idea.quest is a read-only mirror of `progress-arcade/projects.json` via the public GitHub vault repository. It displays recorded status after sync/polling, but has no prompt endpoint or way to run a local agent. The separate Vercel copy is a static snapshot.
- The editable local tracker binds to `127.0.0.1` on this Windows computer. It can record project updates, not chat with Claudian/Codex.
- Both `realclaudian` and `claudian-plus` are enabled in this vault. The installed Codex CLI is `0.154.0` and exposes `exec`, `app-server`, and session commands. I did not open plugin data/auth files or test session-sharing. The installed plugin manifests describe local Obsidian desktop integration, not a public web service.

## Can the website use it?

**Yes, as a new integration; no, not by embedding the Obsidian extension directly.** Claudian's UI lives inside desktop Obsidian with local vault access. A public browser page cannot directly operate that desktop process or its localhost server (a phone's `localhost` means the phone). Codex does offer a client-facing app-server protocol with thread/turn events, so a separate local bridge could power a website chat. This would be a *new Codex client*, not automatically the exact same live Claudian panel or conversation. Cross-client continuity/session mapping must be tested before promising it.

### Routes

| Route | What the user gets | Boundary / effort |
| --- | --- | --- |
| **A · Status-only first** | Project bars, latest recorded move, and a clearly labelled “last synced” status on the public site. | Most of this already exists. Does not send prompts or infer live agent activity. Small UI/data improvement. |
| **B · Local owner chat spike (recommended first test)** | On this Windows computer, an owner-only local page submits a bounded prompt to a local bridge; the bridge uses Codex with this vault as working directory and streams or returns a result. | No public/phone access. Separate conversation initially. Avoids remote-access security while testing whether the prompt/status loop is useful. Roughly a day or more including approvals and UI; estimate only. |
| **C · Remote owner chat + status** | Sign in on the public website, prompt from a phone, and inspect queued/running/needs-approval/done results. A Windows companion process polls an authenticated job service outbound and invokes Codex locally. | Needs owner authentication, a backend/queue, durable job IDs, explicit action approvals, safe result publishing, error/offline states, rate limits, and credential isolation. Several days or more, not a simple plugin toggle. Windows must be awake and online for local-vault work. |
| **D · Cloud AI chat without local bridge** | A server-side model can answer prompts anywhere. | It cannot operate the same local Obsidian vault or Claudian session unless files/work are separately and deliberately synchronized; server credentials must never be sent to the browser. Not the requested connected-agent behavior by itself. |

**Architecture for C (inference, not yet built):** owner-authenticated web chat → private job/status store → Windows companion polls outbound → Codex app-server/CLI working in the vault → return a reviewed, redacted answer/status. Public visitors see only intentionally published project status; owner-only chat and raw agent output stay private. No incoming port to the computer is necessary if polling is used. Do **not** expose the existing local tracker port, Obsidian internals, Codex auth, or vault files on the public site.

## Smallest useful test and decisions

1. Decide whether the first goal is **status viewing**, **prompts while on this PC**, or **remote prompts from a phone**. Also decide whether a *new Codex conversation using the same vault* is acceptable; controlling the exact current Claudian conversation is unverified.
2. If chat is desired, first run a private local spike on a disposable test vault: one prompt, a visible queued/running/done/failed state, one human approval before any write, and a deliberately declined approval. Check that no auth token or private note appears in browser source or public registry.
3. Only after that, consider a protected remote bridge. Test offline Windows behavior, authentication, cancellation, job duplication, approval timeout, and what status can safely be shared. Keep the existing public site and records unchanged until explicit approval.

**Evidence:** [Claudian's upstream README](https://github.com/YishenTu/claudian) describes a desktop Obsidian agent with Codex and session management. [OpenAI's Codex app-server documentation](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) documents client `thread/start`, `turn/start`, streamed events, and `thread/resume`. [OpenAI's Codex platform article](https://developers.openai.com/blog/codex-as-a-platform) describes app-server approval handling. These establish an integration route, not that this installed Claudian version exposes an external chat API or that cross-client sessions synchronize.

## Scope clarification · 2026-10-11

The user said the website chat **does not need to be the exact same session** if it has the context and understanding of the work; connection to this conversation is preferred. This resolves the session-identity question but **does not approve a build, remote access, or a new workflow gate**.

**Recommended context strategy:** start a distinct Codex thread rooted in this vault, and give it a small, explicit context handoff rather than claiming automatic memory. The handoff should identify the active project and point to `00-start-here.md`, `progress.md`, `progress-arcade/projects.json`, the relevant approved output/step notes, and the recent AI-use-log entries. For each website prompt, include the selected project ID and current recorded status; refresh that context from the vault before a new job. Store any website conversation under an explicit local thread ID. Do not silently upload the whole vault or the private Claudian transcript into the public site. A short, user-reviewed summary of this conversation can supplement the handoff; direct reuse of Claudian's current thread can be a later compatibility test, not a prerequisite.

**Acceptance test for “understands our work”:** With a new thread and a read-only local bridge, ask which idea.quest gates are approved, what the paused 3D prototype is, why the public tracker must remain live, and what requires user approval next. It should answer **2/5, Step 3 unapproved**, cite the right vault records, and make no file edit or gate change. Then change a *test copy* of one status and verify a new prompt sees the new value rather than relying on stale chat memory. Only after this passes should writable actions or phone access be considered.

**Next decision:** approve or revise this **local, context-aware, read-only chat spike**. Owner-only remote prompting remains a separate later decision. The installed Codex CLI exposes both `exec` with a working-root option and `app-server` with thread support; neither route has been exercised for this website yet.
